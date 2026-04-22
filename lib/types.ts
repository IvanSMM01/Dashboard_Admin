export type ProjectStatus = "active" | "paused" | "done";

export interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: ProjectStatus;
  description?: string;
  budget: number;
  currency: "USD" | "EUR" | "UAH";
  startDate: string;
  dueDate?: string;
  createdAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "med" | "high";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export type TxType = "expense" | "income";
export type TxCategory =
  | "infra" | "tools" | "design" | "marketing"
  | "salary" | "revenue" | "subscription" | "other";

export interface Transaction {
  id: string;
  projectId: string;
  type: TxType;
  amount: number;
  currency: "USD" | "EUR" | "UAH";
  category: TxCategory;
  note?: string;
  date: string;
  source?: "web" | "telegram" | "api" | "recurring";
}

export type RecurringPeriod = "weekly" | "monthly" | "yearly";

export interface Recurring {
  id: string;
  projectId: string;
  type: TxType;
  amount: number;
  currency: "USD" | "EUR" | "UAH";
  category: TxCategory;
  note?: string;
  period: RecurringPeriod;
  dayOfMonth?: number;       // 1-28 for monthly/yearly
  dayOfWeek?: number;        // 0-6 for weekly (0 = Sun)
  startDate: string;         // ISO
  active: boolean;
}

export type GoalKind = "revenue" | "tasks_done" | "spend_cap" | "custom";

export interface Goal {
  id: string;
  projectId: string;
  kind: GoalKind;
  title: string;
  target: number;
  unit?: string;             // e.g. "USD", "tasks", "users"
  dueDate?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  text: string;
  createdAt: string;
  source?: "web" | "telegram" | "api";
}

export interface Link {
  id: string;
  projectId: string;
  label: string;
  url: string;
  icon?: string;
}

export interface DB {
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  recurrings: Recurring[];
  goals: Goal[];
  notes: Note[];
  links: Link[];
}
