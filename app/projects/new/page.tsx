"use client";
import Topbar from "@/components/Topbar";
import { useState, useTransition } from "react";
import { createProject } from "./actions";

const palette = [
  { color: "bg-accent-mint",  emoji: "🌱" },
  { color: "bg-accent-sky",   emoji: "💧" },
  { color: "bg-accent-peach", emoji: "🍑" },
  { color: "bg-accent-lilac", emoji: "🔮" },
  { color: "bg-accent-lemon", emoji: "🍋" },
  { color: "bg-accent-rose",  emoji: "🌸" },
];

export default function NewProjectPage() {
  const [form, setForm] = useState({
    name: "", description: "", emoji: "🚀", color: "bg-accent-sky",
    budget: 1000, currency: "USD" as "USD"|"EUR"|"UAH",
  });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try { await createProject(form); }
      catch (err: any) { setError(err?.message ?? "Failed to create project"); }
    });
  }
  const busy = pending;

  return (
    <>
      <Topbar title="New project" subtitle="Spin up a new workspace" />
      <form onSubmit={submit} className="px-4 sm:px-6 py-5 sm:py-6 max-w-xl space-y-4">
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
            <div className="flex flex-wrap gap-2 items-center">
              {palette.map(p => (
                <button type="button" key={p.color}
                  onClick={() => setForm({ ...form, color: p.color, emoji: p.emoji })}
                  className={`w-10 h-10 grid place-items-center rounded-xl text-lg ${p.color} ${form.color === p.color && form.emoji === p.emoji ? "ring-2 ring-ink-900" : ""}`}>
                  {p.emoji}
                </button>
              ))}
              <div className={`w-10 h-10 grid place-items-center rounded-xl text-lg ${form.color} ring-2 ring-ink-300`}>
                {form.emoji}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="block text-sm">Custom emoji or letter
                <input className="input mt-1" maxLength={3} placeholder="🚀 / A / 💼" value={form.emoji}
                       onChange={(e) => setForm({ ...form, emoji: e.target.value })}/>
              </label>
              <label className="block text-sm">Background
                <select className="input mt-1" value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}>
                  <option value="bg-accent-mint">Mint</option>
                  <option value="bg-accent-sky">Sky</option>
                  <option value="bg-accent-peach">Peach</option>
                  <option value="bg-accent-lilac">Lilac</option>
                  <option value="bg-accent-lemon">Lemon</option>
                  <option value="bg-accent-rose">Rose</option>
                  <option value="bg-ink-100">Gray</option>
                  <option value="bg-ink-900 text-white">Dark</option>
                </select>
              </label>
            </div>
            <p className="text-xs text-ink-400 mt-2">Tip: paste any emoji (🚀 💰 🎨), or use 1–2 letters as a logo (e.g. <b>AB</b>).</p>
          </div>
        </div>
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <button disabled={busy} className="btn-primary">{busy ? "Creating…" : "Create project"}</button>
      </form>
    </>
  );
}
