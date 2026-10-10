import type { Memory } from "../memory";
import { validateMemory } from "../validate";

/** Local-only, versioned browser persistence. NOT cloud sync. */
export const STORAGE_KEY = "nova-brand-os:state";
export const PERSIST_VERSION = 1;

export interface PersistedEnvelope {
  v: number;
  savedAt: string;
  memory: Memory;
}

type KV = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function storage(): KV | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** Migrate older envelopes; v0 = bare Memory object. Returns null if unusable. */
export function migrate(raw: unknown): PersistedEnvelope | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const env: PersistedEnvelope =
    "v" in o && "memory" in o
      ? (o as unknown as PersistedEnvelope)
      : { v: 0, savedAt: new Date(0).toISOString(), memory: o as unknown as Memory };
  if (env.v > PERSIST_VERSION) return null;
  const res = validateMemory(env.memory);
  if (!res.ok) return null;
  return { v: PERSIST_VERSION, savedAt: env.savedAt, memory: res.memory };
}

export function loadLocal(kv: KV | null = storage()): PersistedEnvelope | null {
  if (!kv) return null;
  try {
    const s = kv.getItem(STORAGE_KEY);
    return s ? migrate(JSON.parse(s)) : null;
  } catch {
    return null;
  }
}

export function saveLocal(memory: Memory, kv: KV | null = storage()): boolean {
  if (!kv) return false;
  try {
    const env: PersistedEnvelope = { v: PERSIST_VERSION, savedAt: new Date().toISOString(), memory };
    kv.setItem(STORAGE_KEY, JSON.stringify(env));
    return true;
  } catch {
    return false;
  }
}

export function clearLocal(kv: KV | null = storage()): void {
  try {
    kv?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
