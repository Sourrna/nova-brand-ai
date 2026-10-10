import { describe, expect, it } from "vitest";
import type { Memory } from "@/lib/memory";
import { approveItem, editItem, linkedInDraft, moveItem, newItem } from "@/lib/workflow";

const m: Memory = {
  schemaVersion: 1, snapshotVersion: 1, updatedAt: "x", owner: "Sourena", accounts: [], content: [],
  records: [
    { id: "pub", domain: "d", title: "Pub", value: "public fact", state: "USER_PROVIDED", visibility: "PUBLIC", source: "s" },
    { id: "priv", domain: "d", title: "Priv", value: "secret revenue", state: "USER_PROVIDED", visibility: "PRIVATE", source: "s" },
    { id: "inf", domain: "d", title: "Inf", value: "guess", state: "INFERRED", visibility: "PUBLIC", source: "s" },
  ],
};
const review = () => ({ ...newItem(m, "Post", "pub"), stage: "review", body: "hello" });

describe("content workflow", () => {
  it("requires explicit owner confirmation to approve", async () => {
    await expect(approveItem(m, review(), false)).rejects.toThrow();
  });
  it("cannot move to approved without approval", async () => {
    await expect(moveItem(m, review(), "approved")).rejects.toThrow();
  });
  it("cannot publish an unapproved item", async () => {
    await expect(moveItem(m, { ...review(), stage: "approved" }, "published")).rejects.toThrow();
  });
  it("approves then publishes", async () => {
    const a = await approveItem(m, review(), true);
    expect((await moveItem(m, a, "published")).stage).toBe("published");
  });
  it("editing invalidates approval and returns to review", async () => {
    const a = await approveItem(m, review(), true);
    const e = editItem(a, { body: "changed" });
    expect(e.publicationApproved).toBe(false);
    expect(e.stage).toBe("review");
    await expect(moveItem(m, e, "published")).rejects.toThrow();
  });
  it("rejects private or inferred sources (fail closed)", async () => {
    await expect(approveItem(m, { ...review(), sourceRecord: "priv" }, true)).rejects.toThrow();
    await expect(approveItem(m, { ...review(), claims: ["inf"] }, true)).rejects.toThrow();
    await expect(approveItem(m, { ...review(), sourceRecord: "" }, true)).rejects.toThrow();
    expect(() => linkedInDraft(m, ["priv"])).toThrow();
  });
  it("draft uses only public facts", () => {
    const d = linkedInDraft(m, ["pub"]);
    expect(d).toContain("public fact");
    expect(d).not.toContain("secret revenue");
  });
});
