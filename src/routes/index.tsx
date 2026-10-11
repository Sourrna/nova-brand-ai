import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_CHAIN, CONTENT_STAGES, type KnowledgeState } from "@/lib/memory";
import { useMemory } from "@/lib/store";
import { projects, contentDocs } from "@/lib/files";
import { PageHeader, Panel, STATE_STYLE, btn } from "@/components/ui-kit";
import { useState, type ReactNode } from "react";
import { useWorkspace, workspace, type PanelId } from "@/lib/workspace";
import { validateItem } from "@/lib/workflow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Sourena Brand Control Center" },
      {
        name: "description",
        content: "Sourena's personal brand control center: status overview and next actions.",
      },
      { property: "og:title", content: "Overview — Sourena Brand Control Center" },
      {
        property: "og:description",
        content: "Memory, projects, content and proof-of-work status at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  to,
  hint,
}: {
  label: string;
  value: number | string;
  to: string;
  hint: string;
}) {
  return (
    <Link to={to} className="glass p-4 hover:border-primary">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}

function Dashboard() {
  const m = useMemory();
  const counts = m.records.reduce<Record<string, number>>(
    (a, r) => ({ ...a, [r.state]: (a[r.state] ?? 0) + 1 }),
    {},
  );
  const questions = m.records.filter((r) => r.domain === "pending_question");
  const unconfirmed = m.records.filter(
    (r) => r.state === "NEEDS_CONFIRMATION" && r.domain !== "pending_question",
  );
  const contentTotal = m.content.length + contentDocs.length;
  const actions = [
    ...questions.map((q) => ({ id: q.id, text: q.value, to: "/memory" })),
    ...(unconfirmed.length
      ? [
          {
            id: "unc",
            text: `Confirm or correct ${unconfirmed.length} records marked NEEDS_CONFIRMATION.`,
            to: "/memory",
          },
        ]
      : []),
    {
      id: "brand",
      text: "Review the Foundation and Positioning drafts in brand/.",
      to: "/linkedin",
    },
  ];

  const ws = useWorkspace();
  const [task, setTask] = useState("");
  const inStage = (st: string) => m.content.filter((c) => c.stage === st).length + contentDocs.filter((d) => d.stage === st).length;
  const blocked = m.content.filter((c) => c.stage !== "idea" && validateItem(m, c).length > 0);
  const review = m.content.filter((c) => c.stage === "review");
  const openTasks = ws.tasks.filter((t) => !t.done);
  actions.unshift(
    ...review.map((c) => ({ id: "rv" + c.id, text: `Review & approve "${c.title}" (v${c.version ?? 1}).`, to: "/content" })),
    ...blocked.map((c) => ({ id: "bl" + c.id, text: `Blocked: "${c.title}" — ${validateItem(m, c)[0]}`, to: "/content" })),
  );
  const panels: Record<PanelId, ReactNode> = {
    actions: (
      <Panel label={`Next actions · ${actions.length}`}>
        <ol className="space-y-3">
          {actions.map((a, i) => (
            <li key={a.id} className="flex gap-3 text-sm">
              <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
              <Link to={a.to} className="hover:text-primary">{a.text}</Link>
            </li>
          ))}
        </ol>
      </Panel>
    ),
    pipeline: (
      <Panel label="Content pipeline">
        <ul className="grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-4">
          {CONTENT_STAGES.map((st) => (
            <li key={st} className="flex justify-between border border-border px-2 py-1"><span>{st}</span><span className="text-primary">{inStage(st)}</span></li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">{blocked.length} blocked · {review.length} awaiting your approval. Nothing is published automatically.</p>
      </Panel>
    ),
    tasks: (
      <Panel label={`Tasks · ${openTasks.length} open`}>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = task.trim(); if (!t) return;
          workspace.set((w) => ({ ...w, tasks: [...w.tasks, { id: crypto.randomUUID(), text: t, done: false }] })); setTask(""); }}>
          <input value={task} onChange={(e) => setTask(e.target.value)} maxLength={300} placeholder="Add a task…" className="w-full border border-border bg-background px-2 py-1.5 text-sm" />
          <button className={btn} disabled={!task.trim()}>Add</button>
        </form>
        {ws.tasks.length === 0 ? <p className="mt-3 text-xs text-muted-foreground">No tasks yet. Saved in this browser only.</p> : (
          <ul className="mt-3 space-y-1 text-sm">
            {ws.tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <input type="checkbox" checked={t.done} aria-label={`Done: ${t.text}`} onChange={() => workspace.set((w) => ({ ...w, tasks: w.tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x) }))} />
                <span className={`flex-1 ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.text}</span>
                <button className="text-xs text-muted-foreground hover:text-destructive" aria-label={`Delete ${t.text}`} onClick={() => confirm("Delete this task?") && workspace.set((w) => ({ ...w, tasks: w.tasks.filter((x) => x.id !== t.id) }))}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    ),
    states: (
      <Panel label="Knowledge states">
        <ul className="space-y-2">
          {(["VERIFIED", "USER_PROVIDED", "INFERRED", "NEEDS_CONFIRMATION"] as KnowledgeState[]).map((s) => (
            <li key={s} className={`flex justify-between border px-2 py-1 font-mono text-xs ${STATE_STYLE[s]}`}><span>{s}</span><span>{counts[s] ?? 0}</span></li>
          ))}
        </ul>
      </Panel>
    ),
    chain: (
      <Panel label="Brand chain">
        <ol className="flex flex-wrap gap-2 font-mono text-xs">
          {BRAND_CHAIN.map((s, i) => (
            <li key={s} className={`border px-2 py-1 ${i < 3 ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{String(i + 1).padStart(2, "0")} {s}</li>
          ))}
        </ol>
      </Panel>
    ),
    accounts: (
      <Panel label="Accounts (real status)">
        <ul className="space-y-2 text-sm">
          {m.accounts.map((a) => (
            <li key={a.id} className="flex flex-wrap justify-between gap-2">
              <span><span className="font-medium capitalize">{a.id}</span> <span className="text-muted-foreground">· {a.role}</span></span>
              <span className="break-all font-mono text-[10px] text-pending">{a.status}</span>
            </li>
          ))}
        </ul>
      </Panel>
    ),
  };
  const visible = ws.order.filter((p) => !ws.hidden.includes(p));

  return (
    <>
      <PageHeader kicker="Command center" title="Sourena Brand Control Center" sub={`Memory snapshot v${m.snapshotVersion} · ${m.updatedAt}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Memory records" value={m.records.length} to="/memory" hint={`${counts["VERIFIED"] ?? 0} verified`} />
        <Stat label="Needs confirmation" value={counts["NEEDS_CONFIRMATION"] ?? 0} to="/memory" hint="Awaiting your answer" />
        <Stat label="Projects" value={projects.length} to="/projects" hint="From projects/" />
        <Stat label="Content items" value={contentTotal} to="/content" hint={`${review.length} in review · ${blocked.length} blocked`} />
      </div>
      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">All panels hidden. <Link to="/settings" className="text-primary">Show panels in Settings</Link>.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {visible.map((p) => <div key={p} className={p === "actions" || p === "pipeline" ? "md:col-span-2" : ""}>{panels[p]}</div>)}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground"><Link to="/settings" className="hover:text-primary">Customize panels →</Link></p>
    </>
  );
}
