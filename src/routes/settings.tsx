import { createFileRoute } from "@tanstack/react-router";
import { PANELS, movePanel, useWorkspace, workspace, type Workspace } from "@/lib/workspace";
import { PageHeader, Panel, btn } from "@/components/ui-kit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Sourena Brand Control Center" },
      { name: "description", content: "Theme, density, direction and dashboard layout preferences." },
      { property: "og:title", content: "Settings — Sourena Brand Control Center" },
      { property: "og:description", content: "Customize the cockpit: accent, density, RTL and panels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function Choice<K extends keyof Workspace>({ k, label, opts }: { k: K; label: string; opts: Workspace[K][] }) {
  const w = useWorkspace();
  return (
    <fieldset className="space-y-1">
      <legend className="text-xs text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button key={String(o)} aria-pressed={w[k] === o}
            className={`${btn} ${w[k] === o ? "!border-primary !text-primary" : ""}`}
            onClick={() => workspace.set((x) => ({ ...x, [k]: o }))}>{String(o)}</button>
        ))}
      </div>
    </fieldset>
  );
}

function SettingsPage() {
  const w = useWorkspace();
  return (
    <>
      <PageHeader kicker="Settings" title="Workspace preferences" sub="Saved in this browser only. Contains no memory data." />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel label="Appearance">
          <div className="space-y-4">
            <Choice k="accent" label="Accent" opts={["cyan", "burgundy", "amber"]} />
            <Choice k="intensity" label="Glow intensity" opts={["subtle", "vivid"]} />
            <Choice k="density" label="Density" opts={["comfortable", "compact"]} />
            <Choice k="dir" label="Direction (RTL for Persian)" opts={["ltr", "rtl"]} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={w.reduceMotion}
                onChange={(e) => workspace.set((x) => ({ ...x, reduceMotion: e.target.checked }))} />
              Reduce motion (system setting is always respected)
            </label>
          </div>
        </Panel>
        <Panel label="Dashboard panels" action={<button className={btn} onClick={() => workspace.reset()}>Reset all</button>}>
          <ul className="space-y-2">
            {w.order.map((p, i) => {
              const hidden = w.hidden.includes(p);
              return (
                <li key={p} className="flex items-center justify-between gap-2 border border-border px-2 py-1 text-sm">
                  <span className={hidden ? "text-muted-foreground line-through" : ""}>{p}</span>
                  <span className="flex gap-1">
                    <button className={btn} aria-label={`Move ${p} up`} disabled={i === 0}
                      onClick={() => workspace.set((x) => ({ ...x, order: movePanel(x.order, p, -1) }))}>↑</button>
                    <button className={btn} aria-label={`Move ${p} down`} disabled={i === PANELS.length - 1}
                      onClick={() => workspace.set((x) => ({ ...x, order: movePanel(x.order, p, 1) }))}>↓</button>
                    <button className={btn} onClick={() => workspace.set((x) => ({
                      ...x, hidden: hidden ? x.hidden.filter((h) => h !== p) : [...x.hidden, p],
                    }))}>{hidden ? "Show" : "Hide"}</button>
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}
