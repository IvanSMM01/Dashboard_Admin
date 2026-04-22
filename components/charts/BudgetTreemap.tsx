"use client";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import type { Project } from "@/lib/types";

const COLORS = ["#3a5bff", "#8ea7ff", "#22c55e", "#f59e0b", "#a855f7", "#06b6d4", "#ef4444", "#64748b"];

interface Item { name: string; size: number; spent: number; emoji: string; }

export default function BudgetTreemap({ projects, spentByProject }:
  { projects: Project[]; spentByProject: Record<string, number> }) {
  const data: Item[] = projects.map(p => ({
    name: p.name, emoji: p.emoji, size: p.budget, spent: spentByProject[p.id] ?? 0,
  }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <Treemap data={data} dataKey="size" stroke="#fff" content={<Cell colors={COLORS}/>}>
          <Tooltip formatter={(v: number, _n, p: any) => [`$${v} budget · $${p.payload.spent} spent`, p.payload.name]} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

function Cell(props: any) {
  const { x, y, width, height, index = 0, payload, colors, depth, name, size, spent, emoji } = props;
  if (width < 6 || height < 6) return null;
  // Recharts calls content for the root node too; payload may be undefined there.
  if (depth === 0) return null;
  const data = payload ?? { size, spent, name, emoji };
  if (!data || data.size == null) return null;
  const fill = colors[index % colors.length];
  const used = data.size > 0 ? Math.min(1, (data.spent ?? 0) / data.size) : 0;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={10} ry={10} opacity={.95}/>
      <rect x={x} y={y + height - height * used} width={width} height={height * used} fill="#0e1220" opacity={.18} rx={10} ry={10}/>
      {width > 80 && height > 40 && (
        <>
          <text x={x + 12} y={y + 22} fill="#fff" fontSize={14}>{data.emoji}</text>
          <text x={x + 12} y={y + 40} fill="#fff" fontSize={12} fontWeight={600}>{data.name}</text>
          <text x={x + 12} y={y + 56} fill="rgba(255,255,255,.85)" fontSize={11}>
            ${data.spent ?? 0} / ${data.size}
          </text>
        </>
      )}
    </g>
  );
}
