"use server";
import { revalidatePath } from "next/cache";
import { mutate, uid } from "@/lib/store";
import type { Transaction, TxCategory, TxType } from "@/lib/types";

const CATEGORIES: TxCategory[] = ["infra","tools","design","marketing","salary","revenue","subscription","other"];

export async function addTransaction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const type      = (formData.get("type") === "income" ? "income" : "expense") as TxType;
  const amount    = Math.abs(Number(formData.get("amount") ?? 0));
  const currency  = (formData.get("currency") ?? "USD") as Transaction["currency"];
  const rawCat    = String(formData.get("category") ?? "other") as TxCategory;
  const category: TxCategory = CATEGORIES.includes(rawCat) ? rawCat : "other";
  const note      = (formData.get("note") ?? "").toString().trim() || undefined;
  const dateRaw   = String(formData.get("date") ?? "").trim();
  const date      = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();

  if (!projectId || !amount) return;
  const tx: Transaction = {
    id: uid("x"), projectId, type, amount, currency, category, note, date, source: "web",
  };
  await mutate(db => { db.transactions.push(tx); });
  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await mutate(db => { db.transactions = db.transactions.filter(x => x.id !== id); });
  revalidatePath("/transactions");
  revalidatePath("/");
}
