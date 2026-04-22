import Topbar from "@/components/Topbar";
import { Bot, Webhook, Key, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

const exampleCurl = `curl -X POST $BASE/api/transactions \\
  -H "Authorization: Bearer $DASHBOARD_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"projectId":"p_telegrambot","type":"expense","amount":12,"currency":"USD","category":"tools","note":"ngrok","source":"telegram"}'`;

const exampleNode = `// In your Telegram bot
async function logExpense({ projectId, amount, note }) {
  return fetch(\`\${process.env.DASHBOARD_BASE_URL}/api/transactions\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${process.env.DASHBOARD_API_TOKEN}\`,
    },
    body: JSON.stringify({
      projectId, type: "expense", amount, currency: "USD",
      category: "other", note, source: "telegram",
    }),
  }).then(r => r.json());
}`;

export default function BotPage() {
  return (
    <>
      <Topbar title="Telegram bot" subtitle="Connect your assistant to this dashboard" />
      <div className="px-6 py-6 space-y-4 max-w-4xl">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white grid place-items-center"><Bot size={20}/></div>
            <div>
              <h2 className="font-semibold">REST endpoints, ready for your bot</h2>
              <p className="text-sm text-ink-500">All API routes return JSON and accept JSON bodies. Auth is a single bearer token.</p>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2"><Key size={16} className="text-ink-500"/><h3 className="font-semibold">1. Set your token</h3></div>
          <p className="text-sm text-ink-500">Create <code className="text-[12px] bg-ink-100 px-1.5 rounded">.env.local</code> with:</p>
          <pre className="bg-ink-900 text-ink-100 rounded-xl p-4 text-xs overflow-x-auto"><code>DASHBOARD_API_TOKEN=replace-with-a-long-random-string</code></pre>
          <p className="text-xs text-ink-400">If unset, write endpoints are open (development only).</p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2"><Webhook size={16} className="text-ink-500"/><h3 className="font-semibold">2. Available endpoints</h3></div>
          <ul className="text-sm space-y-1.5">
            <Endpoint method="GET"  path="/api/projects" desc="List all projects with rolled-up stats"/>
            <Endpoint method="GET"  path="/api/projects/:id" desc="Project detail + tasks + transactions"/>
            <Endpoint method="POST" path="/api/projects" desc="Create a new project"/>
            <Endpoint method="GET"  path="/api/tasks" desc="List tasks (?projectId=… filter)"/>
            <Endpoint method="POST" path="/api/tasks" desc="Create a task"/>
            <Endpoint method="PATCH" path="/api/tasks/:id" desc="Update task status / fields"/>
            <Endpoint method="GET"  path="/api/transactions" desc="List transactions (?projectId=…)"/>
            <Endpoint method="POST" path="/api/transactions" desc="Log expense or income"/>
            <Endpoint method="GET"  path="/api/summary" desc="Dashboard rollup (great for daily digest)"/>
          </ul>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2"><MessageSquare size={16} className="text-ink-500"/><h3 className="font-semibold">3. Examples</h3></div>
          <div>
            <div className="text-xs text-ink-400 mb-1">curl</div>
            <pre className="bg-ink-900 text-ink-100 rounded-xl p-4 text-xs overflow-x-auto"><code>{exampleCurl}</code></pre>
          </div>
          <div>
            <div className="text-xs text-ink-400 mb-1">Node (Telegraf / grammY)</div>
            <pre className="bg-ink-900 text-ink-100 rounded-xl p-4 text-xs overflow-x-auto"><code>{exampleNode}</code></pre>
          </div>
        </div>
      </div>
    </>
  );
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const tone = method === "GET" ? "bg-emerald-100 text-emerald-700"
            : method === "POST" ? "bg-brand-100 text-brand-700"
            : "bg-amber-100 text-amber-700";
  return (
    <li className="flex items-center gap-3">
      <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded ${tone} w-14 text-center`}>{method}</span>
      <code className="text-[12px] bg-ink-100 px-1.5 py-0.5 rounded">{path}</code>
      <span className="text-ink-500 text-sm">{desc}</span>
    </li>
  );
}
