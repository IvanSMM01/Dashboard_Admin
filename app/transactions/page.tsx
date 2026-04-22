import Topbar from "@/components/Topbar";
import { readDB } from "@/lib/store";
import { money, dateShort } from "@/lib/format";
import clsx from "clsx";
import QuickAddTransaction from "@/components/QuickAddTransaction";
import { deleteTransaction } from "./actions";
import { Download, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const db = await readDB();
  const projectsById = new Map(db.projects.map(p => [p.id, p]));
  const txs = [...db.transactions].sort((a,b) => +new Date(b.date) - +new Date(a.date));
  return (
    <>
      <Topbar title="Transactions" subtitle={`${txs.length} entries`} />
      <div className="px-6 py-6 space-y-4">
        <QuickAddTransaction projects={db.projects} />

        <div className="flex items-center justify-between">
          <div className="text-xs text-ink-400">Click any row to delete it.</div>
          <a href="/api/export/transactions"
             className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-ink-100 text-sm hover:bg-ink-50">
            <Download size={14}/> Export CSV
          </a>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Note</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {txs.map(x => {
                const p = projectsById.get(x.projectId)!;
                return (
                  <tr key={x.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                    <td className="px-4 py-3 text-ink-500">{dateShort(x.date)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-6 h-6 grid place-items-center rounded-md ${p.color}`}>{p.emoji}</span>
                        {p.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{x.note ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-ink-500">{x.category}</td>
                    <td className="px-4 py-3 text-ink-400">{x.source ?? "web"}</td>
                    <td className={clsx("px-4 py-3 text-right font-semibold tabular-nums",
                      x.type === "expense" ? "text-rose-600" : "text-emerald-600")}>
                      {x.type === "expense" ? "−" : "+"}{money(x.amount, x.currency)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <form action={deleteTransaction}>
                        <input type="hidden" name="id" value={x.id}/>
                        <button className="text-ink-300 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50" title="Delete">
                          <Trash2 size={14}/>
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
