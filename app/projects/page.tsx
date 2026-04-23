import Topbar from "@/components/Topbar";
import ProgressRing from "@/components/ProgressRing";
import BudgetBar from "@/components/BudgetBar";
import Link from "next/link";
import { readDB, projectStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const db = await readDB();
  return (
    <>
      <Topbar title="Projects" subtitle={`${db.projects.length} total`} />
      <div className="px-4 sm:px-6 py-5 sm:py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.projects.map(p => {
          const s = projectStats(db, p.id)!;
          return (
            <Link key={p.id} href={`/projects/${p.id}`} className="card p-5 hover:border-ink-300 transition">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl grid place-items-center text-2xl ${p.color}`}>{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-ink-400 truncate">{p.description}</div>
                </div>
                <ProgressRing value={s.progress} />
              </div>
              <div className="mt-4"><BudgetBar spent={s.money.spent} budget={p.budget} currency={p.currency} /></div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                <span className="chip bg-ink-100 text-ink-600">{s.counts.todo} todo</span>
                <span className="chip bg-brand-50 text-brand-700">{s.counts.inProgress} doing</span>
                <span className="chip bg-emerald-50 text-emerald-700">{s.counts.done} done</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
