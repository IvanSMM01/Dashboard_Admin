"use client";
import { Bell, Search, Command } from "lucide-react";
import { useUI } from "./uiStore";

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const openPalette = useUI(s => s.openPalette);
  return (
    <header className="sticky top-0 z-20 bg-white/60 backdrop-blur-xl border-b border-white/60 ring-1 ring-ink-100/60">
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold leading-none tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-ink-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openPalette}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-ink-200/80 bg-white/80 text-ink-500 text-sm hover:bg-white transition shadow-sm">
            <Search size={14} />
            <span>Search or quick add…</span>
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-ink-400">
              <Command size={11} /> K
            </span>
          </button>
          <button className="w-10 h-10 grid place-items-center rounded-xl border border-ink-200/80 bg-white/80 text-ink-500 hover:bg-white shadow-sm relative">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500"/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center text-sm font-semibold ring-2 ring-white shadow">G</div>
            <div className="leading-tight hidden sm:block">
              <div className="text-sm font-medium">Gusar</div>
              <div className="text-[11px] text-ink-400">Founder</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
