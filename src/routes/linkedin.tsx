import { createFileRoute } from "@tanstack/react-router";
import { useMemory } from "@/lib/store";
import { contentDocs, doc } from "@/lib/files";
import { PageHeader, Panel, Md } from "@/components/ui-kit";

export const Route = createFileRoute("/linkedin")({
  head: () => ({
    meta: [
      { title: "LinkedIn Strategy — Sourena Brand Control Center" },
      { name: "description", content: "LinkedIn positioning, profile inputs and distribution plan. Planning only, no automation." },
      { property: "og:title", content: "LinkedIn Strategy — Sourena Brand Control Center" },
      { property: "og:description", content: "Positioning, profile readiness and approved content queue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LinkedinPage,
});

function LinkedinPage() {
  const m = useMemory();
  const publicFacts = m.records.filter((r) => r.visibility === "PUBLIC" && (r.state === "VERIFIED" || r.state === "USER_PROVIDED"));
  const approved = contentDocs.filter((d) => d.folder === "approved");
  const checks = [
    { label: "Profile URL known", ok: false },
    { label: "Positioning confirmed by owner", ok: false },
    { label: "At least one approved post", ok: approved.length > 0 },
    { label: "Public candidates available for review", ok: publicFacts.length > 0 },
  ];
  return (
    <>
      <PageHeader kicker="LinkedIn" title="Strategy" sub="Planning layer only. No OAuth, no automated posting." />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel label="Profile readiness">
          <ul className="space-y-2 text-sm">{checks.map((c) => <li key={c.label} className="flex justify-between"><span>{c.label}</span><span className={`font-mono text-xs ${c.ok ? "text-verified" : "text-pending"}`}>{c.ok ? "ready" : "open"}</span></li>)}</ul>
        </Panel>
        <Panel label="Public candidates — approval required">
          <ul className="space-y-2 text-sm">{publicFacts.map((r) => <li key={r.id}><span className="font-medium">{r.title}:</span> <span className="text-muted-foreground">{r.value}</span></li>)}</ul>
        </Panel>
        <Panel label="linkedin/strategy.md"><Md text={doc("/linkedin/strategy.md")} /></Panel>
        <Panel label="brand/positioning.md (draft)"><Md text={doc("/brand/positioning.md") || "No file."} /></Panel>
      </div>
    </>
  );
}
