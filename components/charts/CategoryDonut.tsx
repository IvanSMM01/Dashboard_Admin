"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Transaction } from "@/lib/types";

const COLORS = ["#3a5bff", "#8ea7ff", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4", "#64748b"];

export default function CategoryDonut({ tx }: { tx: Transaction[] }) {
  const totals = new Map<string, number>();
  for (const x of tx) if (x.type === "expense") totals.set(x.category, (totals.get(x.category) ?? 0) + x.amount);
  const data = Array.from(totals, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length) return <div className="text-sm text-ink-400">No expenses yet.</div>;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-40 h-40 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => `$${v.toFixed(0)}`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="text-[11px] text-ink-400">Spent</div>
            <div className="text-base font-semibold">${total.toFixed(0)}</div>
          </div>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="capitalize text-ink-600">{d.name}</span>
            <span className="ml-auto text-ink-400">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
