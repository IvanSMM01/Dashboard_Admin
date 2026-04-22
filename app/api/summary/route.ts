import { NextResponse } from "next/server";
import { readDB, projectStats, recentActivity } from "@/lib/store";

/**
 * Daily-digest payload — call this from your Telegram bot on a cron and
 * format it into a message. Returns totals + per-project rollup + recent items.
 */
export async function GET() {
  const db = await readDB();
  const projects = db.projects.map(p => {
    const s = projectStats(db, p.id)!;
    return {
      id: p.id, name: p.name, emoji: p.emoji, status: p.status,
      progress: s.progress, counts: s.counts,
      money: {
        spent: s.money.spent, earned: s.money.earned,
        remaining: s.money.remaining, runwayDays: Number.isFinite(s.money.runwayDays) ? s.money.runwayDays : null,
        burnPerDay: s.money.burnPerDay,
      },
    };
  });

  const totals = {
    spent:  projects.reduce((s, p) => s + p.money.spent, 0),
    earned: projects.reduce((s, p) => s + p.money.earned, 0),
    tasks:  { done: db.tasks.filter(t => t.status === "done").length, total: db.tasks.length },
  };

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totals,
    projects,
    recent: recentActivity(db, undefined, 8).map(a => ({
      kind: a.kind, at: a.at, project: a.project.name,
      ...(a.kind === "task" ? { title: a.task.title, status: a.task.status } : {}),
      ...(a.kind === "tx"   ? { type: a.tx.type, amount: a.tx.amount, note: a.tx.note, category: a.tx.category } : {}),
    })),
  });
}
