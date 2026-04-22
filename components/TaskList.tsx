"use client";
import type { Task } from "@/lib/types";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import clsx from "clsx";
import { dateShort } from "@/lib/format";
import { useRouter } from "next/navigation";

const priColor: Record<Task["priority"], string> = {
  high: "bg-rose-100 text-rose-700",
  med:  "bg-amber-100 text-amber-700",
  low:  "bg-ink-100 text-ink-500",
};

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  async function toggle(t: Task) {
    const next: Task["status"] =
      t.status === "done" ? "todo" :
      t.status === "todo" ? "in_progress" : "done";
    await fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  if (!tasks.length) return <div className="text-sm text-ink-400">No tasks.</div>;

  return (
    <ul className="space-y-1">
      {tasks.map((t) => (
        <li key={t.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-ink-50 transition group">
          <button onClick={() => toggle(t)} className="shrink-0">
            {t.status === "done"        ? <CheckCircle2 size={18} className="text-emerald-600" />
            : t.status === "in_progress" ? <Loader2 size={18} className="text-brand-500" />
                                          : <Circle size={18} className="text-ink-300 group-hover:text-ink-400" />}
          </button>
          <span className={clsx("text-sm flex-1", t.status === "done" && "line-through text-ink-400")}>
            {t.title}
          </span>
          <span className={clsx("chip", priColor[t.priority])}>{t.priority}</span>
          {t.dueDate && <span className="text-[11px] text-ink-400 w-14 text-right">{dateShort(t.dueDate)}</span>}
        </li>
      ))}
    </ul>
  );
}
