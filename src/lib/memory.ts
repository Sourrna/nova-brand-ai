import raw from "../../context/memory.json";

export type KnowledgeState = "VERIFIED" | "USER_PROVIDED" | "INFERRED" | "NEEDS_CONFIRMATION";
export type Visibility = "PUBLIC" | "INTERNAL_STRATEGY" | "PRIVATE" | "SENSITIVE";

export interface MemoryRecord {
  id: string;
  domain: string;
  title: string;
  value: string;
  state: KnowledgeState;
  visibility: Visibility;
  source: string;
  evidence?: string[];
  note?: string;
}
export interface ContentItem { id: string; stage: string; title: string; pillar: string; sourceRecord: string }
export interface Account { id: string; role: string; status: string }
export interface Memory {
  schemaVersion: number;
  snapshotVersion: number;
  updatedAt: string;
  owner: string;
  records: MemoryRecord[];
  content: ContentItem[];
  accounts: Account[];
}

export const memory = raw as Memory;

export type ExportScope = "public" | "nova" | "full";

/** public: PUBLIC only. nova: PUBLIC + INTERNAL_STRATEGY. full: all except SENSITIVE. SENSITIVE never exported. */
export function filterForExport(m: Memory, scope: ExportScope): Memory {
  const allowed: Record<ExportScope, Visibility[]> = {
    public: ["PUBLIC"],
    nova: ["PUBLIC", "INTERNAL_STRATEGY"],
    full: ["PUBLIC", "INTERNAL_STRATEGY", "PRIVATE"],
  };
  let records = m.records.filter((r) => allowed[scope].includes(r.visibility));
  if (scope === "public") records = records.filter((r) => r.state === "VERIFIED" || r.state === "USER_PROVIDED");
  const sourceIds = new Set(records.map((r) => r.id));
  const content = m.content.filter((c) => sourceIds.has(c.sourceRecord));
  return { ...m, records, content, accounts: scope === "public" ? [] : m.accounts };
}

export function toMarkdown(m: Memory): string {
  const lines = [`# NOVA Memory Snapshot v${m.snapshotVersion} (${m.updatedAt})`, ""];
  const domains = [...new Set(m.records.map((r) => r.domain))];
  for (const d of domains) {
    lines.push(`## ${d}`);
    for (const r of m.records.filter((x) => x.domain === d)) {
      lines.push(`- **${r.title}** [${r.state} · ${r.visibility}]: ${r.value}${r.note ? ` _(${r.note})_` : ""}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export const BRAND_CHAIN = [
  "Foundation", "Identity", "Positioning", "Proof", "Profile", "Content",
  "Distribution", "Audience", "Opportunities", "Analytics", "Optimization",
] as const;

export const CONTENT_STAGES = ["idea", "strategy", "draft", "review", "approved", "published", "measured"] as const;
