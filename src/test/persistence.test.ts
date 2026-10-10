import { describe, expect, it } from "vitest";
import { memory } from "@/lib/memory";
import { loadLocal, migrate, saveLocal, STORAGE_KEY } from "@/lib/persistence/local";

function kv() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

describe("local persistence", () => {
  it("roundtrips memory", () => {
    const s = kv();
    expect(saveLocal(memory, s)).toBe(true);
    expect(loadLocal(s)?.memory.records.length).toBe(memory.records.length);
  });
  it("migrates bare v0 memory", () => {
    expect(migrate(memory)?.v).toBe(1);
  });
  it("rejects corrupt or future data", () => {
    const s = kv();
    s.setItem(STORAGE_KEY, "{bad");
    expect(loadLocal(s)).toBeNull();
    expect(migrate({ v: 99, memory })).toBeNull();
  });
});
