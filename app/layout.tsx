import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";
import { readDB } from "@/lib/store";

export const metadata: Metadata = {
  title: "Pulse — Project Dashboard",
  description: "Track projects, tasks, and money in one place.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db = await readDB();
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh flex">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
        <CommandPalette projects={db.projects} />
      </body>
    </html>
  );
}
