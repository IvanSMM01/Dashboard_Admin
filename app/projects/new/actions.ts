"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutate, uid } from "@/lib/store";
import type { Project } from "@/lib/types";

export async function createProject(input: {
  name: string; description?: string;
  emoji: string; color: string;
  budget: number; currency: "USD"|"EUR"|"UAH";
}) {
  const project: Project = {
    id: uid("p"),
    name: input.name.trim() || "Untitled",
    description: input.description?.trim() || "",
    emoji: input.emoji?.trim() || "📦",
    color: input.color || "bg-accent-sky",
    status: "active",
    budget: Number(input.budget) || 0,
    currency: input.currency,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  await mutate(db => { db.projects.push(project); });
  revalidatePath("/");
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}
