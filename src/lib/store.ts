import { useSyncExternalStore } from "react";
import { memory as fileMemory, type Memory } from "./memory";

// Session-only working copy. The repo file context/memory.json stays the source of truth.
let current: Memory = fileMemory;
let imported = false;
const subs = new Set<() => void>();

export const memoryStore = {
  get: () => current,
  isImported: () => imported,
  replace(m: Memory) { current = m; imported = true; subs.forEach((f) => f()); },
  reset() { current = fileMemory; imported = false; subs.forEach((f) => f()); },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};

export function useMemory() {
  return useSyncExternalStore(memoryStore.subscribe, memoryStore.get, () => fileMemory);
}
