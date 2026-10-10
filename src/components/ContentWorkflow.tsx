import { useState } from "react";
import { CONTENT_STAGES, type ContentItem } from "@/lib/memory";
import { memoryStore, useMemory } from "@/lib/store";
import {
  approveItem, editItem, linkedInDraft, moveItem, newItem, publicSources, validateItem, type Stage,
} from "@/lib/workflow";
import { Panel, btn } from "@/components/ui-kit";

const field = "w-full border border-border bg-background px-2 py-1.5 text-sm";

export function ContentWorkflow() {
  const m = useMemory();
  const sources = publicSources(m);
  const [selId, setSelId] = useState<string>("");
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [lang, setLang] = useState<"en" | "fa">("en");
  const item = m.content.find((c) => c.id === selId);
  const [draft, setDraft] = useState<{ title: string; body: string; claims: string[] } | null>(null);

  const save = (next: ContentItem) =>
    memoryStore.update((mm) => ({ ...mm, content: mm.content.map((c) => (c.id === next.id ? next : c)) }));
  const run = async (fn: () => Promise<void> | void) => {
    setErr("");
    try { await fn(); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };
  const select = (c: ContentItem | undefined) => {
    setSelId(c?.id ?? "");
    setConfirm(false);
    setErr("");
    setDraft(c ? { title: c.title, body: c.body ?? "", claims: c.claims ?? [] } : null);
  };
  const issues = item ? validateItem(m, item) : [];
  const stageIdx = item ? CONTENT_STAGES.indexOf(item.stage as Stage) : -1;
  const nextStage = CONTENT_STAGES[stageIdx + 1];

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Panel label="Workflow — create & manage items">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New item title" className={field} maxLength={200} />
            <select value={src} onChange={(e) => setSrc(e.target.value)} className={field}>
              <option value="">Public source…</option>
              {sources.map((r) => <option key={r.id} value={r.id}>{r.id} · {r.title}</option>)}
            </select>
          </div>
          <button className={btn} disabled={!title.trim() || !src} onClick={() => run(() => {
            const it = newItem(m, title.trim(), src);
            memoryStore.update((mm) => ({ ...mm, content: [...mm.content, it] }));
            setTitle(""); select(it);
          })}>Create item</button>
          <ul className="mt-2 space-y-1 text-sm">
            {m.content.map((c) => (
              <li key={c.id}>
                <button onClick={() => select(c)} className={`w-full border px-2 py-1 text-left ${c.id === selId ? "border-primary" : "border-border"}`}>
                  <span className="font-mono text-[10px] text-muted-foreground">{c.id} · {c.stage} · v{c.version ?? 1}</span>{" "}
                  {c.title} {c.publicationApproved ? <span className="text-verified">✓ approved</span> : null}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Local-only: changes are saved in this browser (no cloud sync). Export JSON from Memory and commit it to
            <code> context/memory.json</code> to keep them. Nothing is posted anywhere.
          </p>
        </div>
      </Panel>

      <Panel label={item ? `Edit ${item.id}` : "Select an item"}>
        {item && draft ? (
          <div className="space-y-2">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={field} maxLength={200} />
            <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={8} className={field} maxLength={3000} />
            <p className="font-mono text-[10px] text-muted-foreground">{draft.body.length}/3000 · platform: {item.platform ?? "none"} · source: {item.sourceRecord}</p>
            <div className="flex flex-wrap gap-2">
              <button className={btn} onClick={() => run(() => save(editItem(item, draft)))}>Save (invalidates approval)</button>
              <select value={lang} onChange={(e) => setLang(e.target.value as "en" | "fa")} className="border border-border bg-secondary px-2 text-sm">
                <option value="en">EN</option><option value="fa">FA</option>
              </select>
              <button className={btn} onClick={() => run(() => {
                const ids = [item.sourceRecord, ...draft.claims];
                setDraft({ ...draft, body: linkedInDraft(m, ids, lang) });
              })}>Generate LinkedIn draft</button>
            </div>
            <p className="text-xs text-muted-foreground">Draft is a template from public-safe records only — no AI provider connected.</p>

            <div className="border-t border-border pt-2">
              <p className="text-xs">Stage: <b>{item.stage}</b> {item.publicationApproved ? "· approval valid until next edit" : "· not approved"}</p>
              {issues.length > 0 && <ul className="mt-1 list-disc pl-4 text-xs text-pending">{issues.map((i) => <li key={i}>{i}</li>)}</ul>}
              <div className="mt-2 flex flex-wrap gap-2">
                {stageIdx > 0 && (
                  <button className={btn} onClick={() => run(async () => save(await moveItem(m, item, CONTENT_STAGES[stageIdx - 1] as Stage)))}>← Back</button>
                )}
                {nextStage && nextStage !== "approved" && (
                  <button className={btn} onClick={() => run(async () => save(await moveItem(m, item, nextStage)))}>Move to {nextStage} →</button>
                )}
              </div>
              {item.stage === "review" && (
                <div className="mt-2 space-y-1">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
                    I, Sourena, approve this exact text (v{item.version ?? 1}) for {item.platform}.
                  </label>
                  <button className={btn} disabled={!confirm || issues.length > 0} onClick={() => run(async () => { save(await approveItem(m, item, confirm)); setConfirm(false); })}>Approve</button>
                </div>
              )}
              {item.stage === "approved" && <p className="mt-1 text-xs text-muted-foreground">"Published" only records that you posted it manually.</p>}
              {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Pick or create an item to edit, generate a draft, and approve.</p>
        )}
      </Panel>
    </div>
  );
}
