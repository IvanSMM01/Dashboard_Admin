import Topbar from "@/components/Topbar";
import { readDB, projectStats } from "@/lib/store";
import { money } from "@/lib/format";
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const db = await readDB();
  const stats = db.projects.map(p => projectStats(db, p.id)!).filter(Boolean);

  const totalSpent = stats.reduce((s, x) => s + x.money.spent, 0);
  const topSpender = [...stats].sort((a, b) => b.money.spent - a.money.spent)[0];
  const stale = stats
    .map(s => ({ s, last: Math.max(0, ...s.tasks.filter(t => t.status !== "done").map(t => +new Date(t.createdAt))) }))
    .filter(x => x.last && Date.now() - x.last > 7 * 86400_000)
    .map(x => x.s);
  const lowRunway = stats.filter(s => Number.isFinite(s.money.runwayDays) && s.money.runwayDays < 21);
  const bestProgress = [...stats].sort((a, b) => b.progress - a.progress)[0];

  return (
    <>
      <Topbar title="AI Insights" subtitle="Auto-generated suggestions from your data" />
      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card icon={<Sparkles size={16}/>} tone="brand" title="Weekly summary">
          <p className="text-sm text-ink-700 leading-relaxed">
            You spent <b>{money(totalSpent)}</b> across <b>{stats.length}</b> projects.
            <b> {topSpender?.project.name}</b> is your top spender ({money(topSpender?.money.spent ?? 0)}).
            Best momentum: <b>{bestProgress?.project.name}</b> at {bestProgress?.progress}% complete.
          </p>
          <p className="text-xs text-ink-400 mt-2">Wire this card to /api/summary in your bot for daily Telegram digests.</p>
        </Card>

        <Card icon={<AlertTriangle size={16}/>} tone="amber" title="Budget warnings">
          {lowRunway.length === 0 ? (
            <p className="text-sm text-ink-500">All projects are healthy on runway.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowRunway.map(s => (
                <li key={s.project.id} className="flex items-center gap-2">
                  <span className={`w-7 h-7 grid place-items-center rounded-lg ${s.project.color}`}>{s.project.emoji}</span>
                  <span className="font-medium">{s.project.name}</span>
                  <span className="ml-auto text-amber-700">~{s.money.runwayDays}d left at current burn</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card icon={<TrendingUp size={16}/>} tone="emerald" title="Momentum">
          <ul className="space-y-2 text-sm">
            {stats.map(s => (
              <li key={s.project.id} className="flex items-center gap-2">
                <span className={`w-7 h-7 grid place-items-center rounded-lg ${s.project.color}`}>{s.project.emoji}</span>
                <span className="font-medium">{s.project.name}</span>
                <span className="ml-auto text-ink-500">{s.counts.done}/{s.counts.total} tasks · {s.progress}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={<Lightbulb size={16}/>} tone="lilac" title="Suggestions">
          <ul className="text-sm space-y-2 list-disc list-inside text-ink-700">
            {stale.length > 0 && <li><b>{stale[0].project.name}</b> has open tasks idle for 7+ days — break them down or close them.</li>}
            {topSpender && <li>Categorize the next 3 transactions on <b>{topSpender.project.name}</b> to improve spend insights.</li>}
            <li>Connect your Telegram bot via <code className="text-[12px] bg-ink-100 px-1.5 rounded">DASHBOARD_API_TOKEN</code> to log expenses by voice.</li>
          </ul>
        </Card>

      </div>
    </>
  );
}

function Card({ icon, title, tone, children }: { icon: React.ReactNode; title: string; tone: "brand"|"amber"|"emerald"|"lilac"; children: React.ReactNode }) {
  const map = {
    brand:   "bg-brand-50 text-brand-700",
    amber:   "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    lilac:   "bg-accent-lilac text-ink-800",
  };
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-8 h-8 grid place-items-center rounded-lg ${map[tone]}`}>{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
