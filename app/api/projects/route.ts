import { NextRequest, NextResponse } from "next/server";
import { mutate, projectStats, readDB, uid } from "@/lib/store";
import { authorized } from "@/lib/auth";
import type { Project } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  const data = db.projects.map(p => {
    const s = projectStats(db, p.id)!;
    return { ...p, progress: s.progress, counts: s.counts, money: s.money };
  });
  return NextResponse.json({ projects: data });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const project: Project = {
    id: uid("p"),
    name: String(body.name ?? "Untitled"),
    emoji: String(body.emoji ?? "📦"),
    color: String(body.color ?? "bg-accent-sky"),
    status: (body.status as Project["status"]) ?? "active",
    description: body.description ?? "",
    budget: Number(body.budget ?? 0),
    currency: (body.currency as Project["currency"]) ?? "USD",
    startDate: body.startDate ?? new Date().toISOString(),
    dueDate: body.dueDate,
    createdAt: new Date().toISOString(),
  };
  await mutate(db => { db.projects.push(project); });
  return NextResponse.json({ project }, { status: 201 });
}
