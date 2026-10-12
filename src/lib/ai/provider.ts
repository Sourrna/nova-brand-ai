import type { Memory } from "../memory";
import { linkedInDraft } from "../workflow";

/** Server-side OpenAI-compatible provider config. Read from env inside server handlers only. */
export interface ProviderConfig {
  baseUrl?: string;
  model?: string;
  apiKey?: string;
}

export type DraftResult =
  | { mode: "ai"; text: string; model: string }
  | { mode: "template"; text: string; reason: string };

export function providerStatus(c: ProviderConfig): { configured: boolean; missing: string[] } {
  const missing = [
    !c.baseUrl && "AI_BASE_URL",
    !c.model && "AI_MODEL",
    !c.apiKey && "AI_API_KEY",
  ].filter(Boolean) as string[];
  return { configured: missing.length === 0, missing };
}

/**
 * Builds the draft. Source records are checked by linkedInDraft (public-safe only, throws otherwise)
 * BEFORE any provider call, so private data can never reach the provider. Falls back to the template.
 */
export async function generateDraft(
  m: Memory,
  ids: string[],
  lang: "en" | "fa",
  c: ProviderConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<DraftResult> {
  const template = linkedInDraft(m, ids, lang); // fail closed
  const st = providerStatus(c);
  if (!st.configured)
    return { mode: "template", text: template, reason: `AI not configured (missing ${st.missing.join(", ")})` };
  const facts = ids.map((id) => m.records.find((r) => r.id === id)!).map((r) => `- ${r.title}: ${r.value}`).join("\n");
  try {
    const res = await fetchImpl(`${c.baseUrl!.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${c.apiKey}` },
      body: JSON.stringify({
        model: c.model,
        messages: [
          {
            role: "system",
            content:
              "Write a short LinkedIn post draft for Sourena. Use ONLY the facts given. Never invent titles, metrics, clients, employers or achievements. " +
              (lang === "fa" ? "Write in Persian." : "Write in English."),
          },
          { role: "user", content: facts },
        ],
      }),
    });
    if (!res.ok) return { mode: "template", text: template, reason: `Provider error ${res.status}` };
    const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const out = j.choices?.[0]?.message?.content?.trim();
    if (!out) return { mode: "template", text: template, reason: "Provider returned empty output" };
    const head = lang === "fa" ? "[پیش‌نویس AI — نیازمند بازبینی و تأیید سورنا]" : "[AI DRAFT — requires Sourena's review and approval]";
    return { mode: "ai", text: `${head}\n\n${out}`, model: c.model! };
  } catch {
    return { mode: "template", text: template, reason: "Provider unreachable" };
  }
}
