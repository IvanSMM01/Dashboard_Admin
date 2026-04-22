import type { Activity } from "@/lib/store";
import { CheckCircle2, Circle, Loader2, ArrowDownRight, ArrowUpRight, StickyNote } from "lucide-react";
import { money, relTime } from "@/lib/format";
import clsx from "clsx";

export default function ActivityFeed({ items }: { items: Activity[] }) {
  if (!items.length) return <div className="text-sm text-ink-400">Nothing yet.</div>;
  return (
    <ul className="divide-y divide-ink-100">
      {items.map((it, i) => (
        <li key={i} className="py-3 flex items-center gap-3">
          <div className={clsx("w-9 h-9 rounded-xl grid place-items-center text-base", it.project.color)}>
            {it.project.emoji}
          </div>
          <div className="flex-1 min-w-0">
            {it.kind === "task" ? (
              <div className="flex items-center gap-2 min-w-0">
                {it.task.status === "done"        ? <CheckCircle2 size={14} className="text-emerald-600" />
                : it.task.status === "in_progress" ? <Loader2 size={14} className="text-brand-500" />
                                                  : <Circle size={14} className="text-ink-300" />}
                <span className="text-sm text-ink-800 truncate">{it.task.title}</span>
                <span className="ml-2 text-[11px] uppercase tracking-wide text-ink-400">{it.task.status.replace("_"," ")}</span>
              </div>
            ) : it.kind === "tx" ? (
              <div className="flex items-center gap-2 min-w-0">
                {it.tx.type === "expense"
                  ? <ArrowDownRight size={14} className="text-rose-500" />
                  : <ArrowUpRight size={14} className="text-emerald-600" />}
                <span className="text-sm text-ink-800 truncate">{it.tx.note ?? it.tx.category}</span>
                <span className="text-[11px] uppercase tracking-wide text-ink-400">{it.tx.category}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <StickyNote size={14} className="text-amber-500" />
                <span className="text-sm text-ink-800 truncate">{it.note.text}</span>
                {it.note.source && <span className="text-[11px] uppercase tracking-wide text-ink-400">{it.note.source}</span>}
              </div>
            )}
            <div className="text-[11px] text-ink-400 mt-0.5">
              {it.project.name} · {relTime(it.at)}
              {it.kind === "tx" && it.tx.source && <> · via {it.tx.source}</>}
            </div>
          </div>
          {it.kind === "tx" && (
            <div className={clsx("text-sm font-semibold tabular-nums",
              it.tx.type === "expense" ? "text-rose-600" : "text-emerald-600")}>
              {it.tx.type === "expense" ? "−" : "+"}{money(it.tx.amount, it.tx.currency)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
