import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  memory,
  filterForExport,
  toMarkdown,
  BRAND_CHAIN,
  CONTENT_STAGES,
  type ExportScope,
  type KnowledgeState,
} from "@/lib/memory";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOVA OS — Control Center" },
      { name: "description", content: "Sourena's personal brand control center: memory, brand, proof of work and content." },
      { property: "og:title", content: "NOVA OS — Control Center" },
      { property: "og:description", content: "Memory core, brand foundation, proof of work and content pipeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ControlCenter,
});

const STATE_STYLE: Record<KnowledgeState, string> = {
  VERIFIED: "text-verified border-verified/40",
  USER_PROVIDED: "text-provided border-provided/40",
  INFERRED: "text-inferred border-inferred/40",
  NEEDS_CONFIRMATION: "text-pending border-pending/40",
};

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card p-5">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</h2>
      {children}
    </section>
  );
}

function ControlCenter() {
  const [domain, setDomain] = useState("all");
  const [scope, setScope] = useState<ExportScope>("nova");
  const domains = useMemo(() => ["all", ...new Set(memory.records.map((r) => r.domain))], []);
  const records = memory.records.filter((r) => domain === "all" || r.domain === domain);
  const counts = memory.records.reduce<Record<string, number>>((a, r) => ({ ...a, [r.state]: (a[r.state] ?? 0) + 1 }), {});
  const questions = memory.records.filter((r) => r.domain === "pending_question");
  const projects = memory.records.filter((r) => r.domain === "project" || r.domain === "research");

  const exportAs = (fmt: "json" | "md") => {
    const snap = filterForExport(memory, scope);
    const base = `nova-memory-v${memory.snapshotVersion}-${scope}`;
    if (fmt === "json") download(`${base}.json`, JSON.stringify(snap, null, 2), "application/json");
    else download(`${base}.md`, toMarkdown(snap), "text/markdown");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 font-sans md:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">NOVA OS · Control Center</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{memory.owner}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Memory snapshot v{memory.snapshotVersion} · schema v{memory.schemaVersion} · {memory.updatedAt}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {(["VERIFIED", "USER_PROVIDED", "INFERRED", "NEEDS_CONFIRMATION"] as KnowledgeState[]).map((s) => (
            <span key={s} className={`border px-2 py-1 ${STATE_STYLE[s]}`}>
              {s} {counts[s] ?? 0}
            </span>
          ))}
        </div>
      </header>

      <Panel label="Brand chain">
        <ol className="flex flex-wrap gap-2 font-mono text-xs">
          {BRAND_CHAIN.map((s, i) => (
            <li key={s} className={`border px-2 py-1 ${i < 3 ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
              {String(i + 1).padStart(2, "0")} {s}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">Highlighted: stages in progress (drafts awaiting your confirmation).</p>
      </Panel>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Panel label="Memory core">
            <div className="mb-4 flex flex-wrap gap-1">
              {domains.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`px-2 py-1 font-mono text-xs ${domain === d ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <ul className="divide-y divide-border">
              {records.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.title}</span>
                    <span className={`border px-1.5 font-mono text-[10px] ${STATE_STYLE[r.state]}`}>{r.state}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{r.visibility}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.value}</p>
                  {r.note && <p className="mt-1 text-xs italic text-muted-foreground">{r.note}</p>}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel label="Export to Nova">
            <div className="mb-3 flex gap-1">
              {(["public", "nova", "full"] as ExportScope[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`flex-1 px-2 py-1 font-mono text-xs ${scope === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportAs("json")} className="flex-1 border border-primary py-2 text-sm text-primary hover:bg-primary hover:text-primary-foreground">JSON</button>
              <button onClick={() => exportAs("md")} className="flex-1 border border-primary py-2 text-sm text-primary hover:bg-primary hover:text-primary-foreground">Markdown</button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Sensitive information is never exported.</p>
          </Panel>

          <Panel label="Pending questions">
            <ul className="space-y-3 text-sm">
              {questions.map((q) => (
                <li key={q.id}>
                  <p className="font-medium">{q.title}</p>
                  <p className="text-muted-foreground">{q.value}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel label="Accounts & connections">
            <ul className="space-y-2 text-sm">
              {memory.accounts.map((a) => (
                <li key={a.id} className="flex justify-between gap-2">
                  <span><span className="font-medium capitalize">{a.id}</span> <span className="text-muted-foreground">· {a.role}</span></span>
                  <span className="font-mono text-[10px] text-pending">{a.status}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel label="Proof of work">
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.value}</p>
                </div>
                <span className={`shrink-0 border px-1.5 font-mono text-[10px] ${STATE_STYLE[p.state]}`}>{p.state}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel label="Content pipeline">
          <div className="grid grid-cols-7 gap-1">
            {CONTENT_STAGES.map((s) => {
              const items = memory.content.filter((c) => c.stage === s);
              return (
                <div key={s} className="min-w-0">
                  <p className="truncate font-mono text-[10px] uppercase text-muted-foreground">{s}</p>
                  <p className="mt-1 text-xl font-bold">{items.length}</p>
                </div>
              );
            })}
          </div>
          <ul className="mt-4 space-y-1 text-sm">
            {memory.content.map((c) => (
              <li key={c.id}><span className="font-mono text-xs text-primary">{c.stage}</span> · {c.title}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </main>
  );
}
