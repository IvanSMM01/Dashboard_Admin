import { NextRequest, NextResponse } from "next/server";
import { mutate, readDB, uid, expandRecurring } from "@/lib/store";
import { authorized } from "@/lib/auth";
import type { Recurring } from "@/lib/types";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;
  const days = Number(req.nextUrl.searchParams.get("upcomingDays") || 30);
  const db = await readDB();
  const recurrings = projectId ? db.recurrings.filter(r => r.projectId === projectId) : db.recurrings;
  const upcoming = expandRecurring(db, days, projectId).map(({ date, recurring }) => ({
    date: date.toISOString(), recurringId: recurring.id, projectId: recurring.projectId,
    type: recurring.type, amount: recurring.amount, currency: recurring.currency,
    category: recurring.category, note: recurring.note,
  }));
  return NextResponse.json({ recurrings, upcoming });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.projectId || !body.type || body.amount == null || !body.period)
    return NextResponse.json({ error: "projectId, type, amount, period required" }, { status: 400 });
  const r: Recurring = {
    id: uid("r"),
    projectId: body.projectId, type: body.type === "income" ? "income" : "expense",
    amount: Math.abs(Number(body.amount)),
    currency: body.currency ?? "USD", category: body.category ?? "other",
    note: body.note, period: body.period,
    dayOfMonth: body.dayOfMonth, dayOfWeek: body.dayOfWeek,
    startDate: body.startDate ?? new Date().toISOString(),
    active: body.active !== false,
  };
  await mutate(db => { db.recurrings.push(r); });
  return NextResponse.json({ recurring: r }, { status: 201 });
}
