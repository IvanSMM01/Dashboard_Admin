import { NextRequest, NextResponse } from "next/server";
import { mutate, projectStats, readDB } from "@/lib/store";
import { authorized } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const s = projectStats(db, id);
  if (!s) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    project: s.project, tasks: s.tasks, transactions: s.tx,
    progress: s.progress, counts: s.counts, money: s.money,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await req.json();
  const updated = await mutate(db => {
    const p = db.projects.find(x => x.id === id);
    if (!p) return null;
    Object.assign(p, patch);
    return p;
  });
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ project: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await mutate(db => {
    db.projects     = db.projects.filter(p => p.id !== id);
    db.tasks        = db.tasks.filter(t => t.projectId !== id);
    db.transactions = db.transactions.filter(x => x.projectId !== id);
  });
  return NextResponse.json({ ok: true });
}
