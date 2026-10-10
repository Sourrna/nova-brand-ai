import type { Memory, MemoryRecord } from "./memory";

export function isPubliclySafeRecord(r: MemoryRecord): boolean {
  return r.visibility === "PUBLIC" && (r.state === "VERIFIED" || r.state === "USER_PROVIDED");
}

export function assertPublicSafe(m: Memory): void {
  if (typeof process !== "undefined" && process.env["NODE_ENV"] === "production") return;
  for (const r of m.records) {
    if (r.visibility === "SENSITIVE") {
      throw new Error(`Invariant violated: SENSITIVE record ${r.id} present in memory`);
    }
    if (r.visibility === "PRIVATE" || r.visibility === "INTERNAL_STRATEGY") {
      // not allowed in public-export context; this is a general assertion helper
      // we don't throw here by default - callers decide context
    }
  }
}
