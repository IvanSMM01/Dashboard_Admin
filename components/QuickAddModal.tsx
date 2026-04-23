"use client";
import { useEffect, useState, useTransition } from "react";
import clsx from "clsx";
import { X, ArrowDownRight, ArrowUpRight, ListChecks, FolderPlus, Loader2 } from "lucide-react";
import { addTransaction } from "@/app/transactions/actions";
import { quickAddTask } from "@/app/quick-actions";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";

export type QuickMode = "expense" | "income" | "task" | "project" | null;

const CATEGORIES = ["infra","tools","design","marketing","salary","revenue","subscription","other"] as const;

export default function QuickAddModal({
  mode, onClose, projects, defaultProjectId,
}: {
  mode: QuickMode; onClose: () => void; projects: Project[]; defaultProjectId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mode) return null;

  function submit(fd: FormData) {
    start(async () => {
      if (mode === "expense" || mode === "income") {
        fd.set("type", mode);
        await addTransaction(fd);
      } else if (mode === "task") {
        await quickAddTask({
          projectId: String(fd.get("projectId") ?? ""),
          title: String(fd.get("title") ?? ""),
          priority: (fd.get("priority") as any) ?? "med",
          dueDate: String(fd.get("dueDate") ?? "") || undefined,
        });
      }
      onClose();
      router.refresh();
    });
  }

  if (mode === "project") {
    // Just navigate — project creation has a dedicated page
    router.push("/projects/new");
    onClose();
    return null;
  }

  const title = {
    expense: "Add expense",
    income:  "Add income",
    task:    "Add task",
  }[mode]!;
  const Icon = mode === "expense" ? ArrowDownRight : mode === "income" ? ArrowUpRight : ListChecks;
  const accent = mode === "expense" ? "text-rose-600" : mode === "income" ? "text-emerald-600" : "text-brand-600";
  const def = defaultProjectId ?? projects[0]?.id ?? "";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 backdrop-blur-sm p-4"
         onClick={onClose}>
      <form action={submit} onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Icon className={accent} size={18}/>
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="ml-auto text-ink-400 hover:text-ink-800 p-1 rounded-md hover:bg-ink-50">
            <X size={16}/>
          </button>
        </div>

        <Field label="Project">
          <select name="projectId" defaultValue={def} className="input w-full" required>
            {projects.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
          </select>
        </Field>

        {(mode === "expense" || mode === "income") && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount">
                <input name="amount" type="number" step="0.01" min="0" required autoFocus
                       placeholder="0.00" className="input w-full tabular-nums"/>
              </Field>
              <Field label="Currency">
                <select name="currency" defaultValue="USD" className="input w-full">
                  <option>USD</option><option>EUR</option><option>UAH</option>
                </select>
              </Field>
            </div>
            <Field label="Category">
              <select name="category" defaultValue={mode === "income" ? "revenue" : "other"} className="input w-full">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Note">
              <input name="note" type="text" placeholder="What for?" className="input w-full"/>
            </Field>
            <Field label="Date">
              <input name="date" type="date" className="input w-full"/>
            </Field>
          </>
        )}

        {mode === "task" && (
          <>
            <Field label="Title">
              <input name="title" type="text" required autoFocus placeholder="What needs to be done?" className="input w-full"/>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <select name="priority" defaultValue="med" className="input w-full">
                  <option value="low">Low</option>
                  <option value="med">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <Field label="Due date">
                <input name="dueDate" type="date" className="input w-full"/>
              </Field>
            </div>
          </>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl text-sm text-ink-500 hover:bg-ink-50">
            Cancel
          </button>
          <button disabled={pending} type="submit"
            className={clsx("ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-sm font-medium shadow-md disabled:opacity-60",
              mode === "expense" ? "bg-rose-600 hover:bg-rose-700" :
              mode === "income"  ? "bg-emerald-600 hover:bg-emerald-700" :
                                   "bg-ink-900 hover:bg-ink-800")}>
            {pending ? <Loader2 size={14} className="animate-spin"/> : <Icon size={14}/>}
            {title.replace("Add ", "Add ")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-ink-400 block mb-1">{label}</span>
      {children}
    </label>
  );
}

// Re-export the icon set for the not-yet-used "project" pill
export { FolderPlus };
