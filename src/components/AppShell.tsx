import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useMemory, memoryStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/memory", label: "Memory" },
  { to: "/projects", label: "Projects" },
  { to: "/content", label: "Content" },
  { to: "/github", label: "GitHub Proof-of-Work" },
  { to: "/linkedin", label: "LinkedIn Strategy" },
  { to: "/changelog", label: "Changelog" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const m = useMemory();
  const nav = (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV.map((n) => (
        <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: n.to === "/" }}
          className="border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          activeProps={{ className: "!border-primary bg-secondary !text-foreground" }}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
  const brand = (
    <div className="border-b border-border px-6 py-5">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">NOVA OS</p>
      <p className="mt-1 font-bold">{m.owner}</p>
      <p className="font-mono text-[10px] text-muted-foreground">snapshot v{m.snapshotVersion}{memoryStore.isImported() ? " · imported (session)" : ""}</p>
    </div>
  );
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar md:sticky md:top-0 md:block md:h-screen">{brand}{nav}</aside>
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">NOVA OS</span>
        <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 md:hidden">
          <button aria-label="Close menu" className="absolute right-4 top-4" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
          {brand}{nav}
        </div>
      )}
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8"><div className="mx-auto max-w-6xl">{children}</div></main>
    </div>
  );
}
