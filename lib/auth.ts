import { NextRequest } from "next/server";

/**
 * Simple bearer-token auth for write endpoints (used by the Telegram bot).
 * Set DASHBOARD_API_TOKEN in your env.
 *
 * Usage from the bot:
 *   fetch(`${BASE}/api/transactions`, {
 *     method: "POST",
 *     headers: {
 *       "Content-Type": "application/json",
 *       "Authorization": `Bearer ${process.env.DASHBOARD_API_TOKEN}`,
 *     },
 *     body: JSON.stringify({ projectId, type: "expense", amount: 12, category: "tools", note: "..." }),
 *   });
 */
export function authorized(req: NextRequest): boolean {
  const expected = process.env.DASHBOARD_API_TOKEN;
  if (!expected) return true; // open in dev when token not configured
  const header = req.headers.get("authorization") ?? "";
  const token  = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim() : "";
  return token === expected;
}
