import Topbar from "@/components/Topbar";
import ProjectSwitcher from "@/components/ProjectSwitcher";
import DashboardTabs, { DashboardData } from "@/components/dashboard/DashboardTabs";
import { readDB, projectStats, recentActivity, forecastSeries, buildReminders, goalProgress } from "@/lib/store";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDB();

  const perProject = Object.fromEntries(db.projects.map(p => {
    const s = projectStats(db, p.id)!;
    return [p.id, { progress: s.progress, counts: s.counts, money: s.money }];
  }));

  const r = buildReminders(db);
  const reminders = {
    overdueTasks: r.overdueTasks.map(({ task, project }) => ({
      id: task.id, title: task.title, dueDate: task.dueDate, priority: task.priority,
      projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
    })),
    dueSoonTasks: r.dueSoonTasks.map(({ task, project }) => ({
      id: task.id, title: task.title, dueDate: task.dueDate, priority: task.priority,
      projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
    })),
    budgetWarnings: r.budgetWarnings.map(({ project, usedPct, runwayDays }) => ({
      projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
      usedPct, runwayDays: Number.isFinite(runwayDays) ? runwayDays : null,
    })),
    upcomingRecurrings: r.upcomingRecurrings.map(({ date, recurring, project }) => ({
      date, projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
      type: recurring.type, amount: recurring.amount, currency: recurring.currency,
      note: recurring.note, category: recurring.category,
    })),
  };

  const data: DashboardData = {
    projects: db.projects,
    tasks: db.tasks,
    transactions: db.transactions,
    perProject,
    activity: recentActivity(db, undefined, 10),
    forecast: forecastSeries(db, 90),
    reminders,
    goals: db.goals.map(g => ({ ...g, ...goalProgress(db, g) })),
    notes: db.notes,
    links: db.links,
    recurrings: db.recurrings,
  };

  const totalSpent = db.transactions.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);

  return (
    <>
      <Topbar title="Dashboard" subtitle={`${db.projects.length} projects · ${money(totalSpent)} spent this period`} />
      <div className="px-6 py-6 space-y-6">
        <ProjectSwitcher projects={db.projects} />
        <DashboardTabs data={data} />
      </div>
    </>
  );
}
