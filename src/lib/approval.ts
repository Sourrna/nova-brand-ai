import type { ContentItem, ExportScope, MemoryRecord } from "./memory";

function canonicalize(obj: unknown): string {
  const seen = new WeakSet();
  const stringify = (val: unknown): unknown => {
    if (val === null || typeof val !== "object") {
      if (typeof val === "string") return val.trim();
      return val;
    }
    if (seen.has(val as object)) return "";
    seen.add(val as object);
    if (Array.isArray(val)) return val.map(stringify);
    const keys = Object.keys(val as Record<string, unknown>).sort();
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      out[k] = stringify((val as Record<string, unknown>)[k]);
    }
    return out;
  };
  return JSON.stringify(stringify(obj));
}

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  if (typeof globalThis.crypto?.subtle !== "undefined") {
    const buf = await globalThis.crypto.subtle.digest("SHA-256", data);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if (byte === undefined) continue;
    h ^= byte;
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export interface ApprovalBinding {
  platform?: string | null;
  approvedScope?: ExportScope | null;
  body?: string | null;
  claims?: string[] | null;
  version?: string | null;
  title?: string | null;
}

export interface ApprovalMeta {
  approvedBy: "Sourena";
  approvedAt: string;
  approvedScope: ExportScope | null;
  approvedPlatform: string | null;
  approvedVersion: string | null;
}

export async function computeApprovalHash(binding: ApprovalBinding): Promise<string> {
  const payload = {
    platform: binding.platform ?? null,
    approvedScope: binding.approvedScope ?? null,
    body: binding.body ?? "",
    claims: Array.isArray(binding.claims) ? [...binding.claims].sort() : [],
    version: binding.version ?? null,
    title: binding.title ?? null,
  };
  const canon = canonicalize(payload);
  return sha256(canon);
}

export function invalidateApproval(item: ContentItem | MemoryRecord): void {
  item.publicationApproved = false;
  delete item.approvedAt;
  delete item.approvedBy;
  delete item.approvedScope;
  delete item.approvedPlatform;
  delete item.approvedVersion;
  delete item.approvalHash;
}

export async function approve(
  item: ContentItem | MemoryRecord,
  binding: ApprovalBinding,
  meta: ApprovalMeta,
): Promise<void> {
  const hash = await computeApprovalHash(binding);
  item.publicationApproved = true;
  item.approvedBy = "Sourena";
  item.approvedAt = meta.approvedAt;
  item.approvedScope = meta.approvedScope;
  item.approvedPlatform = meta.approvedPlatform;
  item.approvedVersion = meta.approvedVersion;
  item.approvalHash = hash;
}

export async function isApprovalValid(
  item: ContentItem | MemoryRecord,
  binding: ApprovalBinding,
): Promise<boolean> {
  if (item.publicationApproved !== true) return false;
  const hash = await computeApprovalHash(binding);
  if (item.approvalHash !== hash) return false;
  if (binding.approvedScope !== undefined && binding.approvedScope !== null) {
    if (item.approvedScope !== binding.approvedScope) return false;
  }
  if (binding.platform !== undefined && binding.platform !== null) {
    if (item.approvedPlatform !== binding.platform) return false;
  }
  return true;
}
