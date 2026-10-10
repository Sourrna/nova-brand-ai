import { approve, invalidateApproval, isApprovalValid, type ApprovalBinding } from "./approval";
import { CONTENT_STAGES, type ContentItem, type Memory, type MemoryRecord } from "./memory";
import { isPubliclySafeRecord } from "./privacy";

export type Stage = (typeof CONTENT_STAGES)[number];
const GATED: Stage[] = ["approved", "published", "measured"];

export function bindingFor(item: ContentItem): ApprovalBinding {
  return {
    platform: item.platform ?? null,
    approvedScope: "public",
    body: item.body ?? "",
    claims: item.claims ?? [],
    version: String(item.version ?? 1),
    title: item.title,
  };
}

/** Records whose ids are cited by the item; unknown ids fail closed. */
export function sourceProblems(m: Memory, item: ContentItem): string[] {
  const ids = [item.sourceRecord, ...(item.claims ?? [])].filter(Boolean);
  if (!ids.length) return ["No source record — privacy classification missing"];
  const out: string[] = [];
  for (const id of new Set(ids)) {
    const r = m.records.find((x) => x.id === id);
    if (!r) out.push(`Source ${id} not found`);
    else if (!isPubliclySafeRecord(r)) out.push(`Source ${id} is ${r.visibility}/${r.state}, not public-safe`);
  }
  return out;
}

export function validateItem(m: Memory, item: ContentItem): string[] {
  const e: string[] = [];
  if (!item.title?.trim()) e.push("Title required");
  if (item.title.length > 200) e.push("Title too long");
  if ((item.body ?? "").length > 3000) e.push("Body exceeds 3000 characters");
  if (!item.platform) e.push("Platform required");
  return [...e, ...sourceProblems(m, item)];
}

/** Content edit: bumps version and always invalidates approval. Gated items fall back to review. */
export function editItem(item: ContentItem, patch: Partial<ContentItem>): ContentItem {
  const next: ContentItem = { ...item, ...patch, version: (item.version ?? 1) + 1, updatedAt: new Date().toISOString() };
  invalidateApproval(next);
  if (GATED.includes(next.stage as Stage)) next.stage = "review";
  return next;
}

export async function approveItem(m: Memory, item: ContentItem, ownerConfirmed: boolean): Promise<ContentItem> {
  if (ownerConfirmed !== true) throw new Error("Explicit owner confirmation required");
  if (item.stage !== "review") throw new Error("Only items in review can be approved");
  const errs = validateItem(m, item);
  if (errs.length) throw new Error(errs.join("; "));
  const next: ContentItem = { ...item, stage: "approved" };
  await approve(next, bindingFor(next), {
    approvedBy: "Sourena",
    approvedAt: new Date().toISOString(),
    approvedScope: "public",
    approvedPlatform: next.platform ?? null,
    approvedVersion: String(next.version ?? 1),
  });
  return next;
}

/** Move between stages. Approved/published/measured require a valid approval; "approved" only via approveItem. */
export async function moveItem(m: Memory, item: ContentItem, to: Stage): Promise<ContentItem> {
  if (!CONTENT_STAGES.includes(to)) throw new Error("Unknown stage");
  if (to === "approved") throw new Error("Use explicit approval to mark approved");
  const from = CONTENT_STAGES.indexOf(item.stage as Stage);
  const target = CONTENT_STAGES.indexOf(to);
  if (GATED.includes(to)) {
    if (target !== from + 1) throw new Error("Gated stages advance one step at a time");
    if (!(await isApprovalValid(item, bindingFor(item))) || sourceProblems(m, item).length)
      throw new Error("Valid owner approval required");
    return { ...item, stage: to };
  }
  const next = { ...item, stage: to };
  if (GATED.includes(item.stage as Stage)) invalidateApproval(next);
  return next;
}

export function publicSources(m: Memory): MemoryRecord[] {
  return m.records.filter(isPubliclySafeRecord);
}

/** Template-based LinkedIn draft (no AI provider). Uses only public-safe records; throws otherwise. */
export function linkedInDraft(m: Memory, sourceIds: string[], lang: "en" | "fa" = "en"): string {
  if (!sourceIds.length) throw new Error("Select at least one public source");
  const recs = sourceIds.map((id) => m.records.find((r) => r.id === id));
  if (recs.some((r) => !r || !isPubliclySafeRecord(r))) throw new Error("Non-public source rejected");
  const facts = (recs as MemoryRecord[]).map((r) => `• ${r.title}: ${r.value}`).join("\n");
  return lang === "fa"
    ? `[پیش‌نویس — نیازمند بازبینی و تأیید سورنا]\n\nچیزی که این هفته روی آن کار می‌کنم:\n\n${facts}\n\nچه چیزی یاد گرفتم؟ (توسط سورنا تکمیل شود)\n\nنظر شما چیست؟`
    : `[DRAFT — requires Sourena's review and approval]\n\nWhat I'm working on:\n\n${facts}\n\nWhat I learned: (Sourena to complete)\n\nWhat would you do differently?`;
}

export function newItem(m: Memory, title: string, sourceRecord: string): ContentItem {
  let n = m.content.length + 1;
  while (m.content.some((c) => c.id === `c-${String(n).padStart(3, "0")}`)) n++;
  return {
    id: `c-${String(n).padStart(3, "0")}`,
    stage: "idea",
    title,
    pillar: "Building in public",
    sourceRecord,
    platform: "linkedin",
    version: 1,
    body: "",
    claims: [],
    publicationApproved: false,
    updatedAt: new Date().toISOString(),
  };
}
