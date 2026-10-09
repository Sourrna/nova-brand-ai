import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { projects } from "@/lib/files";
import { PageHeader, Panel, StateBadge, Md } from "@/components/ui-kit";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const p = projects.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return { slug: p.slug, title: p.title };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Projects — Sourena Brand Control Center` },
          { name: "description", content: `Project detail for ${loaderData.title}.` },
          { property: "og:title", content: `${loaderData.title} — Sourena Brand Control Center` },
          { property: "og:description", content: `Status, evidence and next action for ${loaderData.title}.` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Project not found — Sourena Brand Control Center" }, { name: "description", content: "This project is not available in Sourena’s workspace." }, { property: "og:title", content: "Project not found — Sourena Brand Control Center" }, { property: "og:description", content: "Project unavailable." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <p className="text-sm text-muted-foreground">Project not found. <Link to="/projects" className="text-primary">Back</Link></p>,
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useLoaderData();
  const p = projects.find((x) => x.slug === slug);
  if (!p) return <p>Project not found.</p>;
  return (
    <>
      <Link to="/projects" className="font-mono text-xs text-muted-foreground hover:text-primary">← Projects</Link>
      <PageHeader kicker="Project" title={p.title} sub={<code className="font-mono">{p.path}</code>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Panel label="Fields">
          <dl className="space-y-2 text-sm">
            {Object.entries(p.fields).map(([k, v]) => (
              <div key={k}><dt className="font-mono text-[10px] uppercase text-muted-foreground">{k}</dt><dd>{k === "state" ? <StateBadge state={v.split(" ")[0] ?? "NEEDS_CONFIRMATION"} /> : v || "—"}</dd></div>
            ))}
          </dl>
        </Panel>
        <div className="md:col-span-2"><Panel label="Source file"><Md text={p.body} /></Panel></div>
      </div>
    </>
  );
}
