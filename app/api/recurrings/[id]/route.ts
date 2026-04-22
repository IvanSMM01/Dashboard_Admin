import { NextRequest, NextResponse } from "next/server";
import { mutate } from "@/lib/store";
import { authorized } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await req.json();
  const updated = await mutate(db => {
    const r = db.recurrings.find(x => x.id === id); if (!r) return null;
    Object.assign(r, patch); return r;
  });
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ recurring: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await mutate(db => { db.recurrings = db.recurrings.filter(r => r.id !== id); });
  return NextResponse.json({ ok: true });
}
