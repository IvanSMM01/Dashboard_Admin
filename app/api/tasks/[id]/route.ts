import { NextRequest, NextResponse } from "next/server";
import { mutate } from "@/lib/store";
import { authorized } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await req.json();
  const updated = await mutate(db => {
    const t = db.tasks.find(x => x.id === id);
    if (!t) return null;
    Object.assign(t, patch);
    if (patch.status === "done" && !t.completedAt) t.completedAt = new Date().toISOString();
    if (patch.status && patch.status !== "done") t.completedAt = undefined;
    return t;
  });
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ task: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await mutate(db => { db.tasks = db.tasks.filter(t => t.id !== id); });
  return NextResponse.json({ ok: true });
}
