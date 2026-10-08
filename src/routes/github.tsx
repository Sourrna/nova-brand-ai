import { createFileRoute } from "@tanstack/react-router";
import { useMemory } from "@/lib/store";
import { projects, doc } from "@/lib/files";
import { PageHeader, Panel, StateBadge, Md } from "@/components/ui-kit";

export const Route = createFileRoute("/github")({
  head: () => ({
    meta: [
      { title: "GitHub Proof of Work — NOVA OS" },
      { name: "description", content: "Proof-of-work tracking: which projects have real evidence and which skills they demonstrate." },
      { property: "og:title", content: "GitHub Proof of Work — NOVA OS" },
      { property: "og:description", content: "Evidence coverage per project and skill." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GithubPage,
});

function GithubPage() {
  const m = useMemory();
  const acct = m.accounts.find((a) => a.id === "github");
  const skills = m.records.filter((r) => r.domain === "skill");
  const withEvidence = m.records.filter((r) => r.evidence?.length);
  return (
    <>
      <PageHeader kicker="GitHub" title="Proof of Work" sub={<>Account status: <span className="font-mono text-pending">{acct?.status}</span> · no API integration yet (read-only ingest planned).</>} />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel label="Evidence coverage">
          <ul className="space-y-2 text-sm">
            {projects.map((p) => (
              <li key={p.slug} className="flex justify-between gap-2"><span>{p.title}</span><span className={`font-mono text-xs ${p.fields.evidence ? "text-verified" : "text-pending"}`}>{p.fields.evidence || "missing"}</span></li>
            ))}
            {withEvidence.map((r) => <li key={r.id} className="flex justify-between gap-2 text-muted-foreground"><span>{r.id} · {r.title}</span><span className="font-mono text-xs">{r.evidence!.join(", ")}</span></li>)}
          </ul>
        </Panel>
        <Panel label="Skills without evidence">
          <ul className="space-y-2 text-sm">
            {skills.map((s) => <li key={s.id} className="flex justify-between gap-2"><span>{s.title}</span><StateBadge state={s.state} /></li>)}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Each skill needs a repo, commit or demo before it can be shown as VERIFIED.</p>
        </Panel>
        <div className="md:col-span-2"><Panel label="github/proof-of-work.md"><Md text={doc("/github/proof-of-work.md")} /></Panel></div>
      </div>
    </>
  );
}
