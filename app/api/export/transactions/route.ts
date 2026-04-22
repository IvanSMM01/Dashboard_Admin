import { NextRequest } from "next/server";
import { readDB } from "@/lib/store";

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;
  const db = await readDB();
  const projectsById = new Map(db.projects.map(p => [p.id, p]));
  const rows = (projectId ? db.transactions.filter(x => x.projectId === projectId) : db.transactions)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const header = ["date","project","type","amount","currency","category","note","source"];
  const body = rows.map(x => [
    new Date(x.date).toISOString(),
    projectsById.get(x.projectId)?.name ?? x.projectId,
    x.type, x.type === "expense" ? -x.amount : x.amount,
    x.currency, x.category, x.note ?? "", x.source ?? "",
  ].map(csvEscape).join(","));

  const csv = [header.join(","), ...body].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
