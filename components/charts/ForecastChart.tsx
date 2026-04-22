"use client";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point { date: string; label: string; balance: number; }

export default function ForecastChart({ series }: { series: Point[] }) {
  const positive = series.every(p => p.balance >= 0);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="g-fc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={positive ? "#3a5bff" : "#ef4444"} stopOpacity={.4}/>
              <stop offset="100%" stopColor={positive ? "#3a5bff" : "#ef4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f7"/>
          <XAxis dataKey="label" axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(series.length/8))}/>
          <YAxis axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `$${v}`}/>
          <Tooltip formatter={(v: number) => [`$${Math.round(v)}`, "Balance"]} labelFormatter={(l) => l}/>
          <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="4 4"/>
          <Area type="monotone" dataKey="balance" stroke={positive ? "#3a5bff" : "#ef4444"} strokeWidth={2} fill="url(#g-fc)"/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
