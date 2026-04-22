"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Transaction } from "@/lib/types";

const COLORS: Record<string, string> = {
  infra: "#3a5bff", tools: "#8ea7ff", design: "#a855f7", marketing: "#f59e0b",
  salary: "#0ea5e9", revenue: "#16a34a", subscription: "#06b6d4", other: "#64748b",
};

export default function StackedBarByCategory({ tx, days = 30 }: { tx: Transaction[]; days?: number }) {
  const today = new Date(); today.setHours(0,0,0,0);
  // group by week buckets for clarity
  const buckets = 6;
  const span = Math.ceil(days / buckets);
  const data = Array.from({ length: buckets }, (_, i) => {
    const end = new Date(today); end.setDate(end.getDate() - i * span);
    const start = new Date(end); start.setDate(start.getDate() - span + 1);
    const label = `${start.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`;
    const row: Record<string, number | string> = { label, _start: +start, _end: +end };
    for (const k of Object.keys(COLORS)) row[k] = 0;
    return row;
  }).reverse();

  for (const x of tx) {
    if (x.type !== "expense") continue;
    const t = +new Date(x.date);
    const b = data.find(r => t >= +new Date(r._start as number) && t <= +new Date(r._end as number) + 86399999);
    if (b) b[x.category] = (b[x.category] as number) + x.amount;
  }
  const cats = Object.keys(COLORS).filter(k => data.some(d => (d[k] as number) > 0));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f7" />
          <XAxis dataKey="label" axisLine={false} tickLine={false}/>
          <YAxis axisLine={false} tickLine={false} width={40}/>
          <Tooltip formatter={(v: number, n: string) => [`$${(+v).toFixed(0)}`, n]} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }}/>
          {cats.map((c, i) => (
            <Bar key={c} dataKey={c} stackId="s" fill={COLORS[c]}
                 radius={i === cats.length - 1 ? [6,6,0,0] : 0}/>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
