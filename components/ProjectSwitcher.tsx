"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import clsx from "clsx";
import { Plus } from "lucide-react";

export default function ProjectSwitcher({
  projects, activeId,
}: { projects: Project[]; activeId?: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {projects.map((p) => {
        const active = p.id === activeId;
        return (
          <button key={p.id}
            onClick={() => router.push(`/projects/${p.id}`)}
            className={clsx(
              "group flex items-center gap-2 pl-2 pr-3 py-2 rounded-2xl border transition shrink-0",
              active
                ? "bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-900 shadow-md"
                : "bg-white/80 backdrop-blur text-ink-700 border-white/60 ring-1 ring-ink-100/60 hover:bg-white hover:shadow-sm"
            )}>
            <span className={clsx("w-7 h-7 grid place-items-center rounded-xl text-base", p.color, active && "ring-2 ring-white/30")}>
              {p.emoji}
            </span>
            <span className="text-sm font-medium">{p.name}</span>
            <span className={clsx(
              "ml-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-md",
              active ? "bg-white/15 text-white/80" : "bg-ink-100 text-ink-500"
            )}>{p.status}</span>
          </button>
        );
      })}
      <Link href="/projects/new"
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-dashed border-ink-300 text-ink-500 hover:text-ink-700 hover:border-ink-400 text-sm shrink-0">
        <Plus size={14} /> New
      </Link>
    </div>
  );
}
