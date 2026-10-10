import type { Mission, Task } from "./types";
import { getMissionStore, type MissionStore } from "../persistence/store";
import { getTool } from "../tools/registry";

function now(): string {
  return new Date().toISOString();
}

// Platform Web Crypto (Node >= 19, all modern browsers). No `uuid`
// dependency is needed; a random id is used only as a rare fallback.
function newId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (typeof g.crypto?.randomUUID === "function") {
    return g.crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const UNFINISHED_STATUSES: Task["status"][] = ["pending", "running", "waiting_for_approval"];

export interface CreateMissionInput {
  title: string;
  objective: string;
  owner?: string;
  tasks?: Array<Partial<Task> & { title: string }>;
}

export class Orchestrator {
  private store: MissionStore;

  constructor(store?: MissionStore) {
    this.store = store ?? getMissionStore();
  }

  async createMission(input: CreateMissionInput): Promise<Mission> {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error("Mission title is required");
    }
    if (!input.objective || input.objective.trim().length === 0) {
      throw new Error("Mission objective is required");
    }

    const mission: Mission = {
      id: newId(),
      title: input.title,
      objective: input.objective,
      status: "queued",
      owner: input.owner ?? "Sourena",
      createdAt: now(),
      lastUpdatedAt: now(),
      tasks: [],
    };

    if (input.tasks && input.tasks.length > 0) {
      const ids = new Set<string>();
      for (const t of input.tasks) {
        const id = t.id ?? newId();
        if (ids.has(id)) {
          throw new Error(`Duplicate task id: ${id}`);
        }
        ids.add(id);
        const maxAttempts = t.maxAttempts ?? 3;
        if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
          throw new Error(
            `Task "${t.title}" maxAttempts must be a positive integer, got ${maxAttempts}`,
          );
        }
        const task: Task = {
          id,
          missionId: mission.id,
          title: t.title,
          status: t.status ?? "pending",
          dependsOn: t.dependsOn ?? [],
          attempts: 0,
          maxAttempts,
          createdAt: now(),
          lastUpdatedAt: now(),
        };
        if (t.description !== undefined) task.description = t.description;
        if (t.timeoutMs !== undefined) task.timeoutMs = t.timeoutMs;
        if (t.tool !== undefined) task.tool = t.tool;
        if (t.toolInput !== undefined) task.toolInput = t.toolInput;
        mission.tasks.push(task);
      }
      for (const task of mission.tasks) {
        for (const dep of task.dependsOn) {
          if (dep === task.id) {
            throw new Error(`Task "${task.title}" depends on itself`);
          }
          if (!ids.has(dep)) {
            throw new Error(`Task "${task.title}" depends on unknown task id: ${dep}`);
          }
        }
      }
    } else {
      const defaultTask: Task = {
        id: newId(),
        missionId: mission.id,
        title: "Analyze brand context",
        description: "Read memory and summarize brand state",
        status: "pending",
        dependsOn: [],
        attempts: 0,
        maxAttempts: 3,
        tool: "read-memory",
        createdAt: now(),
        lastUpdatedAt: now(),
      };
      mission.tasks.push(defaultTask);
    }

    await this.store.saveMission(mission);
    return mission;
  }

  async getMission(id: string): Promise<Mission | undefined> {
    return this.store.getMission(id);
  }

  async listMissions(): Promise<Mission[]> {
    return this.store.listMissions();
  }

  async startMission(id: string): Promise<Mission | undefined> {
    const mission = await this.store.getMission(id);
    if (!mission) return undefined;
    if (mission.status !== "queued") return mission;
    mission.status = "running";
    mission.startedAt = now();
    mission.lastUpdatedAt = now();
    await this.store.saveMission(mission);
    return mission;
  }

  async approveTask(missionId: string, taskId: string): Promise<Mission | undefined> {
    const mission = await this.store.getMission(missionId);
    if (!mission) return undefined;
    const task = mission.tasks.find((t) => t.id === taskId);
    if (!task || task.status !== "waiting_for_approval") return mission;
    task.status = "pending";
    task.approved = true;
    task.lastUpdatedAt = now();
    if (mission.status === "waiting_for_approval") {
      mission.status = "running";
      mission.lastUpdatedAt = now();
    }
    await this.store.saveMission(mission);
    return mission;
  }

  async stepMission(id: string): Promise<Mission | undefined> {
    const mission = await this.store.getMission(id);
    if (!mission || mission.status !== "running") return mission;

    const byId = new Map<string, Task>(mission.tasks.map((t): [string, Task] => [t.id, t]));

    // Skip pending tasks whose dependencies already failed or were skipped.
    for (const t of mission.tasks) {
      if (t.status !== "pending") continue;
      const blocked = t.dependsOn.some((dep) => {
        const status = byId.get(dep)?.status;
        return status === "failed" || status === "skipped";
      });
      if (blocked) {
        t.status = "skipped";
        t.error = "A dependency failed or was skipped";
        t.lastUpdatedAt = now();
      }
    }

    // A task is runnable only when every dependency completed successfully.
    const task = mission.tasks.find(
      (t) =>
        t.status === "pending" && t.dependsOn.every((dep) => byId.get(dep)?.status === "completed"),
    );

    if (!task) {
      const unfinished = mission.tasks.filter((t) => UNFINISHED_STATUSES.includes(t.status));
      if (unfinished.length > 0) {
        mission.status = "failed";
        mission.completedAt = now();
        mission.lastUpdatedAt = now();
        mission.report = `Mission failed: ${unfinished.length} task(s) blocked by unsatisfiable dependencies`;
        await this.store.saveMission(mission);
        return mission;
      }
      return this.finalize(mission);
    }

    const tool = task.tool ? getTool(task.tool) : undefined;
    if (!tool) {
      // A missing tool can never succeed on retry: fail fast with a
      // meaningful error instead of marking the task completed.
      task.error = `Tool "${task.tool}" is not registered`;
      task.status = "failed";
      task.lastUpdatedAt = now();
      return this.finalize(mission);
    }

    if (tool.requiresApproval && !task.approved) {
      task.status = "waiting_for_approval";
      task.lastUpdatedAt = now();
      mission.status = "waiting_for_approval";
      mission.lastUpdatedAt = now();
      await this.store.saveMission(mission);
      return mission;
    }

    const validation = tool.validate?.(task.toolInput);
    if (validation && !validation.valid) {
      // Validation errors are deterministic: retrying cannot help.
      task.attempts++;
      task.error = `Validation failed: ${validation.errors?.join("; ") || "invalid input"}`;
      task.status = "failed";
      task.lastUpdatedAt = now();
      return this.finalize(mission);
    }

    task.attempts++;
    task.startedAt = now();
    task.status = "running";
    task.lastUpdatedAt = now();
    await this.store.saveMission(mission);

    try {
      const output = await this.runWithTimeout(tool.execute(task.toolInput), task.timeoutMs);
      task.output = output;
      task.status = "completed";
      task.completedAt = now();
      task.lastUpdatedAt = now();
      // The tool returned without throwing, but execution alone does not
      // prove the result is correct: do not claim independent verification.
      task.verification = {
        passed: false,
        reason: "tool executed; result not independently verified",
        checkedAt: now(),
      };
    } catch (err) {
      task.error = err instanceof Error ? err.message : String(err);
      // Bounded retries: only retry while attempts remain.
      task.status = task.attempts >= task.maxAttempts ? "failed" : "pending";
      task.lastUpdatedAt = now();
    }

    return this.finalize(mission);
  }

  async cancelMission(id: string): Promise<Mission | undefined> {
    const mission = await this.store.getMission(id);
    if (!mission) return undefined;
    if (
      mission.status === "completed" ||
      mission.status === "failed" ||
      mission.status === "cancelled"
    ) {
      return mission;
    }
    mission.status = "cancelled";
    mission.lastUpdatedAt = now();
    for (const t of mission.tasks) {
      if (t.status === "pending" || t.status === "running" || t.status === "waiting_for_approval") {
        t.status = "cancelled";
        t.lastUpdatedAt = now();
      }
    }
    mission.report = "Mission cancelled";
    await this.store.saveMission(mission);
    return mission;
  }

  private async finalize(mission: Mission): Promise<Mission> {
    const unfinished = mission.tasks.filter((t) => UNFINISHED_STATUSES.includes(t.status));
    if (unfinished.length === 0) {
      const completed = mission.tasks.filter((t) => t.status === "completed");
      const failed = mission.tasks.filter((t) => t.status === "failed");
      const skipped = mission.tasks.filter((t) => t.status === "skipped");
      mission.status = failed.length > 0 ? "failed" : "completed";
      mission.completedAt = now();
      mission.lastUpdatedAt = now();
      mission.report =
        `Mission ${mission.status}. Tasks: ${mission.tasks.length}` +
        ` (completed: ${completed.length}, failed: ${failed.length}, skipped: ${skipped.length})` +
        (failed.length > 0
          ? `. Errors: ${failed
              .map((t) => `"${t.title}": ${t.error ?? "unknown error"}`)
              .join("; ")}`
          : "");
    }
    await this.store.saveMission(mission);
    return mission;
  }

  private async runWithTimeout(promise: Promise<unknown>, timeoutMs?: number): Promise<unknown> {
    if (!timeoutMs || timeoutMs <= 0) return promise;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Tool execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
