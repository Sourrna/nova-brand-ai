import type { Memory } from "./memory";

const STATES = ["VERIFIED", "USER_PROVIDED", "INFERRED", "NEEDS_CONFIRMATION"];
const VIS = ["PUBLIC", "INTERNAL_STRATEGY", "PRIVATE", "SENSITIVE"];

export type ValidationResult = { ok: true; memory: Memory } | { ok: false; errors: string[] };

/** Strict structural validation of a Memory Core file. Nothing is applied unless ok. */
export function validateMemory(input: unknown): ValidationResult {
  const e: string[] = [];
  const m = input as Record<string, unknown>;
  if (!m || typeof m !== "object" || Array.isArray(m))
    return { ok: false, errors: ["Root must be an object"] };
  if (m["schemaVersion"] !== 1) e.push("schemaVersion must be 1");
  if (typeof m["snapshotVersion"] !== "number") e.push("snapshotVersion must be a number");
  if (typeof m["updatedAt"] !== "string") e.push("updatedAt must be a string");
  if (typeof m["owner"] !== "string") e.push("owner must be a string");
  for (const k of ["records", "content", "accounts"])
    if (!Array.isArray(m[k])) e.push(`${k} must be an array`);
  if (Array.isArray(m["records"])) {
    const seen = new Set<string>();
    m["records"].forEach((r: Record<string, unknown>, i: number) => {
      const at = `records[${i}]`;
      for (const f of ["id", "domain", "title", "value", "source"])
        if (typeof r?.[f] !== "string") e.push(`${at}.${f} must be a string`);
      if (!STATES.includes(r?.["state"] as string)) e.push(`${at}.state invalid`);
      if (!VIS.includes(r?.["visibility"] as string)) e.push(`${at}.visibility invalid`);
      if (typeof r?.["id"] === "string") {
        if (seen.has(r["id"])) e.push(`duplicate id ${r["id"]}`);
        seen.add(r["id"]);
      }
    });
  }
  return e.length ? { ok: false, errors: e } : { ok: true, memory: input as Memory };
}

export interface MemoryDiff {
  added: string[];
  removed: string[];
  changed: string[];
}
export function diffMemory(a: Memory, b: Memory): MemoryDiff {
  const A = new Map(a.records.map((r) => [r["id"], JSON.stringify(r)]));
  const B = new Map(b.records.map((r) => [r["id"], JSON.stringify(r)]));
  return {
    added: [...B.keys()].filter((k) => !A.has(k)),
    removed: [...A.keys()].filter((k) => !B.has(k)),
    changed: [...B.keys()].filter((k) => A.has(k) && A.get(k) !== B.get(k)),
  };
}
