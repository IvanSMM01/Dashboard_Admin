"use client";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { Plus, Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { addTransaction } from "@/app/transactions/actions";
import type { Project } from "@/lib/types";

const CATEGORIES = ["infra","tools","design","marketing","salary","revenue","subscription","other"] as const;

export default function QuickAddTransaction({ projects, defaultProjectId }: { projects: Project[]; defaultProjectId?: string }) {
  const [type, setType] = useState<"expense"|"income">("expense");
  const [pending, start] = useTransition();
  const def = defaultProjectId ?? projects[0]?.id ?? "";

  return (
    <form
      action={(fd) => start(async () => { await addTransaction(fd); (document.getElementById("qa-form") as HTMLFormElement)?.reset(); })}
      id="qa-form"
      className="card p-4 grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2"
    >
      <input type="hidden" name="type" value={type} />
      <div className="col-span-2 sm:col-auto inline-flex rounded-xl bg-ink-50 p-1 text-xs w-fit">
        <button type="button" onClick={() => setType("expense")}
          className={clsx("px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5",
            type === "expense" ? "bg-rose-500 text-white shadow-sm" : "text-ink-500 hover:text-ink-800")}>
          <ArrowDownRight size={12}/> Expense
        </button>
        <button type="button" onClick={() => setType("income")}
          className={clsx("px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5",
            type === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-ink-500 hover:text-ink-800")}>
          <ArrowUpRight size={12}/> Income
        </button>
      </div>

      <Field label="Project">
        <select name="projectId" defaultValue={def} className="input">
          {projects.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
        </select>
      </Field>

      <Field label="Amount">
        <input name="amount" type="number" step="0.01" min="0" required placeholder="0.00"
          className="input w-28 tabular-nums"/>
      </Field>

      <Field label="Currency">
        <select name="currency" defaultValue="USD" className="input w-20">
          <option>USD</option><option>EUR</option><option>UAH</option>
        </select>
      </Field>

      <Field label="Category">
        <select name="category" defaultValue={type === "income" ? "revenue" : "other"} className="input">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Note">
        <input name="note" type="text" placeholder="What for?" className="input w-48"/>
      </Field>

      <Field label="Date">
        <input name="date" type="date" className="input"/>
      </Field>

      <button disabled={pending}
        className="col-span-2 sm:col-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink-900 text-white text-sm font-medium shadow-md hover:bg-ink-800 disabled:opacity-60">
        {pending ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
        Add
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-ink-400">{label}</span>
      {children}
    </label>
  );
}
