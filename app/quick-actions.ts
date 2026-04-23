"use server";
import { revalidatePath } from "next/cache";
import { mutate, uid } from "@/lib/store";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

export async function quickAddTask(input: {
  projectId: string; title: string; priority?: TaskPriority; dueDate?: string;
}) {
  const title = input.title.trim();
  if (!input.projectId || !title) return;
  const task: Task = {
    id: uid("t"),
    projectId: input.projectId,
    title,
    status: "todo" as TaskStatus,
    priority: input.priority ?? "med",
    dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : undefined,
    createdAt: new Date().toISOString(),
  };
  await mutate(db => { db.tasks.push(task); });
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/projects/${input.projectId}`);
}
