"use client";
import { useState } from "react";
import clsx from "clsx";
import { LayoutGrid, ListChecks, PiggyBank, PieChart } from "lucide-react";
import OverviewView from "./OverviewView";
import TasksView from "./TasksView";
import BudgetView from "./BudgetView";
import CategoriesView from "./CategoriesView";
import type { Activity } from "@/lib/store";
import type { Project, Task, Transaction, Goal, Note, Link as ProjLink, Recurring } from "@/lib/types";

export interface DashboardData {
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  perProject: Record<string, {
    progress: number;
    counts: { todo: number; inProgress: number; done: number; total: number };
    money: { spent: number; earned: number; remaining: number; burnPerDay: number; runwayDays: number };
  }>;
  activity: Activity[];
  forecast: { date: string; label: string; balance: number }[];
  reminders: {
    overdueTasks:    { id: string; title: string; dueDate?: string; priority: string; projectId: string; projectName: string; projectEmoji: string }[];
    dueSoonTasks:    { id: string; title: string; dueDate?: string; priority: string; projectId: string; projectName: string; projectEmoji: string }[];
    budgetWarnings:  { projectId: string; projectName: string; projectEmoji: string; usedPct: number; runwayDays: number | null }[];
    upcomingRecurrings: { date: string; projectId: string; projectName: string; projectEmoji: string;
                          type: "expense"|"income"; amount: number; currency: string; note?: string; category: string }[];
  };
  goals?: (Goal & { current: number; pct: number })[];
  notes?: Note[];
  links?: ProjLink[];
  recurrings?: Recurring[];
}

const TABS = [
  { id: "overview",   label: "Overview",   icon: LayoutGrid },
  { id: "tasks",      label: "Tasks",      icon: ListChecks },
  { id: "budget",     label: "Budget",     icon: PiggyBank },
  { id: "categories", label: "Categories", icon: PieChart },
] as const;
type TabId = typeof TABS[number]["id"];

export default function DashboardTabs({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState<TabId>("overview");
  return (
    <>
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 ring-1 ring-ink-100/60 w-fit shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className={clsx(
                "px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2",
                active
                  ? "bg-gradient-to-br from-ink-900 to-ink-800 text-white shadow-md"
                  : "text-ink-500 hover:text-ink-800 hover:bg-white"
              )}>
              <Icon size={14}/> {label}
            </button>
          );
        })}
      </div>

      <div key={tab} className="anim-in space-y-6">
        {tab === "overview"   && <OverviewView data={data} />}
        {tab === "tasks"      && <TasksView data={data} />}
        {tab === "budget"     && <BudgetView data={data} />}
        {tab === "categories" && <CategoriesView data={data} />}
      </div>
    </>
  );
}
