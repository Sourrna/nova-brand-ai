import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { filterForExport, toMarkdown, type ExportScope, type Memory } from "@/lib/memory";
import { useMemory, memoryStore } from "@/lib/store";
import { validateMemory, diffMemory, type MemoryDiff } from "@/lib/validate";
import { PageHeader, Panel, StateBadge, download, btn, chip } from "@/components/ui-kit";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory Core — Sourena Brand Control Center" },
      { name: "description", content: "Browse, filter, validate, export and import Sourena's Memory Core." },
      { property: "og:title", content: "Memory Core — Sourena Brand Control Center" },
      { property: "og:description", content: "Every record with its knowledge state, visibility and source." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  const m = useMemory();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");
  const [state, setState] = useState("all");
  const [vis, setVis] = useState("all");
  const [scope, setScope] = useState<ExportScope>("nova");
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, setPending] = useState<{ mem: Memory; diff: MemoryDiff } | null>(null);

  const domains = useMemo(() => ["all", ...new Set(m.records.map((r) => r.domain))], [m]);
  const rows = m.records.filter((r) =>
    (domain === "all" || r.domain === domain) && (state === "all" || r.state === state) && (vis === "all" || r.visibility === vis) &&
    (!q || `${r.title} ${r.value} ${r.note ?? ""} ${r.id}`.toLowerCase().includes(q.toLowerCase())));

  const exportAs = (fmt: "json" | "md") => {
    const snap = filterForExport(m, scope);
    const base = `nova-memory-v${m.snapshotVersion}-${scope}`;
    if (fmt === "json") download(`${base}.json`, JSON.stringify(snap, null, 2), "application/json");
    else download(`${base}.md`, toMarkdown(snap), "text/markdown");
  };

  const onFile = async (f: File | undefined) => {
    setErrors([]); setPending(null);
    if (!f) return;
    let parsed: unknown;
    try { parsed = JSON.parse(await f.text()); } catch { return setErrors(["File is not valid JSON"]); }
    const res = validateMemory(parsed);
    if (!res.ok) return setErrors(res.errors);
    if (res.memory.snapshotVersion < m.snapshotVersion) return setErrors([`Snapshot v${res.memory.snapshotVersion} is older than current v${m.snapshotVersion}; rejected.`]);
    setPending({ mem: res.memory, diff: diffMemory(m, res.memory) });
  };

  const sel = "border border-border bg-secondary px-2 py-1 font-mono text-xs";
  return (
    <>
      <PageHeader kicker="Memory" title="Memory Core" sub={<>Source of truth: <code className="font-mono">context/memory.json</code> · {m.records.length} records</>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel label={`Records (${rows.length})`}>
            <div className="mb-4 flex flex-wrap gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="min-w-40 flex-1 border border-border bg-background px-2 py-1 text-sm" />
              <select className={sel} value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((d) => <option key={d}>{d}</option>)}</select>
              <select className={sel} value={state} onChange={(e) => setState(e.target.value)}>{["all", "VERIFIED", "USER_PROVIDED", "INFERRED", "NEEDS_CONFIRMATION"].map((d) => <option key={d}>{d}</option>)}</select>
              <select className={sel} value={vis} onChange={(e) => setVis(e.target.value)}>{["all", "PUBLIC", "INTERNAL_STRATEGY", "PRIVATE", "SENSITIVE"].map((d) => <option key={d}>{d}</option>)}</select>
            </div>
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.title}</span>
                    <StateBadge state={r.state} />
                    <span className="font-mono text-[10px] text-muted-foreground">{r.visibility}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.value}</p>
                  {r.note && <p className="mt-1 text-xs italic text-muted-foreground">{r.note}</p>}
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{r.id} · {r.domain} · source: {r.source}{r.evidence?.length ? ` · evidence: ${r.evidence.join(", ")}` : ""}</p>
                </li>
              ))}
              {!rows.length && <li className="py-6 text-center text-sm text-muted-foreground">No records match.</li>}
            </ul>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel label="Export">
            <div className="mb-3 flex gap-1">{(["public", "nova", "full"] as ExportScope[]).map((s) => <button key={s} onClick={() => setScope(s)} className={`flex-1 ${chip(scope === s)}`}>{s}</button>)}</div>
            <div className="flex gap-2"><button onClick={() => exportAs("json")} className={`flex-1 ${btn}`}>JSON</button><button onClick={() => exportAs("md")} className={`flex-1 ${btn}`}>Markdown</button></div>
            <p className="mt-3 text-xs text-muted-foreground">public = verified/owner-stated public only. SENSITIVE is never exported.</p>
          </Panel>
          <Panel label="Import (validated)">
            <input type="file" accept="application/json,.json" onChange={(e) => onFile(e.target.files?.[0])} className="w-full text-xs" />
            {errors.length > 0 && (
              <ul className="mt-3 max-h-40 space-y-1 overflow-auto border border-destructive/50 p-2 font-mono text-[10px] text-destructive">{errors.map((x, i) => <li key={i}>{x}</li>)}</ul>
            )}
            {pending && (
              <div className="mt-3 space-y-2 text-xs">
                <p className="font-medium">Valid · snapshot v{pending.mem.snapshotVersion}. Review before applying:</p>
                <p className="text-verified">+ added: {pending.diff.added.join(", ") || "—"}</p>
                <p className="text-pending">~ changed: {pending.diff.changed.join(", ") || "—"}</p>
                <p className="text-destructive">− removed: {pending.diff.removed.join(", ") || "—"}</p>
                <div className="flex gap-2 pt-1">
                  <button className={btn} onClick={() => { memoryStore.replace(pending.mem); setPending(null); }}>Apply to session</button>
                  <button className="px-3 py-1.5 text-sm text-muted-foreground" onClick={() => setPending(null)}>Cancel</button>
                </div>
              </div>
            )}
            {memoryStore.isImported() && (
              <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <p>Session is showing imported data. To make it permanent, download it and commit it as <code>context/memory.json</code>.</p>
                <div className="flex gap-2">
                  <button className={btn} onClick={() => download("memory.json", JSON.stringify(m, null, 2), "application/json")}>Download memory.json</button>
                  <button className="text-sm" onClick={() => memoryStore.reset()}>Reset</button>
                </div>
              </div>
            )}
            {!pending && !memoryStore.isImported() && <p className="mt-3 text-xs text-muted-foreground">Nothing is replaced until the file passes validation and you approve the diff.</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
