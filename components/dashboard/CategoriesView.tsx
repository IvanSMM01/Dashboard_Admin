"use client";
import { PieChart as PieIcon, TrendingDown, Layers, Hash } from "lucide-react";
import StatCard from "@/components/StatCard";
import CategoryDonut from "@/components/charts/CategoryDonut";
import StackedBarByCategory from "@/components/charts/StackedBarByCategory";
import type { DashboardData } from "./DashboardTabs";
import { money } from "@/lib/format";
import clsx from "clsx";

const CAT_COLORS: Record<string, string> = {
  infra: "#3a5bff", tools: "#8ea7ff", design: "#a855f7", marketing: "#f59e0b",
  salary: "#0ea5e9", revenue: "#16a34a", subscription: "#06b6d4", other: "#64748b",
};

export default function CategoriesView({ data }: { data: DashboardData }) {
  const { transactions, projects } = data;
  const projectsById = new Map(projects.map(p => [p.id, p]));
  const expenses = transactions.filter(x => x.type === "expense");
  const total = expenses.reduce((s, x) => s + x.amount, 0);

  const byCat = new Map<string, number>();
  for (const x of expenses) byCat.set(x.category, (byCat.get(x.category) ?? 0) + x.amount);
  const ranked = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  const topCat = ranked[0];

  // category × project matrix
  const cats = ranked.map(r => r[0]);
  const matrix = projects.map(p => {
    const row: Record<string, number> = {};
    for (const c of cats) row[c] = 0;
    for (const x of expenses) if (x.projectId === p.id) row[x.category] = (row[x.category] ?? 0) + x.amount;
    return { p, row, total: Object.values(row).reduce((s, v) => s + v, 0) };
  });

  const avgTx = expenses.length ? total / expenses.length : 0;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard tone="ink"   icon={<TrendingDown size={14}/>} label="Total spent"    value={money(total)} hint={`${expenses.length} transactions`}/>
        <StatCard tone="lilac" icon={<PieIcon size={14}/>}      label="Top category"   value={topCat?.[0] ?? "—"} hint={topCat ? `${money(topCat[1])} (${Math.round((topCat[1]/total)*100)}%)` : "no data"}/>
        <StatCard tone="sky"   icon={<Hash size={14}/>}         label="Categories"     value={String(byCat.size)} hint={`across ${projects.length} projects`}/>
        <StatCard tone="mint"  icon={<Layers size={14}/>}       label="Avg transaction" value={money(avgTx)} hint="per expense"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold tracking-tight">Spend by category</h2>
              <p className="text-xs text-ink-400">Stacked weekly · 30 days</p>
            </div>
          </div>
          <StackedBarByCategory tx={transactions} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-3">Distribution</h2>
          <CategoryDonut tx={transactions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-4">Top categories</h2>
          <ul className="space-y-3">
            {ranked.slice(0, 8).map(([cat, amount]) => {
              const pct = Math.round((amount / total) * 100);
              return (
                <li key={cat}>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[cat] ?? "#64748b" }}/>
                    <span className="capitalize">{cat}</span>
                    <span className="ml-auto text-ink-500 tabular-nums">{money(amount)}</span>
                    <span className="text-ink-400 w-10 text-right text-xs">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CAT_COLORS[cat] ?? "#64748b" }}/>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-4">Project × category</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-ink-400">
                  <th className="text-left py-2 pr-3">Project</th>
                  {cats.map(c => <th key={c} className="text-right py-2 px-2 capitalize">{c}</th>)}
                  <th className="text-right py-2 pl-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map(({ p, row, total: rowTotal }) => (
                  <tr key={p.id} className="border-t border-ink-100">
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md grid place-items-center ${p.color}`}>{p.emoji}</span>
                        {p.name}
                      </span>
                    </td>
                    {cats.map(c => {
                      const v = row[c] ?? 0;
                      return (
                        <td key={c} className={clsx("py-2 px-2 text-right tabular-nums", v ? "text-ink-700" : "text-ink-300")}>
                          {v ? money(v) : "—"}
                        </td>
                      );
                    })}
                    <td className="py-2 pl-3 text-right font-medium tabular-nums">{money(rowTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
