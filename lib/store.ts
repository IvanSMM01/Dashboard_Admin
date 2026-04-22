import "server-only";
import { supabase, TABLES, type TableName } from "./supabase";
import type { DB, Goal, Link, Note, Project, Recurring, Task, Transaction } from "./types";

/* ----------------------------- date helpers ----------------------------- */
// Postgres returns timestamptz; we keep ISO strings everywhere in the app.
function toIso(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function rowToProject(r: any): Project {
  return { ...r, startDate: toIso(r.startDate)!, dueDate: toIso(r.dueDate), createdAt: toIso(r.createdAt)! };
}
function rowToTask(r: any): Task {
  return { ...r, dueDate: toIso(r.dueDate), createdAt: toIso(r.createdAt)!, completedAt: toIso(r.completedAt) };
}
function rowToTx(r: any): Transaction {
  return { ...r, amount: Number(r.amount), date: toIso(r.date)! };
}
function rowToRecurring(r: any): Recurring {
  return { ...r, amount: Number(r.amount), startDate: toIso(r.startDate)! };
}
function rowToGoal(r: any): Goal {
  return { ...r, target: Number(r.target), dueDate: toIso(r.dueDate), createdAt: toIso(r.createdAt)! };
}
function rowToNote(r: any): Note { return { ...r, createdAt: toIso(r.createdAt)! }; }
function rowToLink(r: any): Link { return { ...r }; }

/* ------------------------------- read DB ------------------------------- */
export async function readDB(): Promise<DB> {
  const [projects, tasks, transactions, recurrings, goals, notes, links] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("tasks").select("*"),
    supabase.from("transactions").select("*"),
    supabase.from("recurrings").select("*"),
    supabase.from("goals").select("*"),
    supabase.from("notes").select("*"),
    supabase.from("links").select("*"),
  ]);
  for (const r of [projects, tasks, transactions, recurrings, goals, notes, links]) {
    if (r.error) throw new Error(`Supabase read failed: ${r.error.message}`);
  }
  let db: DB = {
    projects:     (projects.data ?? []).map(rowToProject),
    tasks:        (tasks.data ?? []).map(rowToTask),
    transactions: (transactions.data ?? []).map(rowToTx),
    recurrings:   (recurrings.data ?? []).map(rowToRecurring),
    goals:        (goals.data ?? []).map(rowToGoal),
    notes:        (notes.data ?? []).map(rowToNote),
    links:        (links.data ?? []).map(rowToLink),
  };
  if (db.projects.length === 0) db = await seedDB();
  return db;
}

/* ------------------------------ writes ------------------------------- */
type Row = { id: string };

async function syncTable(name: TableName, before: Row[], after: Row[]) {
  const beforeMap = new Map(before.map(r => [r.id, r]));
  const afterMap  = new Map(after.map(r => [r.id, r]));

  const toUpsert: any[] = [];
  for (const row of after) {
    const prev = beforeMap.get(row.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(row)) toUpsert.push(row);
  }
  const toDelete: string[] = [];
  for (const row of before) if (!afterMap.has(row.id)) toDelete.push(row.id);

  if (toDelete.length) {
    const { error } = await supabase.from(name).delete().in("id", toDelete);
    if (error) throw new Error(`Delete on ${name} failed: ${error.message}`);
  }
  if (toUpsert.length) {
    const { error } = await supabase.from(name).upsert(toUpsert);
    if (error) throw new Error(`Upsert on ${name} failed: ${error.message}`);
  }
}

export async function writeDB(before: DB, after: DB): Promise<void> {
  for (const t of TABLES) {
    await syncTable(t, (before as any)[t], (after as any)[t]);
  }
}

export async function mutate<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const before = await readDB();
  const after  = JSON.parse(JSON.stringify(before)) as DB;
  const result = await fn(after);
  await writeDB(before, after);
  return result;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/* --------------------------------- seed --------------------------------- */
async function seedDB(): Promise<DB> {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const off = (n: number) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };

  const projects: Project[] = [
    { id: "p_telegrambot", name: "Telegram Assistant", emoji: "🤖", color: "bg-accent-sky",
      status: "active", description: "Personal AI assistant bot in Telegram",
      budget: 2000, currency: "USD", startDate: iso(off(-40)), dueDate: iso(off(30)), createdAt: iso(off(-40)) },
    { id: "p_dashboard", name: "Project Dashboard", emoji: "📊", color: "bg-accent-mint",
      status: "active", description: "Self-hosted dashboard for tracking my projects",
      budget: 800, currency: "USD", startDate: iso(off(-10)), dueDate: iso(off(20)), createdAt: iso(off(-10)) },
    { id: "p_landing", name: "SaaS Landing", emoji: "🚀", color: "bg-accent-peach",
      status: "active", description: "Marketing site + waitlist",
      budget: 1200, currency: "USD", startDate: iso(off(-25)), dueDate: iso(off(10)), createdAt: iso(off(-25)) },
    { id: "p_research", name: "ML Research", emoji: "🧪", color: "bg-accent-lilac",
      status: "paused", description: "Side experiments with vector DBs",
      budget: 500, currency: "USD", startDate: iso(off(-90)), createdAt: iso(off(-90)) },
  ];

  const tasks: Task[] = [
    { id: "t1",  projectId: "p_telegrambot", title: "Webhook + auth handshake",     status: "done",        priority: "high", createdAt: iso(off(-30)), completedAt: iso(off(-25)) },
    { id: "t2",  projectId: "p_telegrambot", title: "Connect to dashboard API",     status: "in_progress", priority: "high", dueDate: iso(off(3)),  createdAt: iso(off(-12)) },
    { id: "t3",  projectId: "p_telegrambot", title: "Voice → expense parsing",      status: "todo",        priority: "med",  dueDate: iso(off(10)), createdAt: iso(off(-3)) },
    { id: "t4",  projectId: "p_telegrambot", title: "Daily digest cron",            status: "todo",        priority: "low",  dueDate: iso(off(14)), createdAt: iso(off(-1)) },
    { id: "t5",  projectId: "p_dashboard",   title: "App scaffolding",              status: "done",        priority: "high", createdAt: iso(off(-9)),  completedAt: iso(off(-9)) },
    { id: "t6",  projectId: "p_dashboard",   title: "Project switcher + KPIs",      status: "in_progress", priority: "high", dueDate: iso(off(2)), createdAt: iso(off(-7)) },
    { id: "t7",  projectId: "p_dashboard",   title: "REST API for bot",             status: "in_progress", priority: "med", dueDate: iso(off(4)), createdAt: iso(off(-5)) },
    { id: "t8",  projectId: "p_dashboard",   title: "Command palette",              status: "todo",        priority: "med", dueDate: iso(off(8)), createdAt: iso(off(-2)) },
    { id: "t9",  projectId: "p_landing",     title: "Hero section copy",            status: "done",        priority: "med", createdAt: iso(off(-20)), completedAt: iso(off(-15)) },
    { id: "t10", projectId: "p_landing",     title: "Pricing table",                status: "in_progress", priority: "high", dueDate: iso(off(-1)), createdAt: iso(off(-8)) },
    { id: "t11", projectId: "p_landing",     title: "SEO meta + OG",                status: "todo",        priority: "low",  dueDate: iso(off(5)), createdAt: iso(off(-1)) },
    { id: "t12", projectId: "p_research",    title: "Benchmark pgvector vs Qdrant", status: "in_progress", priority: "low",  createdAt: iso(off(-50)) },
  ];

  const transactions: Transaction[] = [
    { id: "x1", projectId: "p_telegrambot", type: "expense", amount: 20,  currency: "USD", category: "infra",        note: "Bot hosting (Fly.io)", date: iso(off(-28)), source: "web" },
    { id: "x2", projectId: "p_telegrambot", type: "expense", amount: 18,  currency: "USD", category: "subscription", note: "OpenAI credits",        date: iso(off(-14)), source: "telegram" },
    { id: "x3", projectId: "p_telegrambot", type: "expense", amount: 12,  currency: "USD", category: "tools",        note: "ngrok pro month",       date: iso(off(-6)),  source: "web" },
    { id: "x4", projectId: "p_dashboard",   type: "expense", amount: 9,   currency: "USD", category: "subscription", note: "Vercel hobby+ extras",  date: iso(off(-6)),  source: "web" },
    { id: "x5", projectId: "p_dashboard",   type: "expense", amount: 49,  currency: "USD", category: "design",       note: "UI kit license",        date: iso(off(-4)),  source: "web" },
    { id: "x6", projectId: "p_landing",     type: "expense", amount: 120, currency: "USD", category: "marketing",    note: "Initial ad test",       date: iso(off(-9)),  source: "web" },
    { id: "x7", projectId: "p_landing",     type: "income",  amount: 480, currency: "USD", category: "revenue",      note: "Pre-orders week 1",     date: iso(off(-2)),  source: "web" },
    { id: "x8", projectId: "p_landing",     type: "expense", amount: 35,  currency: "USD", category: "tools",        note: "Domain + email",        date: iso(off(-22)), source: "web" },
    { id: "x9", projectId: "p_research",    type: "expense", amount: 60,  currency: "USD", category: "infra",        note: "GPU rental",            date: iso(off(-45)), source: "web" },
  ];

  const recurrings: Recurring[] = [
    { id: "r1", projectId: "p_telegrambot", type: "expense", amount: 20,  currency: "USD", category: "infra",        note: "Fly.io",       period: "monthly", dayOfMonth: 1,  startDate: iso(off(-40)), active: true },
    { id: "r2", projectId: "p_telegrambot", type: "expense", amount: 20,  currency: "USD", category: "subscription", note: "OpenAI",       period: "monthly", dayOfMonth: 14, startDate: iso(off(-40)), active: true },
    { id: "r3", projectId: "p_dashboard",   type: "expense", amount: 9,   currency: "USD", category: "subscription", note: "Vercel Pro",   period: "monthly", dayOfMonth: 6,  startDate: iso(off(-10)), active: true },
    { id: "r4", projectId: "p_landing",     type: "income",  amount: 240, currency: "USD", category: "revenue",      note: "MRR baseline", period: "monthly", dayOfMonth: 5,  startDate: iso(off(-25)), active: true },
  ];

  const goals: Goal[] = [
    { id: "g1", projectId: "p_telegrambot", kind: "tasks_done", title: "Ship MVP",        target: 8,    unit: "tasks", dueDate: iso(off(30)), createdAt: iso(off(-20)) },
    { id: "g2", projectId: "p_landing",     kind: "revenue",    title: "First $1k",       target: 1000, unit: "USD",   dueDate: iso(off(20)), createdAt: iso(off(-25)) },
    { id: "g3", projectId: "p_dashboard",   kind: "spend_cap",  title: "Stay under $300", target: 300,  unit: "USD",   dueDate: iso(off(40)), createdAt: iso(off(-10)) },
  ];

  const notes: Note[] = [
    { id: "n1", projectId: "p_telegrambot", text: "Спробувати tts через elevenlabs для відповідей.", createdAt: iso(off(-5)), source: "telegram" },
    { id: "n2", projectId: "p_landing",     text: "Додати соц-докази у hero.",                       createdAt: iso(off(-3)), source: "web" },
  ];

  const links: Link[] = [
    { id: "l1", projectId: "p_telegrambot", label: "Repo",      url: "https://github.com/me/telegram-assistant", icon: "💻" },
    { id: "l2", projectId: "p_telegrambot", label: "Bot chat",  url: "https://t.me/MyAssistantBot",              icon: "💬" },
    { id: "l3", projectId: "p_landing",     label: "Live site", url: "https://example.com",                       icon: "🌐" },
    { id: "l4", projectId: "p_landing",     label: "Figma",     url: "https://figma.com/file/abc",                icon: "🎨" },
    { id: "l5", projectId: "p_dashboard",   label: "Docs",      url: "https://docs.example.com",                  icon: "📚" },
  ];

  // Insert in FK order
  const inserts: [TableName, any[]][] = [
    ["projects", projects], ["tasks", tasks], ["transactions", transactions],
    ["recurrings", recurrings], ["goals", goals], ["notes", notes], ["links", links],
  ];
  for (const [t, rows] of inserts) {
    if (rows.length === 0) continue;
    const { error } = await supabase.from(t).insert(rows);
    if (error) throw new Error(`Seed ${t} failed: ${error.message}`);
  }
  return { projects, tasks, transactions, recurrings, goals, notes, links };
}

/* ---------------------------- project stats ----------------------------- */
export function projectStats(db: DB, projectId: string) {
  const project = db.projects.find(p => p.id === projectId);
  if (!project) return null;

  const tasks = db.tasks.filter(t => t.projectId === projectId);
  const tx    = db.transactions.filter(x => x.projectId === projectId);

  const done   = tasks.filter(t => t.status === "done").length;
  const inProg = tasks.filter(t => t.status === "in_progress").length;
  const todo   = tasks.filter(t => t.status === "todo").length;
  const total  = tasks.length;

  const spent  = tx.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const earned = tx.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const remaining = project.budget - spent;

  const since   = Date.now() - 30 * 86400_000;
  const last30  = tx.filter(x => x.type === "expense" && +new Date(x.date) >= since)
                    .reduce((s, x) => s + x.amount, 0);
  const burnPerDay = last30 / 30;
  const runwayDays = burnPerDay > 0 ? Math.max(0, Math.floor(remaining / burnPerDay)) : Infinity;

  return {
    project, tasks, tx,
    counts: { done, inProgress: inProg, todo, total },
    progress: total ? Math.round((done / total) * 100) : 0,
    money: { spent, earned, remaining, burnPerDay, runwayDays },
  };
}

/* --------------------------- recent activity ---------------------------- */
export type Activity =
  | { kind: "task";  at: string; project: Project; task: Task }
  | { kind: "tx";    at: string; project: Project; tx: Transaction }
  | { kind: "note";  at: string; project: Project; note: Note };

export function recentActivity(db: DB, projectId?: string, limit = 12): Activity[] {
  const projectsById = new Map(db.projects.map(p => [p.id, p]));
  const items: Activity[] = [];
  for (const t of db.tasks) {
    if (projectId && t.projectId !== projectId) continue;
    const p = projectsById.get(t.projectId); if (!p) continue;
    items.push({ kind: "task", at: t.completedAt ?? t.createdAt, project: p, task: t });
  }
  for (const x of db.transactions) {
    if (projectId && x.projectId !== projectId) continue;
    const p = projectsById.get(x.projectId); if (!p) continue;
    items.push({ kind: "tx", at: x.date, project: p, tx: x });
  }
  for (const n of db.notes) {
    if (projectId && n.projectId !== projectId) continue;
    const p = projectsById.get(n.projectId); if (!p) continue;
    items.push({ kind: "note", at: n.createdAt, project: p, note: n });
  }
  return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, limit);
}

/* --------------------- recurring expansion + forecast ------------------- */
function nextRecurringDate(r: Recurring, after: Date): Date | null {
  const d = new Date(after); d.setHours(12,0,0,0);
  const start = new Date(r.startDate); start.setHours(12,0,0,0);
  let cursor = new Date(Math.max(+d, +start));

  if (r.period === "weekly") {
    const want = r.dayOfWeek ?? 1;
    const diff = (want - cursor.getDay() + 7) % 7;
    cursor.setDate(cursor.getDate() + diff);
    return cursor;
  }
  if (r.period === "monthly") {
    const want = Math.min(28, r.dayOfMonth ?? 1);
    if (cursor.getDate() > want) cursor.setMonth(cursor.getMonth() + 1);
    cursor.setDate(want);
    return cursor;
  }
  if (r.period === "yearly") {
    const want = Math.min(28, r.dayOfMonth ?? start.getDate());
    const targetMonth = start.getMonth();
    let year = cursor.getFullYear();
    let candidate = new Date(year, targetMonth, want, 12);
    if (+candidate < +cursor) candidate = new Date(year + 1, targetMonth, want, 12);
    return candidate;
  }
  return null;
}

export function expandRecurring(db: DB, days: number, projectId?: string)
  : { date: Date; recurring: Recurring }[] {
  const out: { date: Date; recurring: Recurring }[] = [];
  const horizon = new Date(); horizon.setDate(horizon.getDate() + days);
  for (const r of db.recurrings) {
    if (!r.active) continue;
    if (projectId && r.projectId !== projectId) continue;
    let cursor = new Date();
    for (let i = 0; i < days * 2; i++) {
      const next = nextRecurringDate(r, cursor);
      if (!next || +next > +horizon) break;
      out.push({ date: next, recurring: r });
      cursor = new Date(next); cursor.setDate(cursor.getDate() + 1);
    }
  }
  return out.sort((a, b) => +a.date - +b.date);
}

export function forecastSeries(db: DB, days = 90, projectId?: string) {
  const projects = projectId ? db.projects.filter(p => p.id === projectId) : db.projects;
  const stats = projects.map(p => projectStats(db, p.id)!).filter(Boolean);
  let balance = stats.reduce((s, x) => s + x.money.remaining, 0);
  const burnPerDay = stats.reduce((s, x) => s + (x.money.burnPerDay || 0), 0);

  const recurring = expandRecurring(db, days, projectId);
  const recurMap = new Map<string, number>();
  for (const r of recurring) {
    const key = r.date.toISOString().slice(0, 10);
    const sign = r.recurring.type === "expense" ? -1 : +1;
    recurMap.set(key, (recurMap.get(key) ?? 0) + sign * r.recurring.amount);
  }

  const today = new Date(); today.setHours(0,0,0,0);
  const series: { date: string; label: string; balance: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    if (i > 0) {
      balance -= burnPerDay;
      balance += recurMap.get(d.toISOString().slice(0, 10)) ?? 0;
    }
    series.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      balance: Math.round(balance * 100) / 100,
    });
  }
  return series;
}

/* ------------------------------ goals progress ----------------------------- */
export function goalProgress(db: DB, g: Goal): { current: number; pct: number } {
  if (g.kind === "tasks_done") {
    const current = db.tasks.filter(t => t.projectId === g.projectId && t.status === "done").length;
    return { current, pct: g.target > 0 ? Math.min(100, Math.round((current / g.target) * 100)) : 0 };
  }
  if (g.kind === "revenue") {
    const current = db.transactions
      .filter(x => x.projectId === g.projectId && x.type === "income")
      .reduce((s, x) => s + x.amount, 0);
    return { current, pct: g.target > 0 ? Math.min(100, Math.round((current / g.target) * 100)) : 0 };
  }
  if (g.kind === "spend_cap") {
    const current = db.transactions
      .filter(x => x.projectId === g.projectId && x.type === "expense")
      .reduce((s, x) => s + x.amount, 0);
    return { current, pct: g.target > 0 ? Math.min(100, Math.round((current / g.target) * 100)) : 0 };
  }
  return { current: 0, pct: 0 };
}

/* -------------------------------- reminders ------------------------------- */
export function buildReminders(db: DB) {
  const now = Date.now();
  const soon = now + 3 * 86400_000;
  const projectsById = new Map(db.projects.map(p => [p.id, p]));

  const overdueTasks = db.tasks
    .filter(t => t.status !== "done" && t.dueDate && +new Date(t.dueDate) < now)
    .map(t => ({ task: t, project: projectsById.get(t.projectId)! }));

  const dueSoonTasks = db.tasks
    .filter(t => t.status !== "done" && t.dueDate && +new Date(t.dueDate) >= now && +new Date(t.dueDate) < soon)
    .map(t => ({ task: t, project: projectsById.get(t.projectId)! }));

  const budgetWarnings = db.projects.map(p => {
    const s = projectStats(db, p.id)!;
    const usedPct = p.budget > 0 ? Math.round((s.money.spent / p.budget) * 100) : 0;
    return { project: p, usedPct, runwayDays: s.money.runwayDays };
  }).filter(x => x.usedPct >= 80 || (Number.isFinite(x.runwayDays) && x.runwayDays < 14));

  const upcomingRecurrings = expandRecurring(db, 7).map(({ date, recurring }) => ({
    date: date.toISOString(), recurring, project: projectsById.get(recurring.projectId)!,
  }));

  return { overdueTasks, dueSoonTasks, budgetWarnings, upcomingRecurrings };
}
