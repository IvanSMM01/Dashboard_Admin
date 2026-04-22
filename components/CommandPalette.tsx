"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "./uiStore";
import type { Project } from "@/lib/types";
import { ArrowRight, ListChecks, Wallet, FolderKanban, Sparkles } from "lucide-react";
import clsx from "clsx";

type Mode = "menu" | "task" | "expense" | "income";

export default function CommandPalette({ projects }: { projects: Project[] }) {
  const open = useUI(s => s.paletteOpen);
  const close = useUI(s => s.closePalette);
  const toggle = useUI(s => s.togglePalette);
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("menu");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [pid, setPid] = useState<string>(projects[0]?.id ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") { e.preventDefault(); toggle(); }
      if (e.key === "Escape" && open) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggle, close]);

  useEffect(() => { if (open) { setMode("menu"); setQ(""); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const filteredProjects = useMemo(
    () => projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase())),
    [projects, q]
  );

  async function submit() {
    if (!q.trim() || !pid || busy) return;
    setBusy(true);
    try {
      if (mode === "task") {
        await fetch("/api/tasks", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: pid, title: q, priority: "med", status: "todo" }),
        });
      } else {
        // parse "<amount> [note...]" e.g. "12 OpenAI credits"
        const m = q.match(/^\s*(\d+(?:\.\d+)?)\s*(.*)$/);
        const amount = m ? parseFloat(m[1]) : 0;
        const note   = m ? m[2].trim() : q.trim();
        await fetch("/api/transactions", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: pid, type: mode, amount, currency: "USD",
            category: "other", note, source: "web",
          }),
        });
      }
      router.refresh();
      close();
    } finally { setBusy(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start pt-[12vh] px-4 bg-ink-900/40 backdrop-blur-sm" onClick={close}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-ink-100">
          {mode !== "menu" && (
            <button onClick={() => setMode("menu")}
              className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-md bg-ink-100 text-ink-600">
              {mode === "task" ? "New task" : mode === "expense" ? "New expense" : "New income"}
            </button>
          )}
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && mode !== "menu") submit(); }}
            placeholder={
              mode === "menu" ? "Type a command, search project, or add fast…" :
              mode === "task" ? "What needs to be done?" :
              "Amount + note (e.g. \"12 OpenAI credits\")"
            }
            className="flex-1 bg-transparent outline-none text-sm py-2 placeholder:text-ink-400"/>
        </div>

        {mode === "menu" ? (
          <div className="p-2 max-h-[50vh] overflow-y-auto">
            <Section title="Quick add">
              <Item icon={<ListChecks size={14}/>} label="Add a task"   onClick={() => setMode("task")} />
              <Item icon={<Wallet size={14}/>}     label="Log expense"  onClick={() => setMode("expense")} />
              <Item icon={<Wallet size={14}/>}     label="Log income"   onClick={() => setMode("income")} />
              <Item icon={<Sparkles size={14}/>}   label="Generate AI weekly summary" onClick={() => { router.push("/insights"); close(); }} />
            </Section>
            <Section title="Jump to project">
              {filteredProjects.map(p => (
                <Item key={p.id} icon={<FolderKanban size={14}/>} label={`${p.emoji}  ${p.name}`}
                      onClick={() => { router.push(`/projects/${p.id}`); close(); }} />
              ))}
            </Section>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-ink-400 mb-1.5">Project</div>
              <div className="flex flex-wrap gap-1.5">
                {projects.map(p => (
                  <button key={p.id} onClick={() => setPid(p.id)}
                    className={clsx("chip border",
                      pid === p.id ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-700 border-ink-200 hover:border-ink-300")}>
                    <span>{p.emoji}</span>{p.name}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={submit} disabled={busy || !q.trim()}
              className="btn-primary w-full disabled:opacity-50">
              {busy ? "Saving…" : <>Save <ArrowRight size={14}/></>}
            </button>
            <div className="text-[11px] text-ink-400 text-center">
              Tip: press <kbd className="px-1.5 py-0.5 rounded bg-ink-100">Enter</kbd> to save.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-ink-400">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
function Item({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm text-ink-700 hover:bg-ink-100 text-left">
      <span className="w-7 h-7 grid place-items-center rounded-lg bg-ink-100 text-ink-600">{icon}</span>
      <span>{label}</span>
      <ArrowRight size={12} className="ml-auto opacity-40" />
    </button>
  );
}
