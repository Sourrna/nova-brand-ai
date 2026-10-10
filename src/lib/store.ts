import { useSyncExternalStore } from "react";
import { memory as fileMemory, type Memory } from "./memory";

// Session-only working copy. The repo file context/memory.json stays the source of truth.
let current: Memory = fileMemory;
let imported = false;
let dirty = false;
let lastImportedAt: string | undefined;
let lastEditedAt: string | undefined;
const subs = new Set<() => void>();

function notify() {
  subs.forEach((f) => f());
}

export const memoryStore = {
  get: () => current,
  isImported: () => imported,
  isDirty: () => dirty,
  lastImportedAt: () => lastImportedAt,
  lastEditedAt: () => lastEditedAt,
  markDirty() {
    dirty = true;
    lastEditedAt = new Date().toISOString();
    notify();
  },
  replace(m: Memory) {
    current = m;
    imported = true;
    dirty = true;
    lastImportedAt = new Date().toISOString();
    notify();
  },
  reset() {
    current = fileMemory;
    imported = false;
    dirty = false;
    lastImportedAt = undefined;
    lastEditedAt = undefined;
    notify();
  },
  update(fn: (m: Memory) => Memory) {
    current = fn(current);
    dirty = true;
    lastEditedAt = new Date().toISOString();
    notify();
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

export function useMemory() {
  return useSyncExternalStore(memoryStore.subscribe, memoryStore.get, () => fileMemory);
}
