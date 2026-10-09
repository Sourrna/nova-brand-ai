import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { projects } from "@/lib/files";
import { useMemory } from "@/lib/store";
import { PageHeader, StateBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Sourena Brand Control Center" },
      { name: "description", content: "Sourena's projects with status, goal, evidence and next action." },
      { property: "og:title", content: "Projects — Sourena Brand Control Center" },
      { property: "og:description", content: "Project files and memory records tracked as proof of work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <Outlet />,
});

export function ProjectList() {
  const m = useMemory();
  const memProjects = m.records.filter((r) => (r.domain === "project" || r.domain === "research") && !projects.some((p) => p.fields["memory record"] === r.id || p.title === r.title));
  return (
    <>
      <PageHeader kicker="Projects" title="Projects" sub="Files in projects/ plus memory records not yet documented." />
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.slug} to="/projects/$slug" params={{ slug: p.slug }} className="border border-border bg-card p-5 hover:border-primary">
            <div className="flex items-start justify-between gap-2"><p className="font-bold">{p.title}</p><StateBadge state={(p.fields["state"] ?? "").split(" ")[0] ?? "NEEDS_CONFIRMATION"} /></div>
            <dl className="mt-3 space-y-1 text-sm">
              <div><dt className="inline text-muted-foreground">Status: </dt><dd className="inline">{p.fields["status"] || "—"}</dd></div>
              <div><dt className="inline text-muted-foreground">Goal: </dt><dd className="inline">{p.fields["problem"] || "—"}</dd></div>
              <div><dt className="inline text-muted-foreground">Evidence: </dt><dd className="inline">{p.fields["evidence"] || "—"}</dd></div>
              <div><dt className="inline text-muted-foreground">Next: </dt><dd className="inline">{p.fields["next action"] || "Not set"}</dd></div>
            </dl>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground">{p.path}</p>
          </Link>
        ))}
        {memProjects.map((r) => (
          <div key={r.id} className="border border-dashed border-border p-5">
            <div className="flex items-start justify-between gap-2"><p className="font-bold">{r.title}</p><StateBadge state={r.state} /></div>
            <p className="mt-2 text-sm text-muted-foreground">{r.value}</p>
            <p className="mt-3 text-xs text-pending">Next: provide details, then add projects/{r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md from the template.</p>
          </div>
        ))}
      </div>
    </>
  );
}
