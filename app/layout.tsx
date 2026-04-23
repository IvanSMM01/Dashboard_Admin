import "./globals.css";
import type { Metadata, Viewport } from "next";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import CommandPalette from "@/components/CommandPalette";
import { readDB } from "@/lib/store";

export const metadata: Metadata = {
  title: "Pulse — Project Dashboard",
  description: "Track projects, tasks, and money in one place.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3a5bff",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db = await readDB();
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh flex">
          <Sidebar />
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</main>
        </div>
        <MobileNav />
        <CommandPalette projects={db.projects} />
      </body>
    </html>
  );
}
