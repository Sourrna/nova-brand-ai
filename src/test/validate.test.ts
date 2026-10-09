import { describe, it, expect } from "vitest";
import { validateMemory, diffMemory } from "@/lib/validate";
import { memory } from "@/lib/memory";
import { parseChangelog, parseFields } from "@/lib/files";

describe("memory import validation", () => {
  it("accepts the current memory file", () => expect(validateMemory(memory).ok).toBe(true));
  it("rejects an unknown knowledge state", () => {
    const bad = { ...memory, records: [{ ...memory.records[0], state: "FACT" }] };
    expect(validateMemory(bad).ok).toBe(false);
  });
  it("rejects duplicate ids", () => {
    const bad = { ...memory, records: [memory.records[0], memory.records[0]] };
    expect(validateMemory(bad).ok).toBe(false);
  });
  it("rejects non-object input", () => expect(validateMemory([]).ok).toBe(false));
  it("diff detects removed records", () => {
    const next = { ...memory, records: memory.records.slice(1) };
    expect(diffMemory(memory, next).removed).toEqual([memory.records[0]?.id]);
  });
});

describe("file parsing", () => {
  it("parses project fields", () => {
    const p = parseFields("# Project: X\n- Status: Phase 1\n- Evidence: repo");
    expect(p).toEqual({ title: "X", fields: { status: "Phase 1", evidence: "repo" } });
  });
  it("parses changelog entries", () => {
    expect(parseChangelog("# C\n## 2026-10-08 — Phase 2\n- a\n- b")[0]).toEqual({ date: "2026-10-08", title: "Phase 2", items: ["a", "b"] });
  });
});
