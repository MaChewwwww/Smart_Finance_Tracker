"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-xl h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 cursor-pointer flex items-center justify-center"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4.5 w-4.5 text-amber-400 hover:text-amber-300" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-indigo-600 hover:text-indigo-800" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
