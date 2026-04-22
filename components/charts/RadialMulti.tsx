"use client";
import { RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Project } from "@/lib/types";

interface Row { name: string; value: number; fill: string; }
const COLORS = ["#3a5bff", "#16a34a", "#f59e0b", "#a855f7", "#06b6d4", "#ef4444"];

export default function RadialMulti({ projects, progressById }: { projects: Project[]; progressById: Record<string, number> }) {
  const data: Row[] = projects.map((p, i) => ({
    name: p.name, value: progressById[p.id] ?? 0, fill: COLORS[i % COLORS.length],
  }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RadialBarChart innerRadius="25%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <RadialBar background dataKey="value" cornerRadius={8}/>
          <Tooltip formatter={(v: number, _n, p: any) => [`${v}%`, p.payload.name]}/>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
