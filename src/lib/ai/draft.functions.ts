import { createServerFn } from "@tanstack/react-start";
import { memory } from "../memory";
import { generateDraft } from "./provider";

const env = () => ({
  baseUrl: process.env["AI_BASE_URL"],
  model: process.env["AI_MODEL"],
  apiKey: process.env["AI_API_KEY"],
});

/** Server-only: keys never leave the server. Sources are checked against the canonical repo memory. */
export const draftLinkedIn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: string[]; lang: "en" | "fa" }) => {
    if (!Array.isArray(d?.ids) || d.ids.length > 20 || d.ids.some((x) => typeof x !== "string"))
      throw new Error("Invalid ids");
    if (d.lang !== "en" && d.lang !== "fa") throw new Error("Invalid lang");
    return d;
  })
  .handler(async ({ data }) => generateDraft(memory, data.ids, data.lang, env()));
