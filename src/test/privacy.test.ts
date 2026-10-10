import { describe, it, expect } from "vitest";
import { filterForExport, toMarkdown, type Memory } from "@/lib/memory";

const base: Memory = {
  schemaVersion: 1,
  snapshotVersion: 1,
  updatedAt: "2026-10-09",
  owner: "Sourena",
  records: [],
  content: [],
  accounts: [],
};

describe("memory export", () => {
  it("public export only includes PUBLIC and VERIFIED/USER_PROVIDED", () => {
    const m: Memory = {
      ...base,
      records: [
        {
          id: "p1",
          domain: "brand",
          title: "Public",
          value: "v",
          state: "VERIFIED",
          visibility: "PUBLIC",
          source: "s",
        },
        {
          id: "p2",
          domain: "brand",
          title: "Public2",
          value: "v",
          state: "USER_PROVIDED",
          visibility: "PUBLIC",
          source: "s",
        },
        {
          id: "i1",
          domain: "brand",
          title: "Internal",
          value: "v",
          state: "VERIFIED",
          visibility: "INTERNAL_STRATEGY",
          source: "s",
        },
        {
          id: "s1",
          domain: "brand",
          title: "Sensitive",
          value: "v",
          state: "VERIFIED",
          visibility: "SENSITIVE",
          source: "s",
        },
        {
          id: "pr1",
          domain: "brand",
          title: "Private",
          value: "v",
          state: "VERIFIED",
          visibility: "PRIVATE",
          source: "s",
        },
      ],
      accounts: [{ id: "github", role: "r", status: "s" }],
    };
    const pub = filterForExport(m, "public");
    expect(pub.records.map((r) => r.id).sort()).toEqual(["p1", "p2"]);
    expect(pub.accounts).toEqual([]);
    expect(toMarkdown(pub, "public")).not.toMatch(/Internal|Sensitive|Private/);
  });

  it("public export filters out INFERRED/NEEDS_CONFIRMATION even if PUBLIC", () => {
    const m: Memory = {
      ...base,
      records: [
        {
          id: "i",
          domain: "brand",
          title: "Inf",
          value: "v",
          state: "INFERRED",
          visibility: "PUBLIC",
          source: "s",
        },
        {
          id: "n",
          domain: "brand",
          title: "Need",
          value: "v",
          state: "NEEDS_CONFIRMATION",
          visibility: "PUBLIC",
          source: "s",
        },
      ],
    };
    const pub = filterForExport(m, "public");
    expect(pub.records.length).toBe(0);
  });

  it("content filtered by sourceRecord", () => {
    const m: Memory = {
      ...base,
      records: [
        {
          id: "r1",
          domain: "brand",
          title: "R1",
          value: "v",
          state: "VERIFIED",
          visibility: "PUBLIC",
          source: "s",
        },
      ],
      content: [
        { id: "c1", stage: "draft", title: "C1", pillar: "p", sourceRecord: "r1" },
        { id: "c2", stage: "draft", title: "C2", pillar: "p", sourceRecord: "missing" },
      ],
    };
    const pub = filterForExport(m, "public");
    expect(pub.content.map((c) => c.id)).toEqual(["c1"]);
  });

  it("nova includes INTERNAL_STRATEGY; accounts preserved", () => {
    const m: Memory = {
      ...base,
      records: [
        {
          id: "p",
          domain: "brand",
          title: "P",
          value: "v",
          state: "VERIFIED",
          visibility: "PUBLIC",
          source: "s",
        },
        {
          id: "i",
          domain: "brand",
          title: "I",
          value: "v",
          state: "INFERRED",
          visibility: "INTERNAL_STRATEGY",
          source: "s",
        },
      ],
      accounts: [{ id: "github", role: "r", status: "s" }],
    };
    const nova = filterForExport(m, "nova");
    expect(nova.records.map((r) => r.id).sort()).toEqual(["i", "p"]);
    expect(nova.accounts.length).toBe(1);
  });

  it("full excludes SENSITIVE only", () => {
    const m: Memory = {
      ...base,
      records: [
        {
          id: "pr",
          domain: "brand",
          title: "Pr",
          value: "v",
          state: "VERIFIED",
          visibility: "PRIVATE",
          source: "s",
        },
        {
          id: "s",
          domain: "brand",
          title: "S",
          value: "v",
          state: "VERIFIED",
          visibility: "SENSITIVE",
          source: "s",
        },
      ],
    };
    const full = filterForExport(m, "full");
    expect(full.records.map((r) => r.id)).toEqual(["pr"]);
  });
});
