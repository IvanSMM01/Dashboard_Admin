import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  tone?: "ink" | "mint" | "sky" | "peach" | "lilac" | "lemon" | "rose" | "brand";
  icon?: ReactNode;
  spark?: number[];
  className?: string;
}

const toneMap: Record<NonNullable<Props["tone"]>, { card: string; sub: string; chip: string }> = {
  ink:   { card: "bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-800",
           sub: "text-white/60", chip: "bg-white/15 text-white" },
  brand: { card: "bg-gradient-to-br from-brand-600 to-brand-800 text-white border-brand-700",
           sub: "text-white/60", chip: "bg-white/15 text-white" },
  mint:  { card: "bg-gradient-to-br from-emerald-50 to-accent-mint text-ink-900 border-emerald-100",
           sub: "text-ink-500", chip: "bg-white/70 text-ink-700" },
  sky:   { card: "bg-gradient-to-br from-sky-50 to-accent-sky text-ink-900 border-sky-100",
           sub: "text-ink-500", chip: "bg-white/70 text-ink-700" },
  peach: { card: "bg-gradient-to-br from-orange-50 to-accent-peach text-ink-900 border-orange-100",
           sub: "text-ink-500", chip: "bg-white/70 text-ink-700" },
  lilac: { card: "bg-gradient-to-br from-violet-50 to-accent-lilac text-ink-900 border-violet-100",
           sub: "text-ink-500", chip: "bg-white/70 text-ink-700" },
  lemon: { card: "bg-gradient-to-br from-yellow-50 to-accent-lemon text-ink-900 border-yellow-100",
           sub: "text-ink-500", chip: "bg-white/70 text-ink-700" },
  rose:  { card: "bg-gradient-to-br from-rose-50 to-accent-rose text-ink-900 border-rose-100",
           sub: "text-ink-500", chip: "bg-white/70 text-ink-700" },
};

function Spark({ data, dark }: { data: number[]; dark: boolean }) {
  if (!data?.length) return null;
  const w = 90, h = 28, max = Math.max(...data, 1), min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-90">
      <polyline points={pts} fill="none"
        stroke={dark ? "rgba(255,255,255,.85)" : "#3a5bff"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function StatCard({ label, value, hint, delta, tone = "ink", icon, spark, className }: Props) {
  const t = toneMap[tone];
  const dark = tone === "ink" || tone === "brand";
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={clsx("relative overflow-hidden rounded-2xl p-5 border", t.card, className)}
         style={{ boxShadow: "0 12px 30px -18px rgba(16,24,40,.25), 0 1px 0 rgba(255,255,255,.5) inset" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={clsx("w-8 h-8 rounded-lg grid place-items-center",
              dark ? "bg-white/15" : "bg-white/70")}>{icon}</div>
          )}
          <span className="text-xs font-medium opacity-90">{label}</span>
        </div>
        {typeof delta === "number" && (
          <span className={clsx("chip text-[11px]", t.chip)}>
            {positive ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {spark && <Spark data={spark} dark={dark}/>}
      </div>
      {hint && <div className={clsx("mt-1 text-xs", t.sub)}>{hint}</div>}
    </div>
  );
}
