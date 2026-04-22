"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Transaction } from "@/lib/types";

export default function SpendChart({ tx }: { tx: Transaction[] }) {
  // Bucket last 30 days
  const days = 30;
  const today = new Date(); today.setHours(0,0,0,0);
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (days - 1 - i));
    return { date: d, label: d.toLocaleDateString("en-US",{ month:"short", day:"numeric" }), spent: 0, earned: 0 };
  });
  const idx = new Map(buckets.map((b, i) => [b.date.toDateString(), i]));
  for (const x of tx) {
    const d = new Date(x.date); d.setHours(0,0,0,0);
    const i = idx.get(d.toDateString()); if (i == null) continue;
    if (x.type === "expense") buckets[i].spent  += x.amount;
    else                      buckets[i].earned += x.amount;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={buckets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="g-spent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3a5bff" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#3a5bff" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="g-earned" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#16a34a" stopOpacity={0.35}/>
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f7" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8a96b1" }} interval={4} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize: 11, fill: "#8a96b1" }} axisLine={false} tickLine={false} width={40}/>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #eef1f7", boxShadow: "0 4px 24px -6px rgba(16,24,40,.08)" }}
            labelStyle={{ color: "#0e1220", fontWeight: 600 }}
            formatter={(v: number, n: string) => [`$${v.toFixed(0)}`, n === "spent" ? "Spent" : "Earned"]}
          />
          <Area type="monotone" dataKey="earned" stroke="#16a34a" strokeWidth={2} fill="url(#g-earned)" />
          <Area type="monotone" dataKey="spent"  stroke="#3a5bff" strokeWidth={2} fill="url(#g-spent)"  />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
