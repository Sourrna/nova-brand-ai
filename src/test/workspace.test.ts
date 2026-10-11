import { describe, expect, it } from "vitest";
import { DEFAULT_WS, PANELS, movePanel, sanitize } from "@/lib/workspace";

describe("workspace settings", () => {
  it("corrupt input falls back to defaults", () => {
    expect(sanitize("junk")).toEqual(DEFAULT_WS);
  });
  it("drops unknown panels and restores missing ones", () => {
    const w = sanitize({ order: ["tasks", "bogus", "tasks"], hidden: ["x", "chain"] });
    expect(w.order[0]).toBe("tasks");
    expect(w.order).toHaveLength(PANELS.length);
    expect(w.hidden).toEqual(["chain"]);
  });
  it("rejects invalid enum values", () => {
    expect(sanitize({ accent: "pink", dir: "up" }).accent).toBe("cyan");
  });
  it("moves panels within bounds", () => {
    expect(movePanel(["actions", "tasks"], "tasks", -1)).toEqual(["tasks", "actions"]);
    expect(movePanel(["actions", "tasks"], "actions", -1)).toEqual(["actions", "tasks"]);
  });
});
