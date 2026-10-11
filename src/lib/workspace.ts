import { useEffect, useSyncExternalStore } from "react";

/** Local-only UI workspace: preferences + personal tasks. Never contains memory data. */
export const WS_KEY = "nova-brand-os:workspace";
export const PANELS = ["actions", "pipeline", "tasks", "states", "chain", "accounts"] as const;
export type PanelId = (typeof PANELS)[number];
export type Accent = "cyan" | "burgundy" | "amber";

export interface Task { id: string; text: string; done: boolean }
export interface Workspace {
  v: 1;
  accent: Accent;
  intensity: "subtle" | "vivid";
  density: "comfortable" | "compact";
  dir: "ltr" | "rtl";
  reduceMotion: boolean;
  order: PanelId[];
  hidden: PanelId[];
  tasks: Task[];
}

export const DEFAULT_WS: Workspace = {
  v: 1, accent: "cyan", intensity: "subtle", density: "comfortable", dir: "ltr",
  reduceMotion: false, order: [...PANELS], hidden: [], tasks: [],
};

const pick = <T extends string>(v: unknown, opts: readonly T[], d: T): T =>
  opts.includes(v as T) ? (v as T) : d;

/** Sanitize any stored value into a valid Workspace (unknown/corrupt -> defaults). */
export function sanitize(raw: unknown): Workspace {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_WS, order: [...PANELS], tasks: [] };
  const o = raw as Record<string, unknown>;
  const ids = (x: unknown) =>
    Array.isArray(x) ? [...new Set(x.filter((p): p is PanelId => PANELS.includes(p as PanelId)))] : [];
  const order = ids(o.order);
  for (const p of PANELS) if (!order.includes(p)) order.push(p);
  const tasks = Array.isArray(o.tasks)
    ? o.tasks
        .filter((t): t is Task => !!t && typeof t === "object" && typeof (t as Task).id === "string" && typeof (t as Task).text === "string")
        .map((t) => ({ id: t.id, text: t.text.slice(0, 300), done: !!t.done }))
    : [];
  return {
    v: 1,
    accent: pick(o.accent, ["cyan", "burgundy", "amber"] as const, "cyan"),
    intensity: pick(o.intensity, ["subtle", "vivid"] as const, "subtle"),
    density: pick(o.density, ["comfortable", "compact"] as const, "comfortable"),
    dir: pick(o.dir, ["ltr", "rtl"] as const, "ltr"),
    reduceMotion: !!o.reduceMotion,
    order, hidden: ids(o.hidden), tasks,
  };
}

export function movePanel(order: PanelId[], id: PanelId, delta: number): PanelId[] {
  const i = order.indexOf(id), j = i + delta;
  if (i < 0 || j < 0 || j >= order.length) return order;
  const n = [...order];
  [n[i], n[j]] = [n[j], n[i]];
  return n;
}

let ws: Workspace = DEFAULT_WS;
let loaded = false;
const subs = new Set<() => void>();

function apply() {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.dataset.accent = ws.accent;
  el.dataset.intensity = ws.intensity;
  el.dataset.density = ws.density;
  el.dataset.motion = ws.reduceMotion ? "reduce" : "auto";
  el.dir = ws.dir;
}

export const workspace = {
  get: () => ws,
  load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try { ws = sanitize(JSON.parse(localStorage.getItem(WS_KEY) ?? "null")); } catch { ws = sanitize(null); }
    apply();
    subs.forEach((f) => f());
  },
  set(fn: (w: Workspace) => Workspace) {
    ws = sanitize(fn(ws));
    try { localStorage.setItem(WS_KEY, JSON.stringify(ws)); } catch { /* storage unavailable */ }
    apply();
    subs.forEach((f) => f());
  },
  reset() { this.set(() => DEFAULT_WS); },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};

export function useWorkspace() {
  useEffect(() => workspace.load(), []);
  return useSyncExternalStore(workspace.subscribe, workspace.get, () => DEFAULT_WS);
}
