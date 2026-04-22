import { NextRequest, NextResponse } from "next/server";
import { mutate, readDB, uid } from "@/lib/store";
import { authorized } from "@/lib/auth";
import type { Task } from "@/lib/types";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const db = await readDB();
  const tasks = projectId ? db.tasks.filter(t => t.projectId === projectId) : db.tasks;
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.projectId || !body.title) {
    return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });
  }
  const task: Task = {
    id: uid("t"),
    projectId: String(body.projectId),
    title: String(body.title),
    status: (body.status as Task["status"]) ?? "todo",
    priority: (body.priority as Task["priority"]) ?? "med",
    dueDate: body.dueDate,
    createdAt: new Date().toISOString(),
  };
  await mutate(db => { db.tasks.push(task); });
  return NextResponse.json({ task }, { status: 201 });
}
