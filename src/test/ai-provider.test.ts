import { describe, expect, it, vi } from "vitest";
import { memory } from "@/lib/memory";
import { publicSources } from "@/lib/workflow";
import { generateDraft, providerStatus } from "@/lib/ai/provider";

const pub = publicSources(memory)[0]!;
const priv = memory.records.find((r) => r.visibility !== "PUBLIC");

describe("AI provider", () => {
  it("reports missing keys and falls back to template without calling fetch", async () => {
    expect(providerStatus({}).missing).toEqual(["AI_BASE_URL", "AI_MODEL", "AI_API_KEY"]);
    const f = vi.fn();
    const r = await generateDraft(memory, [pub.id], "en", {}, f as never);
    expect(r.mode).toBe("template");
    expect(f).not.toHaveBeenCalled();
  });
  it("rejects private sources before any provider call", async () => {
    const f = vi.fn();
    await expect(
      generateDraft(memory, [priv!.id], "en", { baseUrl: "x", model: "m", apiKey: "k" }, f as never),
    ).rejects.toThrow();
    expect(f).not.toHaveBeenCalled();
  });
  it("falls back when provider fails", async () => {
    const f = vi.fn(async () => new Response("", { status: 500 }));
    const r = await generateDraft(memory, [pub.id], "fa", { baseUrl: "x", model: "m", apiKey: "k" }, f as never);
    expect(r.mode).toBe("template");
  });
  it("server function module does not leak keys into client code", async () => {
    const src = (await import("@/lib/ai/draft.functions.ts?raw")).default as string;
    expect(src).toContain("createServerFn");
    expect(src).not.toMatch(/VITE_AI|import\.meta\.env/);
  });
});
