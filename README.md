# Pulse — Project Dashboard

Track your projects, tasks, and money in one place. Built with Next.js 15 (App Router) + Tailwind. JSON file storage out of the box — easy to swap for a real DB later.

## Killer features

- **Project switcher** — hop between projects from any page in one click.
- **⌘K command palette** — add a task or log an expense in two keystrokes.
- **Cash flow & category charts** — area + donut, per project and global.
- **Budget runway** — auto-computed days remaining at current burn rate.
- **AI-style insights page** — auto-generated weekly summary, warnings, momentum, suggestions.
- **Telegram-bot ready REST API** — every action available over HTTP with bearer-token auth.
- **`/api/summary`** — single endpoint your bot can hit on a cron for daily digests.

## Run

```bash
npm install
cp .env.example .env.local      # set DASHBOARD_API_TOKEN
npm run dev
```

Open http://localhost:3000. The first request seeds `data/db.json` with 4 example projects.

## Telegram bot integration

Set `DASHBOARD_API_TOKEN` and call the API from your bot:

```js
await fetch(`${BASE}/api/transactions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.DASHBOARD_API_TOKEN}`,
  },
  body: JSON.stringify({
    projectId: "p_telegrambot",
    type: "expense", amount: 12, currency: "USD",
    category: "tools", note: "ngrok", source: "telegram",
  }),
});
```

See the in-app **Bot** page (`/bot`) for the full endpoint list and copy-paste examples.

### Endpoints

| Method | Path                    | Notes                              |
|--------|-------------------------|------------------------------------|
| GET    | `/api/projects`         | List + rolled-up stats             |
| POST   | `/api/projects`         | Create project (auth)              |
| GET    | `/api/projects/:id`     | Detail + tasks + transactions      |
| PATCH  | `/api/projects/:id`     | Update fields (auth)               |
| DELETE | `/api/projects/:id`     | Cascades tasks + tx (auth)         |
| GET    | `/api/tasks`            | `?projectId=…` filter              |
| POST   | `/api/tasks`            | Create task (auth)                 |
| PATCH  | `/api/tasks/:id`        | Update status / fields (auth)      |
| DELETE | `/api/tasks/:id`        | (auth)                             |
| GET    | `/api/transactions`     | `?projectId=…` filter              |
| POST   | `/api/transactions`     | Log expense or income (auth)       |
| DELETE | `/api/transactions/:id` | (auth)                             |
| GET    | `/api/summary`          | Single payload for daily digest    |

## Swap storage

Everything goes through `lib/store.ts`. Replace `readDB()` / `mutate()` with Postgres / Supabase / SQLite when you outgrow the JSON file — the API surface and UI stay identical.
