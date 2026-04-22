import { NextResponse } from "next/server";
import { buildReminders, readDB } from "@/lib/store";

export async function GET() {
  const db = await readDB();
  const r = buildReminders(db);
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    overdueTasks:    r.overdueTasks.map(({ task, project }) => ({
      id: task.id, title: task.title, dueDate: task.dueDate, priority: task.priority,
      projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
    })),
    dueSoonTasks:    r.dueSoonTasks.map(({ task, project }) => ({
      id: task.id, title: task.title, dueDate: task.dueDate, priority: task.priority,
      projectId: project.id, projectName: project.name, projectEmoji: project.emoji,
    })),
    budgetWarnings:  r.budgetWarnings.map(b => ({
      projectId: b.project.id, projectName: b.project.name, projectEmoji: b.project.emoji,
      usedPct: b.usedPct, runwayDays: Number.isFinite(b.runwayDays) ? b.runwayDays : null,
    })),
    upcomingRecurrings: r.upcomingRecurrings.map(u => ({
      date: u.date,
      projectId: u.project.id, projectName: u.project.name, projectEmoji: u.project.emoji,
      type: u.recurring.type, amount: u.recurring.amount, currency: u.recurring.currency,
      note: u.recurring.note, category: u.recurring.category, period: u.recurring.period,
    })),
  });
}
