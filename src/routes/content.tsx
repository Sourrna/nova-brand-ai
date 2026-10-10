import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CONTENT_STAGES, filterForExport } from "@/lib/memory";
import { useMemory } from "@/lib/store";
import { contentDocs, draftMarkdown, slugify } from "@/lib/files";
import { PageHeader, Panel, download, btn } from "@/components/ui-kit";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Content Pipeline — Sourena Brand Control Center" },
      {
        name: "description",
        content: "Seven-stage content pipeline from idea to measured, backed by Markdown files.",
      },
      { property: "og:title", content: "Content Pipeline — Sourena Brand Control Center" },
      {
        property: "og:description",
        content: "Idea → Strategy → Draft → Review → Approval → Published → Measured.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContentPage,
});

const LABEL: Record<string, string> = { approved: "Approval" };

function ContentPage() {
  const m = useMemory();
  const [form, setForm] = useState({
    title: "",
    pillar: "Building in public",
    source: "",
    body: "",
  });
  const items = [
    ...contentDocs.map((d) => ({ id: d.path, title: d.title, stage: d.stage, meta: d.path })),
    ...m.content
      .filter(
        (c) =>
          !contentDocs.some((d) => d.fields["source"] === c.sourceRecord && d.title === c.title),
      )
      .map((c) => ({ id: c.id, title: c.title, stage: c.stage, meta: `memory · ${c.pillar}` })),
  ];
  const sources = filterForExport(m, "public").records;
  const n = String(contentDocs.length + 1).padStart(3, "0");
  const filename = `${n}-${slugify(form.title)}.md`;

  return (
    <>
      <PageHeader
        kicker="Content"
        title="Content Pipeline"
        sub="Files in content/{ideas,drafts,approved,published}/ and memory content items."
      />
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="grid min-w-[840px] grid-cols-7 gap-2">
          {CONTENT_STAGES.map((s) => {
            const list = items.filter((i) => i.stage === s);
            return (
              <div key={s} className="border border-border bg-card p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {LABEL[s] ?? s} · {list.length}
                </p>
                <ul className="mt-3 space-y-2">
                  {list.map((i) => (
                    <li key={i.id} className="border border-border bg-background p-2 text-xs">
                      <p className="font-medium">{i.title}</p>
                      <p className="mt-1 break-all font-mono text-[9px] text-muted-foreground">
                        {i.meta}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel label="New draft (file-based)">
          <div className="space-y-2">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="w-full border border-border bg-background px-2 py-1.5 text-sm"
            />
            <input
              value={form.pillar}
              onChange={(e) => setForm({ ...form, pillar: e.target.value })}
              placeholder="Pillar"
              className="w-full border border-border bg-background px-2 py-1.5 text-sm"
            />
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full border border-border bg-secondary px-2 py-1.5 text-sm"
            >
              <option value="">Source record (required for claims)…</option>
              {sources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} · {r.title}
                </option>
              ))}
            </select>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={6}
              placeholder="Draft text"
              className="w-full border border-border bg-background px-2 py-1.5 text-sm"
            />
            <button
              disabled={!form.title.trim()}
              className={btn}
              onClick={() => download(filename, draftMarkdown(form), "text/markdown")}
            >
              Download {filename}
            </button>
            <p className="text-xs text-muted-foreground">
              Save it to <code>content/drafts/</code> and commit; it then appears in the Draft
              column. New drafts are marked INFERRED until you approve.
            </p>
          </div>
        </Panel>
        <Panel label="Rules">
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Every claim must trace to an eligible PUBLIC, VERIFIED or USER_PROVIDED record.</li>
            <li>
              Only items in <code>content/approved/</code> may be published.
            </li>
            <li>Every public use needs explicit Sourena approval; no automatic publishing.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
