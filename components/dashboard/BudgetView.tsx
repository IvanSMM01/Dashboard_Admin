"use client";
import { Wallet, TrendingDown, TrendingUp, Clock, Banknote, LineChart, CalendarClock } from "lucide-react";
import StatCard from "@/components/StatCard";
import SpendChart from "@/components/charts/SpendChart";
import BudgetTreemap from "@/components/charts/BudgetTreemap";
import ForecastChart from "@/components/charts/ForecastChart";
import BudgetBar from "@/components/BudgetBar";
import { money } from "@/lib/format";
import type { DashboardData } from "./DashboardTabs";
import clsx from "clsx";

export default function BudgetView({ data }: { data: DashboardData }) {
  const { projects, transactions, perProject } = data;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent  = transactions.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const totalEarned = transactions.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const remaining   = totalBudget - totalSpent;
  const burn = projects.reduce((s, p) => s + perProject[p.id].money.burnPerDay, 0);
  const runway = burn > 0 ? Math.floor(remaining / burn) : Infinity;

  const spentByProject = Object.fromEntries(projects.map(p => [p.id, perProject[p.id].money.spent]));
  const ranked = [...projects].sort((a, b) => perProject[b.id].money.spent - perProject[a.id].money.spent);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard tone="ink"   icon={<Wallet size={14}/>}        label="Total budget" value={money(totalBudget)} />
        <StatCard tone="sky"   icon={<TrendingDown size={14}/>}  label="Spent"        value={money(totalSpent)} delta={-3.2} hint={`${Math.round((totalSpent/Math.max(totalBudget,1))*100)}% used`}/>
        <StatCard tone="mint"  icon={<TrendingUp size={14}/>}    label="Earned"       value={money(totalEarned)} delta={12.8}/>
        <StatCard tone={runway < 14 ? "rose" : "lemon"} icon={<Clock size={14}/>} label="Runway" value={Number.isFinite(runway) ? `${runway}d` : "∞"} hint={`${money(burn)} / day`}/>
      </div>

      {/* Forecast — net balance projection over the next 90 days */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold tracking-tight inline-flex items-center gap-2"><LineChart size={16}/> 90-day forecast</h2>
            <p className="text-xs text-ink-400">Projected balance · current burn + recurring expenses/income</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5"><CalendarClock size={12}/> {data.reminders.upcomingRecurrings.length} upcoming</span>
          </div>
        </div>
        <ForecastChart series={data.forecast} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold tracking-tight">Cash flow</h2>
              <p className="text-xs text-ink-400">Spent vs earned · 30 days</p>
            </div>
          </div>
          <SpendChart tx={transactions} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-3">Budget allocation</h2>
          <p className="text-xs text-ink-400 mb-2">Tile size = budget · darker overlay = spent</p>
          <BudgetTreemap projects={projects} spentByProject={spentByProject}/>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold tracking-tight mb-4">Per-project budget</h2>
        <ul className="divide-y divide-ink-100">
          {ranked.map(p => {
            const s = perProject[p.id];
            const used = p.budget > 0 ? Math.round((s.money.spent / p.budget) * 100) : 0;
            const status = used >= 90 ? "danger" : used >= 70 ? "warn" : "ok";
            return (
              <li key={p.id} className="py-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl grid place-items-center text-lg ${p.color} shadow-sm`}>{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{p.name}</div>
                    <span className={clsx("chip text-[10px]",
                      status === "danger" ? "bg-rose-100 text-rose-700" :
                      status === "warn"   ? "bg-amber-100 text-amber-700" :
                                            "bg-emerald-100 text-emerald-700"
                    )}>{used}% used</span>
                  </div>
                  <div className="mt-1.5"><BudgetBar spent={s.money.spent} budget={p.budget} currency={p.currency}/></div>
                </div>
                <div className="text-right text-xs text-ink-500 hidden md:block">
                  <div className="inline-flex items-center gap-1"><Banknote size={12}/> {money(s.money.spent, p.currency)} / {money(p.budget, p.currency)}</div>
                  <div className="text-ink-400 mt-1">{Number.isFinite(s.money.runwayDays) ? `${s.money.runwayDays}d runway` : "∞ runway"}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
