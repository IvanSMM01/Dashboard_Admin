"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Wallet, ListChecks, Settings, Sparkles, Bot } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/",             label: "Overview",     icon: LayoutDashboard },
  { href: "/projects",     label: "Projects",     icon: FolderKanban },
  { href: "/tasks",        label: "Tasks",        icon: ListChecks },
  { href: "/transactions", label: "Transactions", icon: Wallet },
  { href: "/insights",     label: "AI Insights",  icon: Sparkles },
  { href: "/bot",          label: "Telegram Bot", icon: Bot },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-white/60 bg-white/65 backdrop-blur-xl ring-1 ring-ink-100/60">
      <div className="px-5 h-16 flex items-center gap-2 border-b border-ink-100/70">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-ink-900 to-brand-700 grid place-items-center shadow-md">
          <span className="text-white text-sm font-semibold">P</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white"/>
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">Pulse</div>
          <div className="text-[11px] text-ink-400">project tracker</div>
        </div>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={clsx(
                "relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition",
                active
                  ? "bg-gradient-to-br from-ink-900 to-ink-800 text-white shadow-md"
                  : "text-ink-600 hover:bg-white hover:shadow-sm"
              )}>
              <Icon size={16} className={active ? "opacity-90" : ""} />
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"/>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 m-3 rounded-2xl text-white relative overflow-hidden"
           style={{ background: "linear-gradient(135deg,#3a5bff 0%,#1f3ee0 60%,#11206a 100%)" }}>
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl"/>
        <div className="text-xs opacity-80 mb-1 relative">Power tip</div>
        <div className="text-sm font-medium leading-snug relative">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[11px]">⌘K</kbd> to add anything fast.
        </div>
      </div>
    </aside>
  );
}
