"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

// Icons
import {
  Wallet,
  LayoutDashboard,
  ArrowRightLeft,
  ShieldAlert,
  BarChart3,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface SidebarProps {
  user: UserProfile;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
    { name: "Debts", href: "/debts", icon: ShieldAlert },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "AI Assistant", href: "/chatbot", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const response = await axios.post("/api/auth/logout");
      if (response.data.success) {
        toast.success("Logged out successfully.");
        router.push("/login");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred during logout.");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-white/75 px-4 py-6 dark:bg-slate-950/60 backdrop-blur-md border-r border-border/60">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25">
            <Wallet className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-sans text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Smart Finance
          </span>
        </div>

        {/* User Profile Card inside Sidebar */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-slate-50/40 p-3.5 dark:bg-slate-900/20 backdrop-blur-sm">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm dark:border-slate-800">
            <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-emerald-500 text-xs font-bold text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user.name}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="flex w-full justify-start gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
      >
        <LogOut className="h-4.5 w-4.5" />
        Logout
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 md:block z-30">
        {SidebarContent()}
      </aside>

      {/* Mobile Top Navbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/80 bg-white/70 px-4 backdrop-blur-md md:hidden dark:bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-500/20">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="text-md font-bold text-slate-900 dark:text-white">
            Smart Finance
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative cursor-pointer">
            <Bell className="h-4.5 w-4.5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 neon-glow-amber" />
          </Button>

          {/* Mobile Sheet Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-lg hover:bg-slate-100/60 dark:hover:bg-white/5 h-9 w-9 cursor-pointer select-none outline-none">
              <Menu className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              {SidebarContent()}
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
