import { NextRequest, NextResponse } from "next/server";
import { mutate } from "@/lib/store";
import { authorized } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await mutate(db => { db.transactions = db.transactions.filter(x => x.id !== id); });
  return NextResponse.json({ ok: true });
}
