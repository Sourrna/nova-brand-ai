import { describe, it, expect } from "vitest";
import { filterForExport, type Memory } from "@/lib/memory";

const m: Memory = {
  schemaVersion: 1, snapshotVersion: 1, updatedAt: "x", owner: "S", content: [], accounts: [],
  records: [
    { id: "a", domain: "d", title: "", value: "", state: "VERIFIED", visibility: "PUBLIC", source: "u" },
    { id: "b", domain: "d", title: "", value: "", state: "INFERRED", visibility: "PUBLIC", source: "u" },
    { id: "c", domain: "d", title: "", value: "", state: "USER_PROVIDED", visibility: "INTERNAL_STRATEGY", source: "u" },
    { id: "d", domain: "d", title: "", value: "", state: "USER_PROVIDED", visibility: "PRIVATE", source: "u" },
    { id: "e", domain: "d", title: "", value: "", state: "VERIFIED", visibility: "SENSITIVE", source: "u" },
  ],
};
const ids = (s: "public" | "nova" | "full") => filterForExport(m, s).records.map((r) => r.id);

describe("memory export rules", () => {
  it("public export excludes inferred and non-public records", () => expect(ids("public")).toEqual(["a"]));
  it("nova export includes internal strategy but not private", () => expect(ids("nova")).toEqual(["a", "b", "c"]));
  it("sensitive is never exported", () => expect(ids("full")).not.toContain("e"));
});
