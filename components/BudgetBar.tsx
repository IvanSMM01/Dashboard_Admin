import clsx from "clsx";
import { money } from "@/lib/format";

export default function BudgetBar({ spent, budget, currency = "USD" }: { spent: number; budget: number; currency?: string }) {
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const tone = pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-brand-500";
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink-500 mb-1.5">
        <span>{money(spent, currency)} <span className="text-ink-400">spent</span></span>
        <span className="text-ink-400">of {money(budget, currency)}</span>
      </div>
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
        <div className={clsx("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 text-[11px] text-ink-400">{pct}% of budget</div>
    </div>
  );
}
