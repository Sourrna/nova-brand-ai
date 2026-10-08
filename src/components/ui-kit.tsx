import type { ReactNode } from "react";
import type { KnowledgeState } from "@/lib/memory";

export const STATE_STYLE: Record<KnowledgeState, string> = {
  VERIFIED: "text-verified border-verified/40",
  USER_PROVIDED: "text-provided border-provided/40",
  INFERRED: "text-inferred border-inferred/40",
  NEEDS_CONFIRMATION: "text-pending border-pending/40",
};

export function StateBadge({ state }: { state: string }) {
  const cls = STATE_STYLE[state as KnowledgeState] ?? "text-muted-foreground border-border";
  return <span className={`inline-block border px-1.5 font-mono text-[10px] ${cls}`}>{state}</span>;
}

export function Panel({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: ReactNode }) {
  return (
    <header className="mb-6 border-b border-border pb-5">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">{kicker}</p>
      <h1 className="mt-2 text-2xl font-bold md:text-3xl">{title}</h1>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </header>
  );
}

export function Md({ text }: { text: string }) {
  return <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">{text}</pre>;
}

export function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export const btn = "border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40";
export const chip = (on: boolean) => `px-2 py-1 font-mono text-xs ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`;
