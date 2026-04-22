import { NextRequest, NextResponse } from "next/server";
import { mutate, readDB, uid } from "@/lib/store";
import { authorized } from "@/lib/auth";
import type { Note } from "@/lib/types";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;
  const db = await readDB();
  const notes = projectId ? db.notes.filter(n => n.projectId === projectId) : db.notes;
  return NextResponse.json({ notes: notes.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.projectId || !body.text)
    return NextResponse.json({ error: "projectId and text required" }, { status: 400 });
  const n: Note = {
    id: uid("n"), projectId: body.projectId, text: String(body.text),
    createdAt: new Date().toISOString(), source: body.source ?? "api",
  };
  await mutate(db => { db.notes.push(n); });
  return NextResponse.json({ note: n }, { status: 201 });
}
