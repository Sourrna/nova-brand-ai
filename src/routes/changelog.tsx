import { createFileRoute } from "@tanstack/react-router";
import { doc, parseChangelog } from "@/lib/files";
import { PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Sourena Brand Control Center" },
      {
        name: "description",
        content: "Important system changes to NOVA OS, read from system/changelog.md.",
      },
      { property: "og:title", content: "Changelog — Sourena Brand Control Center" },
      { property: "og:description", content: "Versioned history of system changes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChangelogPage,
});

function ChangelogPage() {
  const entries = parseChangelog(doc("/system/changelog.md")).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  return (
    <>
      <PageHeader
        kicker="Changelog"
        title="System changes"
        sub={
          <>
            Source: <code className="font-mono">system/changelog.md</code> · full history in git.
          </>
        }
      />
      <ol className="space-y-4 border-l border-border pl-6">
        {entries.map((e) => (
          <li key={e.date + e.title} className="relative">
            <span className="absolute -left-[29px] top-1.5 h-2 w-2 bg-primary" />
            <p className="font-mono text-xs text-primary">{e.date}</p>
            <p className="font-bold">{e.title}</p>
            <ul className="mt-1 list-disc pl-4 text-sm text-muted-foreground">
              {e.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}
