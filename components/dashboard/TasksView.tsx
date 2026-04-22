"use client";
import { CheckCircle2, Loader2, Circle, Flame, Clock } from "lucide-react";
import StatCard from "@/components/StatCard";
import BurndownChart from "@/components/charts/BurndownChart";
import VelocityChart from "@/components/charts/VelocityChart";
import RadialMulti from "@/components/charts/RadialMulti";
import type { DashboardData } from "./DashboardTabs";
import type { Task } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";

const COLS: { id: Task["status"]; label: string; tone: string; Icon: any }[] = [
  { id: "todo",         label: "To do",       tone: "bg-ink-100 text-ink-700",       Icon: Circle },
  { id: "in_progress",  label: "In progress", tone: "bg-brand-50 text-brand-700",    Icon: Loader2 },
  { id: "done",         label: "Done",        tone: "bg-emerald-50 text-emerald-700",Icon: CheckCircle2 },
];

export default function TasksView({ data }: { data: DashboardData }) {
  const { tasks, projects, perProject } = data;
  const byStatus = (s: Task["status"]) => tasks.filter(t => t.status === s);
  const high = tasks.filter(t => t.priority === "high" && t.status !== "done");
  const overdue = tasks.filter(t => t.dueDate && t.status !== "done" && +new Date(t.dueDate) < Date.now());
  const completedThisWeek = tasks.filter(t => t.completedAt && Date.now() - +new Date(t.completedAt) < 7 * 86400_000).length;
  const avgVelocity = (completedThisWeek / 7).toFixed(1);
  const projectsById = new Map(projects.map(p => [p.id, p]));
  const progressById = Object.fromEntries(projects.map(p => [p.id, perProject[p.id].progress]));

  // priority distribution
  const pri = (["high","med","low"] as const).map(p => ({
    p, n: tasks.filter(t => t.priority === p).length,
  }));

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard tone="brand" icon={<CheckCircle2 size={14}/>} label="Done"            value={String(byStatus("done").length)} hint={`${completedThisWeek} this week`} />
        <StatCard tone="sky"   icon={<Loader2 size={14}/>}      label="In progress"     value={String(byStatus("in_progress").length)} />
        <StatCard tone="lemon" icon={<Flame size={14}/>}        label="High priority"   value={String(high.length)} hint="open"/>
        <StatCard tone={overdue.length ? "rose" : "mint"} icon={<Clock size={14}/>} label="Overdue" value={String(overdue.length)} hint={`velocity ${avgVelocity}/day`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold tracking-tight">Burndown</h2>
              <p className="text-xs text-ink-400">Open tasks vs ideal pace · 30 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500"/>Remaining</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-px bg-ink-300"/>Ideal</span>
            </div>
          </div>
          <BurndownChart tasks={tasks} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-3">Per-project progress</h2>
          <RadialMulti projects={projects} progressById={progressById} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold tracking-tight">Velocity</h2>
            <p className="text-xs text-ink-400">Tasks completed per day · 14 days</p>
          </div>
          <VelocityChart tasks={tasks} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-3">Priority mix</h2>
          <ul className="space-y-3">
            {pri.map(({ p, n }) => {
              const total = tasks.length || 1;
              const pct = Math.round((n / total) * 100);
              const tone = p === "high" ? "bg-rose-500" : p === "med" ? "bg-amber-500" : "bg-ink-300";
              return (
                <li key={p}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize">{p}</span>
                    <span className="text-ink-500">{n} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div className={clsx("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }}/>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Mini-kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLS.map(({ id, label, tone, Icon }) => {
          const items = byStatus(id);
          return (
            <div key={id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={clsx("chip", tone)}><Icon size={12}/>{label}</span>
                <span className="text-xs text-ink-400">{items.length}</span>
              </div>
              <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {items.slice(0, 8).map(t => {
                  const p = projectsById.get(t.projectId)!;
                  return (
                    <li key={t.id} className="rounded-xl border border-ink-100 p-3 bg-white hover:shadow-soft transition">
                      <div className="text-sm font-medium leading-snug">{t.title}</div>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-500">
                        <span className={`w-5 h-5 grid place-items-center rounded-md ${p.color}`}>{p.emoji}</span>
                        <span>{p.name}</span>
                        {t.dueDate && <span className="ml-auto">{new Date(t.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
                      </div>
                    </li>
                  );
                })}
                {items.length === 0 && <li className="text-xs text-ink-400 px-1 py-2">Empty.</li>}
              </ul>
              <div className="mt-3"><Link href="/tasks" className="text-xs text-brand-600">Open task list →</Link></div>
            </div>
          );
        })}
      </div>
    </>
  );
}
