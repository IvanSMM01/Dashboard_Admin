import Topbar from "@/components/Topbar";
import ProjectSwitcher from "@/components/ProjectSwitcher";
import BudgetBar from "@/components/BudgetBar";
import ProgressRing from "@/components/ProgressRing";
import DashboardTabs, { DashboardData } from "@/components/dashboard/DashboardTabs";
import { readDB, projectStats, recentActivity, forecastSeries, buildReminders, goalProgress } from "@/lib/store";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const stats = projectStats(db, id);
  if (!stats) notFound();
  const { project: p, tasks, tx, progress, money: m } = stats;

  const r = buildReminders(db);
  const keepProj = (pid: string) => pid === p.id;
  const reminders = {
    overdueTasks: r.overdueTasks.filter(x => keepProj(x.project.id)).map(({ task, project }) => ({
      id: task.id, title: task.title, dueDate: task.dueDate, priority: task.priority,
      projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
    })),
    dueSoonTasks: r.dueSoonTasks.filter(x => keepProj(x.project.id)).map(({ task, project }) => ({
      id: task.id, title: task.title, dueDate: task.dueDate, priority: task.priority,
      projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
    })),
    budgetWarnings: r.budgetWarnings.filter(x => keepProj(x.project.id)).map(({ project, usedPct, runwayDays }) => ({
      projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
      usedPct, runwayDays: Number.isFinite(runwayDays) ? runwayDays : null,
    })),
    upcomingRecurrings: r.upcomingRecurrings.filter(x => keepProj(x.project.id)).map(({ date, recurring, project }) => ({
      date, projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
      type: recurring.type, amount: recurring.amount, currency: recurring.currency,
      note: recurring.note, category: recurring.category,
    })),
  };

  // Build a project-scoped DashboardData so the same 4 templates work here too.
  const data: DashboardData = {
    projects: [p],
    tasks,
    transactions: tx,
    perProject: { [p.id]: { progress: stats.progress, counts: stats.counts, money: stats.money } },
    activity: recentActivity(db, p.id, 12),
    forecast: forecastSeries(db, 90, p.id),
    reminders,
    goals: db.goals.filter(g => g.projectId === p.id).map(g => ({ ...g, ...goalProgress(db, g) })),
    notes: db.notes.filter(n => n.projectId === p.id),
    links: db.links.filter(l => l.projectId === p.id),
    recurrings: db.recurrings.filter(rc => rc.projectId === p.id),
  };

  return (
    <>
      <Topbar title={p.name} subtitle={p.description ?? "Project detail"} />
      <div className="px-6 py-6 space-y-6">
        <ProjectSwitcher projects={db.projects} activeId={p.id} />

        {/* Hero card */}
        <div className="card p-6 flex flex-col md:flex-row gap-6 items-start">
          <div className={`w-16 h-16 rounded-2xl grid place-items-center text-3xl ${p.color} shadow-sm`}>{p.emoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{p.name}</h2>
              <span className="chip bg-ink-100 text-ink-600 uppercase">{p.status}</span>
            </div>
            <p className="text-sm text-ink-500 mt-1">{p.description}</p>
            <div className="mt-4 max-w-md"><BudgetBar spent={m.spent} budget={p.budget} currency={p.currency} /></div>
          </div>
          <div className="text-center">
            <ProgressRing value={progress} size={72} />
            <div className="text-[11px] text-ink-400 mt-1">progress</div>
          </div>
        </div>

        {/* Same 4 dashboard templates, scoped to this project */}
        <DashboardTabs data={data} />
      </div>
    </>
  );
}
