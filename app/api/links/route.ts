import { NextRequest, NextResponse } from "next/server";
import { mutate, readDB, uid } from "@/lib/store";
import { authorized } from "@/lib/auth";
import type { Link } from "@/lib/types";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;
  const db = await readDB();
  const links = projectId ? db.links.filter(l => l.projectId === projectId) : db.links;
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.projectId || !body.url || !body.label)
    return NextResponse.json({ error: "projectId, url, label required" }, { status: 400 });
  const l: Link = {
    id: uid("l"), projectId: body.projectId, url: String(body.url),
    label: String(body.label), icon: body.icon ?? "🔗",
  };
  await mutate(db => { db.links.push(l); });
  return NextResponse.json({ link: l }, { status: 201 });
}
