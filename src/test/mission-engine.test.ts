import { describe, it, expect, beforeEach } from "vitest";
import { Orchestrator } from "@/lib/engine/orchestrator";
import { InMemoryMissionStore } from "@/lib/persistence/store";
import { registerTool, getTool, listTools, hasTool } from "@/lib/tools";
import { filterForExport } from "@/lib/memory";
import { memoryStore } from "@/lib/store";

const failTwice = { calls: 0 };
const validations = { executions: 0 };
const approvals = { executions: 0 };

interface MemoryStats {
  schemaVersion: number;
  snapshotVersion: number;
  updatedAt: string;
  owner: string;
  recordCount: number;
  contentCount: number;
  accountsCount: number;
  publicRecordCount: number;
  publicContentCount: number;
}

registerTool({
  name: "test-echo",
  description: "Echoes its input",
  async execute(input) {
    return { echoed: input };
  },
});

registerTool({
  name: "test-always-fails",
  description: "Always throws",
  async execute() {
    throw new Error("boom");
  },
});

registerTool({
  name: "test-fails-twice",
  description: "Fails twice, then succeeds",
  async execute() {
    failTwice.calls++;
    if (failTwice.calls < 3) throw new Error("transient failure");
    return "recovered";
  },
});

registerTool({
  name: "test-validates",
  description: "Requires a string value",
  validate(input) {
    if (typeof input !== "object" || input === null) {
      return { valid: false, errors: ["input.value must be a string"] };
    }
    if (typeof (input as { value?: unknown }).value !== "string") {
      return { valid: false, errors: ["input.value must be a string"] };
    }
    return { valid: true };
  },
  async execute() {
    validations.executions++;
    return "validated";
  },
});

registerTool({
  name: "test-approval-required",
  description: "Requires explicit approval",
  requiresApproval: true,
  async execute() {
    approvals.executions++;
    return "approved-output";
  },
});

registerTool({
  name: "test-slow",
  description: "Exceeds any test timeout",
  async execute() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return "slow-output";
  },
});

describe("mission engine", () => {
  beforeEach(() => {
    failTwice.calls = 0;
    validations.executions = 0;
    approvals.executions = 0;
  });

  it("creates a mission with a default read-memory task", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({ title: "Test", objective: "Test objective" });
    expect(m.status).toBe("queued");
    expect(m.tasks.length).toBe(1);
    const task = m.tasks[0];
    expect(task?.title).toBe("Analyze brand context");
    expect(task?.tool).toBe("read-memory");
    expect(task?.maxAttempts).toBe(3);
  });

  it("startMission transitions queued to running and is idempotent", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({ title: "T", objective: "O" });
    const started = await orch.startMission(m.id);
    expect(started?.status).toBe("running");
    const again = await orch.startMission(m.id);
    expect(again?.status).toBe("running");
  });

  it("stepMission leaves a queued mission untouched", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({ title: "T", objective: "O" });
    const stepped = await orch.stepMission(m.id);
    expect(stepped?.status).toBe("queued");
  });

  it("executes a task successfully and completes the mission", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [{ id: "a", title: "Echo", tool: "test-echo", toolInput: { x: 1 } }],
    });
    await orch.startMission(m.id);
    const after = await orch.stepMission(m.id);
    expect(after?.status).toBe("completed");
    const task = after?.tasks[0];
    expect(task?.status).toBe("completed");
    expect(task?.output).toEqual({ echoed: { x: 1 } });
    expect(task?.attempts).toBe(1);
    // Execution alone is not claimed as independent verification.
    expect(task?.verification?.passed).toBe(false);
    expect(task?.verification?.reason).toMatch(/not independently verified/);
  });

  it("read-memory reads the live store and exposes only aggregate counts", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({ title: "T", objective: "O" });
    await orch.startMission(m.id);
    const after = await orch.stepMission(m.id);
    const out = after?.tasks[0]?.output as MemoryStats | undefined;
    const live = memoryStore.get();
    expect(out?.recordCount).toBe(live.records.length);
    expect(out?.contentCount).toBe(live.content.length);
    expect(out?.accountsCount).toBe(live.accounts.length);
    expect(out?.publicRecordCount).toBe(filterForExport(live, "public").records.length);
    expect(out?.publicContentCount).toBe(filterForExport(live, "public").content.length);
    expect("records" in (out ?? {})).toBe(false);

    try {
      memoryStore.update((prev) => ({
        ...prev,
        records: [
          ...prev.records,
          {
            id: "probe-public",
            domain: "probe",
            title: "Probe",
            value: "v",
            state: "VERIFIED",
            visibility: "PUBLIC",
            source: "probe",
          },
        ],
      }));
      const m2 = await orch.createMission({ title: "T2", objective: "O2" });
      await orch.startMission(m2.id);
      const after2 = await orch.stepMission(m2.id);
      const out2 = after2?.tasks[0]?.output as MemoryStats | undefined;
      expect(out2?.recordCount).toBe(live.records.length + 1);
      expect(out2?.publicRecordCount).toBe(filterForExport(live, "public").records.length + 1);
    } finally {
      memoryStore.reset();
    }
  });

  it("fails a task safely when its named tool is missing", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [{ id: "a", title: "Ghost", tool: "no-such-tool" }],
    });
    await orch.startMission(m.id);
    const after = await orch.stepMission(m.id);
    expect(after?.status).toBe("failed");
    const task = after?.tasks[0];
    expect(task?.status).toBe("failed");
    expect(task?.attempts).toBe(0);
    expect(task?.error).toContain("no-such-tool");
    expect(task?.error).toContain("not registered");
    expect(task?.output).toBeUndefined();
    expect(after?.report).toContain("Ghost");
    expect(after?.report).toContain("no-such-tool");
  });

  it("fails a task on validation errors without executing the tool", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [{ id: "a", title: "Bad input", tool: "test-validates", toolInput: { value: 42 } }],
    });
    await orch.startMission(m.id);
    const after = await orch.stepMission(m.id);
    expect(after?.status).toBe("failed");
    const task = after?.tasks[0];
    expect(task?.status).toBe("failed");
    expect(task?.error).toContain("input.value must be a string");
    expect(validations.executions).toBe(0);
  });

  it("bounds retries: a failing task stops after maxAttempts", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [{ id: "a", title: "Retry", tool: "test-always-fails", maxAttempts: 3 }],
    });
    await orch.startMission(m.id);
    let after = await orch.stepMission(m.id);
    expect(after?.status).toBe("running");
    expect(after?.tasks[0]?.attempts).toBe(1);
    expect(after?.tasks[0]?.status).toBe("pending");
    after = await orch.stepMission(m.id);
    expect(after?.tasks[0]?.attempts).toBe(2);
    after = await orch.stepMission(m.id);
    const task = after?.tasks[0];
    expect(task?.attempts).toBe(3);
    expect(task?.status).toBe("failed");
    expect(task?.error).toBe("boom");
    expect(after?.status).toBe("failed");
    expect(after?.report).toContain("boom");
  });

  it("respects a custom maxAttempts of 1", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [{ id: "a", title: "Once", tool: "test-always-fails", maxAttempts: 1 }],
    });
    await orch.startMission(m.id);
    const after = await orch.stepMission(m.id);
    expect(after?.tasks[0]?.attempts).toBe(1);
    expect(after?.tasks[0]?.status).toBe("failed");
    expect(after?.status).toBe("failed");
  });

  it("retries transient failures and completes when the tool recovers", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [{ id: "a", title: "Flaky", tool: "test-fails-twice" }],
    });
    await orch.startMission(m.id);
    const s1 = await orch.stepMission(m.id);
    expect(s1?.status).toBe("running");
    expect(s1?.tasks[0]?.status).toBe("pending");
    const s2 = await orch.stepMission(m.id);
    expect(s2?.tasks[0]?.status).toBe("pending");
    const s3 = await orch.stepMission(m.id);
    const task = s3?.tasks[0];
    expect(task?.status).toBe("completed");
    expect(task?.attempts).toBe(3);
    expect(task?.output).toBe("recovered");
    expect(s3?.status).toBe("completed");
  });

  it("runs dependencies first; dependents are not runnable until deps complete", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [
        { id: "b", title: "Second", dependsOn: ["a"], tool: "test-echo" },
        { id: "a", title: "First", tool: "test-echo" },
      ],
    });
    await orch.startMission(m.id);
    const s1 = await orch.stepMission(m.id);
    expect(s1?.status).toBe("running");
    expect(s1?.tasks.find((t) => t.id === "a")?.status).toBe("completed");
    const dependent = s1?.tasks.find((t) => t.id === "b");
    expect(dependent?.status).toBe("pending");
    expect(dependent?.attempts).toBe(0);
    const s2 = await orch.stepMission(m.id);
    expect(s2?.status).toBe("completed");
    expect(s2?.tasks.find((t) => t.id === "b")?.status).toBe("completed");
  });

  it("skips dependents when a dependency fails", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [
        { id: "a", title: "Root", tool: "test-always-fails", maxAttempts: 1 },
        { id: "b", title: "Dependent", dependsOn: ["a"], tool: "test-echo" },
      ],
    });
    await orch.startMission(m.id);
    const s1 = await orch.stepMission(m.id);
    expect(s1?.status).toBe("running");
    const s2 = await orch.stepMission(m.id);
    expect(s2?.status).toBe("failed");
    const dependent = s2?.tasks.find((t) => t.id === "b");
    expect(dependent?.status).toBe("skipped");
    expect(dependent?.attempts).toBe(0);
    expect(dependent?.error).toMatch(/dependency failed or was skipped/);
    expect(s2?.report).toContain("skipped: 1");
  });

  it("fails the mission safely when dependencies are unsatisfiable (cycle)", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [
        { id: "a", title: "A", dependsOn: ["b"], tool: "test-echo" },
        { id: "b", title: "B", dependsOn: ["a"], tool: "test-echo" },
      ],
    });
    await orch.startMission(m.id);
    const after = await orch.stepMission(m.id);
    expect(after?.status).toBe("failed");
    expect(after?.report).toMatch(/unsatisfiable dependencies/);
  });

  it("cancels the mission and its unfinished tasks", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [
        { id: "a", title: "Done", tool: "test-echo" },
        { id: "b", title: "Pending", tool: "test-echo" },
      ],
    });
    await orch.startMission(m.id);
    await orch.stepMission(m.id);
    const cancelled = await orch.cancelMission(m.id);
    expect(cancelled?.status).toBe("cancelled");
    expect(cancelled?.report).toBe("Mission cancelled");
    expect(cancelled?.tasks.find((t) => t.id === "a")?.status).toBe("completed");
    expect(cancelled?.tasks.find((t) => t.id === "b")?.status).toBe("cancelled");
    const again = await orch.cancelMission(m.id);
    expect(again?.status).toBe("cancelled");
  });

  it("parks approval-required tasks and resumes them after approval", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [{ id: "a", title: "Guarded", tool: "test-approval-required" }],
    });
    await orch.startMission(m.id);
    const parked = await orch.stepMission(m.id);
    expect(parked?.status).toBe("waiting_for_approval");
    expect(parked?.tasks[0]?.status).toBe("waiting_for_approval");
    expect(approvals.executions).toBe(0);
    const still = await orch.stepMission(m.id);
    expect(still?.status).toBe("waiting_for_approval");
    const resumed = await orch.approveTask(m.id, "a");
    expect(resumed?.status).toBe("running");
    expect(resumed?.tasks[0]?.status).toBe("pending");
    const done = await orch.stepMission(m.id);
    expect(done?.status).toBe("completed");
    expect(done?.tasks[0]?.status).toBe("completed");
    expect(approvals.executions).toBe(1);
  });

  it("fails a task when execution exceeds its timeout", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    const m = await orch.createMission({
      title: "T",
      objective: "O",
      tasks: [{ id: "a", title: "Slow", tool: "test-slow", timeoutMs: 20, maxAttempts: 1 }],
    });
    await orch.startMission(m.id);
    const after = await orch.stepMission(m.id);
    const task = after?.tasks[0];
    expect(task?.status).toBe("failed");
    expect(task?.error).toMatch(/timed out after 20ms/);
    expect(after?.status).toBe("failed");
  });

  it("validates mission input and dependency references", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    await expect(orch.createMission({ title: "", objective: "O" })).rejects.toThrow(/title/);
    await expect(orch.createMission({ title: "T", objective: "" })).rejects.toThrow(/objective/);
    await expect(
      orch.createMission({
        title: "T",
        objective: "O",
        tasks: [{ id: "a", title: "A", dependsOn: ["ghost"] }],
      }),
    ).rejects.toThrow(/unknown task id/);
    await expect(
      orch.createMission({
        title: "T",
        objective: "O",
        tasks: [{ id: "a", title: "A", dependsOn: ["a"] }],
      }),
    ).rejects.toThrow(/depends on itself/);
    await expect(
      orch.createMission({
        title: "T",
        objective: "O",
        tasks: [{ id: "a", title: "A", maxAttempts: 0 }],
      }),
    ).rejects.toThrow(/maxAttempts/);
    await expect(
      orch.createMission({
        title: "T",
        objective: "O",
        tasks: [
          { id: "a", title: "A" },
          { id: "a", title: "B" },
        ],
      }),
    ).rejects.toThrow(/Duplicate task id/);
  });

  it("lists missions and returns undefined for unknown ids", async () => {
    const orch = new Orchestrator(new InMemoryMissionStore());
    await orch.createMission({ title: "T1", objective: "O1" });
    await orch.createMission({ title: "T2", objective: "O2" });
    const list = await orch.listMissions();
    expect(list.length).toBe(2);
    expect(await orch.getMission("nope")).toBeUndefined();
  });

  it("deletes missions from the store", async () => {
    const store = new InMemoryMissionStore();
    const orch = new Orchestrator(store);
    const m = await orch.createMission({ title: "T", objective: "O" });
    await store.deleteMission(m.id);
    expect(await orch.getMission(m.id)).toBeUndefined();
  });
});

describe("tool registry", () => {
  it("registers tools explicitly and exposes them by name", async () => {
    registerTool({
      name: "test-registry-probe",
      description: "probe",
      async execute() {
        return 1;
      },
    });
    expect(hasTool("test-registry-probe")).toBe(true);
    expect(getTool("test-registry-probe")?.description).toBe("probe");
    expect(getTool("never-registered")).toBeUndefined();
    expect(listTools().some((t) => t.name === "read-memory")).toBe(true);
    expect(listTools().some((t) => t.name === "test-registry-probe")).toBe(true);
  });
});
