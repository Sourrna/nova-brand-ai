import { describe, expect, it } from "vitest";
import { filterForExport, memory, type Memory } from "@/lib/memory";
import { draftMarkdown, projects } from "@/lib/files";

const record = (id: string) => {
  const found = memory.records.find((r) => r.id === id);
  if (!found) throw new Error(`Missing record ${id}`);
  return found;
};

describe("owner profile rules", () => {
  it("keeps public professional name owner-provided", () => {
    expect(record("id-001").value).toBe("Sourena");
    expect(record("id-001").state).toBe("USER_PROVIDED");
  });
  it("does not guess Persian spelling", () => expect(record("id-002").state).toBe("NEEDS_CONFIRMATION"));
  it("keeps five-year directions as unverified aspirations", () => {
    expect(record("goal-001").value).toBe("Computer Engineer; AI/ML specialist; AI product builder; technology/startup founder.");
    expect(record("goal-001").state).toBe("USER_PROVIDED");
    expect(record("goal-001").visibility).toBe("INTERNAL_STRATEGY");
  });
  it.each([
    ["Python", 2], ["C/C++", 1], ["C#/.NET", 1], ["JavaScript/TypeScript", 3],
    ["HTML/CSS", 3], ["Git/GitHub", 2], ["Algorithms/data structures", 4],
    ["SQL/databases", 2], ["API/backend", 2], ["Frontend", 4], ["AI/LLMs", 4],
    ["Machine learning", 4], ["Deep learning", 1], ["Linux/CLI", 0], ["Product/UX", 4],
    ["Idea/business validation", 3], ["Technical writing", 3], ["Technical English", 3],
  ])("preserves %s self-rating %i/4 without verified/public promotion", (title, rating) => {
    const skill = memory.records.find((r) => r.domain === "skill" && r.title === title);
    expect(skill?.value).toBe(`Owner self-rating: ${rating}/4.`);
    expect(skill?.state).toBe("USER_PROVIDED");
    expect(skill?.visibility).toBe("INTERNAL_STRATEGY");
  });
  it.each(["proj-001", "proj-002", "proj-005"])("keeps %s private and out of public sources", (id) => {
    expect(record(id).visibility).toBe("PRIVATE");
    expect(record(id).state).toBe("USER_PROVIDED");
    expect(filterForExport(memory, "public").records.map((r) => r.id)).not.toContain(id);
  });
  it.each(["proj-006", "proj-007"])("keeps book %s in progress, not published", (id) => {
    expect(record(id).value).toContain("IN_PROGRESS");
    expect(record(id).state).toBe("USER_PROVIDED");
  });
  it("requires opt-in confirmation for progress logging", () => {
    expect(record("rule-005").state).toBe("NEEDS_CONFIRMATION");
    expect(record("rule-005").value).toContain("opt-in");
  });
  it("does not invent strengths, education, OS/hardware or platform handles", () => {
    for (const id of ["pref-006", "q-002", "q-003", "q-005"]) expect(record(id).state).toBe("NEEDS_CONFIRMATION");
  });
  it("distinguishes project sync from GitHub API access and leaves LinkedIn disconnected", () => {
    expect(memory.accounts.find((a) => a.id === "github")?.status).toBe("PROJECT_SYNC_REPORTED_API_NOT_CONNECTED");
    expect(memory.accounts.find((a) => a.id === "linkedin")?.status).toBe("NOT_CONNECTED");
  });
  it("requires approval even for routine branding and file edits", () => {
    const rule = record("rule-002");
    expect(rule.value).toContain("routine professional/branding posts");
    expect(rule.value).toContain("project file creation/edits");
    expect(rule.value).toContain("LinkedIn publication/profile edits");
  });
  it("excludes indirect private, inferred and orphan content from exports", () => {
    const fixture: Memory = { ...memory, content: [
      { id: "private", stage: "idea", title: "Confidential", pillar: "test", sourceRecord: "proj-001" },
      { id: "public", stage: "idea", title: "Name", pillar: "test", sourceRecord: "id-001" },
      { id: "orphan", stage: "draft", title: "Orphan", pillar: "test", sourceRecord: "missing" },
    ] };
    expect(filterForExport(fixture, "public").content.map((c) => c.id)).toEqual(["public"]);
    expect(filterForExport(fixture, "nova").content.map((c) => c.id)).toEqual(["public"]);
    expect(filterForExport(fixture, "public").accounts).toEqual([]);
  });
  it("keeps private project files private and owner-reported", () => {
    for (const id of ["proj-001", "proj-002", "proj-005"]) {
      const project = projects.find((p) => p.fields["memory record"] === id);
      expect(project?.fields["visibility"]).toBe("PRIVATE");
      expect(project?.fields["state"]).toBe("USER_PROVIDED");
    }
  });
  it("makes generated drafts internal and unverified by default", () => {
    const md = draftMarkdown({ title: "Example", pillar: "Work", source: "id-001", body: "Draft" });
    expect(md).toContain("- State: INFERRED");
    expect(md).toContain("- Visibility: INTERNAL_STRATEGY");
    expect(md).toContain("- Publication approval: REQUIRED");
  });
});