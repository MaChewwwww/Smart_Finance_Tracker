import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth";
import Sidebar from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ServerTime } from "@/components/layout/server-time";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const payload = await verifyJWT(accessToken);

  if (!payload || !payload.userId) {
    redirect("/login");
  }

  const user = {
    id: payload.userId as string,
    name: payload.name as string,
    email: payload.email as string,
  };

  return (
    <div className="min-h-screen bg-slate-100/40 text-slate-900 dark:bg-slate-950 dark:text-white relative overflow-x-hidden">
      {/* Background blobs for visual depth on dashboard */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/[0.03] dark:bg-blue-500/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-64 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] blur-[150px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex flex-col md:pl-64 min-h-screen relative z-10">
        {/* Top bar for desktop (notification bell / settings indicators) */}
        <header className="hidden md:flex h-14 items-center justify-between border-b border-border/80 bg-white/30 px-8 backdrop-blur-md dark:bg-slate-950/20">
          <ServerTime />
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
