"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, AlertTriangle, Clock, Wallet, TrendingUp, ListChecks, FolderKanban, BellRing, CalendarClock } from "lucide-react";
import StatCard from "@/components/StatCard";
import QuickAddModal, { type QuickMode } from "@/components/QuickAddModal";
import SpendChart from "@/components/charts/SpendChart";
import CategoryDonut from "@/components/charts/CategoryDonut";
import ActivityFeed from "@/components/ActivityFeed";
import BudgetBar from "@/components/BudgetBar";
import ProgressRing from "@/components/ProgressRing";
import { money } from "@/lib/format";
import type { DashboardData } from "./DashboardTabs";

export default function OverviewView({ data }: { data: DashboardData }) {
  const { projects, transactions, tasks, perProject, activity } = data;
  const [quick, setQuick] = useState<QuickMode>(null);
  const defaultProjectId = projects[0]?.id;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent  = transactions.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const totalIncome = transactions.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const doneTasks   = tasks.filter(t => t.status === "done").length;

  const lowRunway = projects
    .map(p => ({ p, s: perProject[p.id] }))
    .filter(x => Number.isFinite(x.s.money.runwayDays) && x.s.money.runwayDays < 14)
    .slice(0, 3);

  // Simple spark series from last 14d expenses
  const spark = (() => {
    const days = 14, today = new Date(); today.setHours(0,0,0,0);
    const arr = Array.from({ length: days }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (days - 1 - i)); return { d, v: 0 };
    });
    for (const x of transactions) if (x.type === "expense") {
      const c = new Date(x.date); c.setHours(0,0,0,0);
      const i = arr.findIndex(b => +b.d === +c); if (i >= 0) arr[i].v += x.amount;
    }
    return arr.map(b => b.v);
  })();

  const r = data.reminders;
  const remindersTotal = r.overdueTasks.length + r.dueSoonTasks.length + r.budgetWarnings.length;

  return (
    <>
      {remindersTotal > 0 && (
        <div className="card p-4 flex flex-col md:flex-row gap-3 md:items-center border-l-4 border-l-rose-400">
          <div className="flex items-center gap-2 shrink-0 text-rose-700">
            <BellRing size={16}/>
            <span className="font-semibold">{remindersTotal} item{remindersTotal===1?"":"s"} need attention</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {r.overdueTasks.length > 0 && (
              <span className="chip bg-rose-50 text-rose-700"><Clock size={12}/> {r.overdueTasks.length} overdue</span>
            )}
            {r.dueSoonTasks.length > 0 && (
              <span className="chip bg-amber-50 text-amber-700"><Clock size={12}/> {r.dueSoonTasks.length} due soon</span>
            )}
            {r.budgetWarnings.length > 0 && (
              <span className="chip bg-amber-50 text-amber-700"><AlertTriangle size={12}/> {r.budgetWarnings.length} budget alert</span>
            )}
            {r.upcomingRecurrings.length > 0 && (
              <span className="chip bg-brand-50 text-brand-700"><CalendarClock size={12}/> {r.upcomingRecurrings.length} recurring this week</span>
            )}
          </div>
          <details className="md:ml-auto group">
            <summary className="text-xs text-ink-500 cursor-pointer hover:text-ink-800 list-none select-none">
              <span className="group-open:hidden">Show details ▾</span>
              <span className="hidden group-open:inline">Hide ▴</span>
            </summary>
            <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
              {r.overdueTasks.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg bg-rose-50 px-2 py-1.5">
                  <span className="text-base">{t.projectEmoji}</span>
                  <span className="truncate">{t.title}</span>
                  <span className="ml-auto text-[11px] text-rose-700">overdue</span>
                </div>
              ))}
              {r.dueSoonTasks.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg bg-amber-50 px-2 py-1.5">
                  <span className="text-base">{t.projectEmoji}</span>
                  <span className="truncate">{t.title}</span>
                  <span className="ml-auto text-[11px] text-amber-700">{t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : ""}</span>
                </div>
              ))}
              {r.upcomingRecurrings.slice(0, 4).map((u, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-brand-50 px-2 py-1.5">
                  <span className="text-base">{u.projectEmoji}</span>
                  <span className="truncate">{u.note ?? u.category}</span>
                  <span className="ml-auto text-[11px] text-brand-700">
                    {u.type === "expense" ? "−" : "+"}${u.amount} · {new Date(u.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard tone="ink"   icon={<Wallet size={14}/>}      label="Total budget"  value={money(totalBudget)} hint="across all projects" />
        <StatCard tone="sky"   icon={<TrendingUp size={14}/>}  label="Total spent"   value={money(totalSpent)}  delta={-3.2} hint="last 30 days" spark={spark}
                  onClick={projects.length ? () => setQuick("expense") : undefined} actionHint="Add expense"/>
        <StatCard tone="mint"  icon={<TrendingUp size={14}/>}  label="Income"        value={money(totalIncome)} delta={12.8} hint="last 30 days"
                  onClick={projects.length ? () => setQuick("income") : undefined} actionHint="Add income"/>
        <StatCard tone="lilac" icon={<ListChecks size={14}/>}  label="Tasks done"    value={`${doneTasks}/${tasks.length}`} hint={`${Math.round(doneTasks/Math.max(tasks.length,1)*100)}% completion`}
                  onClick={projects.length ? () => setQuick("task") : undefined} actionHint="Add task"/>
        <StatCard tone="peach" icon={<FolderKanban size={14}/>} label="Active"        value={`${projects.filter(p=>p.status==="active").length}`} hint={`${projects.filter(p=>p.status==="paused").length} paused`}
                  onClick={() => setQuick("project")} actionHint="New project"/>
      </div>

      <QuickAddModal mode={quick} onClose={() => setQuick(null)} projects={projects} defaultProjectId={defaultProjectId}/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold tracking-tight">Cash flow</h2>
              <p className="text-xs text-ink-400">Last 30 days · all projects</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500"/>Spent</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"/>Earned</span>
            </div>
          </div>
          <SpendChart tx={transactions} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-3">Spend by category</h2>
          <CategoryDonut tx={transactions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold tracking-tight">Projects</h2>
            <Link href="/projects" className="text-xs text-brand-600 inline-flex items-center gap-1">See all <ArrowUpRight size={12}/></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map(p => {
              const s = perProject[p.id];
              return (
                <Link key={p.id} href={`/projects/${p.id}`}
                  className="group rounded-2xl border border-ink-100 p-4 hover:-translate-y-0.5 hover:shadow-card transition bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center text-lg ${p.color} shadow-sm`}>{p.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-[11px] text-ink-400 truncate">{p.description}</div>
                    </div>
                    <ProgressRing value={s.progress}/>
                  </div>
                  <div className="mt-3"><BudgetBar spent={s.money.spent} budget={p.budget} currency={p.currency}/></div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                    <span className="chip bg-ink-100 text-ink-600">{s.counts.todo} todo</span>
                    <span className="chip bg-brand-50 text-brand-700">{s.counts.inProgress} doing</span>
                    <span className="chip bg-emerald-50 text-emerald-700">{s.counts.done} done</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold tracking-tight">Recent activity</h2>
            <Link href="/transactions" className="text-xs text-brand-600 inline-flex items-center gap-1">All <ArrowUpRight size={12}/></Link>
          </div>
          <ActivityFeed items={activity} />
        </div>
      </div>

      {lowRunway.length > 0 && (
        <div className="card p-5 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 mb-3 text-amber-700">
            <AlertTriangle size={16}/>
            <h2 className="font-semibold">Needs attention</h2>
          </div>
          <ul className="space-y-2 text-sm">
            {lowRunway.map(({ p, s }) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg grid place-items-center text-base ${p.color}`}>{p.emoji}</span>
                <span className="font-medium">{p.name}</span>
                <span className="ml-auto inline-flex items-center gap-1 text-amber-700">
                  <Clock size={12}/> ~{s.money.runwayDays}d budget runway
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
