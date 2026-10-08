import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_CHAIN, CONTENT_STAGES, type KnowledgeState } from "@/lib/memory";
import { useMemory } from "@/lib/store";
import { projects, contentDocs } from "@/lib/files";
import { PageHeader, Panel, STATE_STYLE } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — NOVA OS" },
      { name: "description", content: "Sourena's personal brand control center: status overview and next actions." },
      { property: "og:title", content: "Dashboard — NOVA OS" },
      { property: "og:description", content: "Memory, projects, content and proof-of-work status at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, to, hint }: { label: string; value: number | string; to: string; hint: string }) {
  return (
    <Link to={to} className="border border-border bg-card p-4 hover:border-primary">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}

function Dashboard() {
  const m = useMemory();
  const counts = m.records.reduce<Record<string, number>>((a, r) => ({ ...a, [r.state]: (a[r.state] ?? 0) + 1 }), {});
  const questions = m.records.filter((r) => r.domain === "pending_question");
  const unconfirmed = m.records.filter((r) => r.state === "NEEDS_CONFIRMATION" && r.domain !== "pending_question");
  const contentTotal = m.content.length + contentDocs.length;
  const actions = [
    ...questions.map((q) => ({ id: q.id, text: q.value, to: "/memory" })),
    ...(unconfirmed.length ? [{ id: "unc", text: `Confirm or correct ${unconfirmed.length} records marked NEEDS_CONFIRMATION.`, to: "/memory" }] : []),
    { id: "brand", text: "Review the Foundation and Positioning drafts in brand/.", to: "/linkedin" },
  ];

  return (
    <>
      <PageHeader kicker="Dashboard" title="Control Center" sub={`Memory snapshot v${m.snapshotVersion} · ${m.updatedAt}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Memory records" value={m.records.length} to="/memory" hint={`${counts.VERIFIED ?? 0} verified`} />
        <Stat label="Needs confirmation" value={counts.NEEDS_CONFIRMATION ?? 0} to="/memory" hint="Awaiting your answer" />
        <Stat label="Projects" value={projects.length} to="/projects" hint="From projects/" />
        <Stat label="Content items" value={contentTotal} to="/content" hint="Ideas → measured" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Panel label="Next actions">
            <ol className="space-y-3">
              {actions.map((a, i) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <Link to={a.to} className="hover:text-primary">{a.text}</Link>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
        <Panel label="Knowledge states">
          <ul className="space-y-2">
            {(["VERIFIED", "USER_PROVIDED", "INFERRED", "NEEDS_CONFIRMATION"] as KnowledgeState[]).map((s) => (
              <li key={s} className={`flex justify-between border px-2 py-1 font-mono text-xs ${STATE_STYLE[s]}`}><span>{s}</span><span>{counts[s] ?? 0}</span></li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel label="Brand chain">
          <ol className="flex flex-wrap gap-2 font-mono text-xs">
            {BRAND_CHAIN.map((s, i) => (
              <li key={s} className={`border px-2 py-1 ${i < 3 ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{String(i + 1).padStart(2, "0")} {s}</li>
            ))}
          </ol>
        </Panel>
        <Panel label="Accounts">
          <ul className="space-y-2 text-sm">
            {m.accounts.map((a) => (
              <li key={a.id} className="flex justify-between gap-2">
                <span><span className="font-medium capitalize">{a.id}</span> <span className="text-muted-foreground">· {a.role}</span></span>
                <span className="font-mono text-[10px] text-pending">{a.status}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <p className="mt-4 font-mono text-[10px] text-muted-foreground">Pipeline: {CONTENT_STAGES.join(" → ")}</p>
    </>
  );
}
