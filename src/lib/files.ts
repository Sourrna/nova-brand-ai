// File-based sources: Markdown in repo folders, bundled at build time (read-only in the browser).
const projectFiles = import.meta.glob("/projects/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const contentFiles = import.meta.glob("/content/*/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const docFiles = import.meta.glob(["/system/*.md", "/github/*.md", "/linkedin/*.md", "/brand/*.md"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/** Parses "# Title" and "- Key: value" lines from a Markdown file. */
export function parseFields(md: string) {
  const title = md.match(/^#\s+(.+)$/m)?.[1]?.replace(/^Project:\s*/, "").trim() ?? "Untitled";
  const fields: Record<string, string> = {};
  for (const m of md.matchAll(/^-\s+([^:\n]+):[ \t]*(.*)$/gm)) {
    const key = m[1];
    if (key) fields[key.trim().toLowerCase()] = (m[2] ?? "").trim();
  }
  return { title, fields };
}

const slugOf = (path: string) => (path.split("/").pop() ?? "").replace(/\.md$/, "");

export interface ProjectDoc { slug: string; path: string; title: string; fields: Record<string, string>; body: string }
export const projects: ProjectDoc[] = Object.entries(projectFiles)
  .filter(([p]) => !slugOf(p).startsWith("_"))
  .map(([path, body]) => ({ slug: slugOf(path), path: path.slice(1), body, ...parseFields(body) }));

export interface ContentDoc { slug: string; path: string; folder: string; title: string; stage: string; fields: Record<string, string>; body: string }
export const contentDocs: ContentDoc[] = Object.entries(contentFiles).map(([path, body]) => {
  const { title, fields } = parseFields(body);
  const folder = path.split("/")[2] ?? "drafts";
  return { slug: slugOf(path), path: path.slice(1), folder, title, fields, body, stage: (fields["stage"] ?? folder.replace(/s$/, "")).toLowerCase() };
});

export const doc = (path: string) => docFiles[path] ?? "";

export interface ChangelogEntry { date: string; title: string; items: string[] }
export function parseChangelog(md: string): ChangelogEntry[] {
  return md.split(/^##\s+/m).slice(1).map((block) => {
    const [head = "", ...rest] = block.split("\n");
    const [date = "", title = ""] = head.split(/\s+—\s+/);
    return { date: date.trim(), title: title.trim(), items: rest.filter((l) => l.startsWith("- ")).map((l) => l.slice(2)) };
  });
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "draft";
}

export function draftMarkdown(d: { title: string; pillar: string; source: string; body: string }) {
  return `# ${d.title}\n- Source: ${d.source || "none"}\n- Pillar: ${d.pillar}\n- Stage: draft\n- State: INFERRED\n- Visibility: INTERNAL_STRATEGY\n- Publication approval: REQUIRED\n\n${d.body}\n`;
}
