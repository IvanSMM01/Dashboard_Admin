"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Task } from "@/lib/types";

export default function VelocityChart({ tasks }: { tasks: Task[] }) {
  // Tasks completed per day in last 14 days
  const days = 14;
  const today = new Date(); today.setHours(0,0,0,0);
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (days - 1 - i));
    return { d, label: d.toLocaleDateString("en-US",{ weekday: "short" }), done: 0 };
  });
  for (const t of tasks) {
    if (!t.completedAt) continue;
    const c = new Date(t.completedAt); c.setHours(0,0,0,0);
    const i = data.findIndex(x => +x.d === +c);
    if (i >= 0) data[i].done += 1;
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f7" />
          <XAxis dataKey="label" axisLine={false} tickLine={false}/>
          <YAxis axisLine={false} tickLine={false} width={30} allowDecimals={false}/>
          <Tooltip formatter={(v: number) => [v, "Completed"]}/>
          <Bar dataKey="done" fill="#16a34a" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
