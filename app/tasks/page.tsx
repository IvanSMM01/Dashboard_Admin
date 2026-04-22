import Topbar from "@/components/Topbar";
import TaskList from "@/components/TaskList";
import { readDB } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const db = await readDB();
  const grouped = db.projects.map(p => ({
    project: p,
    tasks: db.tasks.filter(t => t.projectId === p.id)
              .sort((a,b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0)),
  }));
  return (
    <>
      <Topbar title="Tasks" subtitle={`${db.tasks.length} across ${db.projects.length} projects`} />
      <div className="px-6 py-6 space-y-4">
        {grouped.map(({ project, tasks }) => (
          <div key={project.id} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl grid place-items-center text-lg ${project.color}`}>{project.emoji}</div>
              <div className="font-semibold">{project.name}</div>
              <div className="ml-auto text-xs text-ink-400">{tasks.length} tasks</div>
            </div>
            <TaskList tasks={tasks} />
          </div>
        ))}
      </div>
    </>
  );
}
