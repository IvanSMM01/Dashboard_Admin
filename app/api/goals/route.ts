import { NextRequest, NextResponse } from "next/server";
import { mutate, readDB, uid, goalProgress } from "@/lib/store";
import { authorized } from "@/lib/auth";
import type { Goal } from "@/lib/types";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;
  const db = await readDB();
  const goals = projectId ? db.goals.filter(g => g.projectId === projectId) : db.goals;
  return NextResponse.json({
    goals: goals.map(g => ({ ...g, ...goalProgress(db, g) })),
  });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.projectId || !body.kind || body.target == null || !body.title)
    return NextResponse.json({ error: "projectId, kind, target, title required" }, { status: 400 });
  const g: Goal = {
    id: uid("g"), projectId: body.projectId, kind: body.kind,
    title: body.title, target: Number(body.target), unit: body.unit,
    dueDate: body.dueDate, createdAt: new Date().toISOString(),
  };
  await mutate(db => { db.goals.push(g); });
  return NextResponse.json({ goal: g }, { status: 201 });
}
