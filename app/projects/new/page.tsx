"use client";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/navigation";
import { useState } from "react";

const palette = [
  { color: "bg-accent-mint",  emoji: "🌱" },
  { color: "bg-accent-sky",   emoji: "💧" },
  { color: "bg-accent-peach", emoji: "🍑" },
  { color: "bg-accent-lilac", emoji: "🔮" },
  { color: "bg-accent-lemon", emoji: "🍋" },
  { color: "bg-accent-rose",  emoji: "🌸" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", description: "", emoji: "🚀", color: "bg-accent-sky",
    budget: 1000, currency: "USD" as const, status: "active" as const,
  });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const { project } = await r.json();
    router.push(`/projects/${project.id}`);
  }

  return (
    <>
      <Topbar title="New project" subtitle="Spin up a new workspace" />
      <form onSubmit={submit} className="px-6 py-6 max-w-xl space-y-4">
        <div className="card p-5 space-y-4">
          <label className="block text-sm">Name
            <input className="input mt-1" required value={form.name}
                   onChange={(e) => setForm({ ...form, name: e.target.value })}/>
          </label>
          <label className="block text-sm">Description
            <textarea className="input mt-1" rows={2} value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}/>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">Budget
              <input type="number" className="input mt-1" value={form.budget}
                     onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) })}/>
            </label>
            <label className="block text-sm">Currency
              <input className="input mt-1" value={form.currency}
                     onChange={(e) => setForm({ ...form, currency: e.target.value as "USD" })}/>
            </label>
          </div>
          <div>
            <div className="text-sm mb-2">Look</div>
            <div className="flex flex-wrap gap-2">
              {palette.map(p => (
                <button type="button" key={p.color}
                  onClick={() => setForm({ ...form, color: p.color, emoji: p.emoji })}
                  className={`w-10 h-10 grid place-items-center rounded-xl text-lg ${p.color} ${form.color === p.color ? "ring-2 ring-ink-900" : ""}`}>
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button disabled={busy} className="btn-primary">{busy ? "Creating…" : "Create project"}</button>
      </form>
    </>
  );
}
