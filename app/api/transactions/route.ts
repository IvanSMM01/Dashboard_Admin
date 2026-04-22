import { NextRequest, NextResponse } from "next/server";
import { mutate, readDB, uid } from "@/lib/store";
import { authorized } from "@/lib/auth";
import type { Transaction } from "@/lib/types";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const db = await readDB();
  const tx = projectId ? db.transactions.filter(x => x.projectId === projectId) : db.transactions;
  return NextResponse.json({ transactions: tx });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.projectId || !body.type || body.amount == null) {
    return NextResponse.json({ error: "projectId, type, amount required" }, { status: 400 });
  }
  const tx: Transaction = {
    id: uid("x"),
    projectId: String(body.projectId),
    type: body.type === "income" ? "income" : "expense",
    amount: Math.abs(Number(body.amount)),
    currency: (body.currency as Transaction["currency"]) ?? "USD",
    category: (body.category as Transaction["category"]) ?? "other",
    note: body.note,
    date: body.date ?? new Date().toISOString(),
    source: (body.source as Transaction["source"]) ?? "api",
  };
  await mutate(db => { db.transactions.push(tx); });
  return NextResponse.json({ transaction: tx }, { status: 201 });
}
