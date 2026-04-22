"use client";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Task } from "@/lib/types";

export default function BurndownChart({ tasks, days = 30 }: { tasks: Task[]; days?: number }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (days - 1 - i));
    return { d, label: d.toLocaleDateString("en-US",{ month:"short", day:"numeric" }), remaining: 0, ideal: 0 };
  });

  const total = tasks.length;
  const slope = total / Math.max(1, days - 1);
  buckets.forEach((b, i) => {
    const remaining = tasks.filter(t => {
      const created = +new Date(t.createdAt);
      const completed = t.completedAt ? +new Date(t.completedAt) : Infinity;
      return created <= +b.d && completed > +b.d;
    }).length;
    b.remaining = remaining;
    b.ideal = Math.max(0, total - slope * i);
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={buckets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="g-rem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a5bff" stopOpacity={.35}/>
              <stop offset="100%" stopColor="#3a5bff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f7" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} interval={4}/>
          <YAxis axisLine={false} tickLine={false} width={40}/>
          <Tooltip formatter={(v: number, n: string) => [Number(v).toFixed(0), n === "remaining" ? "Remaining" : "Ideal"]}/>
          <Area type="monotone" dataKey="remaining" stroke="#3a5bff" strokeWidth={2} fill="url(#g-rem)" />
          <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1.5}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
