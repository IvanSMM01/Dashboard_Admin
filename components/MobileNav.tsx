"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";
import { LayoutDashboard, FolderKanban, Wallet, ListChecks, Settings, Sparkles, Bot, X, Plus } from "lucide-react";
import { useUI } from "./uiStore";

const primary = [
  { href: "/",             label: "Overview",     icon: LayoutDashboard },
  { href: "/projects",     label: "Projects",     icon: FolderKanban },
  { href: "/tasks",        label: "Tasks",        icon: ListChecks },
  { href: "/transactions", label: "Wallet",       icon: Wallet },
];

const all = [
  ...primary,
  { href: "/insights",     label: "AI Insights",  icon: Sparkles },
  { href: "/bot",          label: "Telegram Bot", icon: Bot },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function MobileNav() {
  const pathname = usePathname();
  const open      = useUI(s => s.mobileNavOpen);
  const close     = useUI(s => s.closeMobileNav);
  const openPal   = useUI(s => s.openPalette);

  // Close drawer on route change
  useEffect(() => { close(); }, [pathname, close]);
  // Lock body scroll when drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      {/* Slide-in drawer (mobile + tablet) */}
      <div className={clsx("lg:hidden fixed inset-0 z-50 transition", open ? "pointer-events-auto" : "pointer-events-none")}>
        <div className={clsx("absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity",
                              open ? "opacity-100" : "opacity-0")} onClick={close}/>
        <aside className={clsx("absolute left-0 top-0 bottom-0 w-72 max-w-[85%] bg-white shadow-2xl flex flex-col transition-transform",
                                 open ? "translate-x-0" : "-translate-x-full")}>
          <div className="px-5 h-16 flex items-center gap-2 border-b border-ink-100/70">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-ink-900 to-brand-700 grid place-items-center shadow-md">
              <span className="text-white text-sm font-semibold">P</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white"/>
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">Pulse</div>
              <div className="text-[11px] text-ink-400">project tracker</div>
            </div>
            <button onClick={close} className="ml-auto w-9 h-9 grid place-items-center rounded-lg text-ink-400 hover:text-ink-800 hover:bg-ink-50">
              <X size={18}/>
            </button>
          </div>
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {all.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link key={href} href={href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition",
                    active
                      ? "bg-gradient-to-br from-ink-900 to-ink-800 text-white shadow-md"
                      : "text-ink-700 hover:bg-ink-50"
                  )}>
                  <Icon size={16}/>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <button onClick={() => { openPal(); close(); }}
                  className="mx-3 mb-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white text-sm font-medium shadow-md flex items-center justify-center gap-2">
            <Plus size={14}/> Quick add (⌘K)
          </button>
        </aside>
      </div>

      {/* Bottom tab bar (mobile only) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/60 bg-white/85 backdrop-blur-xl ring-1 ring-ink-100/60"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-5 h-14">
          {primary.slice(0, 2).map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href}
                className={clsx("flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-ink-900" : "text-ink-400")}>
                <Icon size={18} className={active ? "scale-110 transition" : ""}/>
                <span>{label}</span>
              </Link>
            );
          })}
          <button onClick={openPal}
            className="flex items-center justify-center -mt-5">
            <span className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-lg ring-4 ring-white">
              <Plus size={20}/>
            </span>
          </button>
          {primary.slice(2).map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href}
                className={clsx("flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-ink-900" : "text-ink-400")}>
                <Icon size={18} className={active ? "scale-110 transition" : ""}/>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
