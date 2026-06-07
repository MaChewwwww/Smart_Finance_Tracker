"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function ServerTime() {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    const updateTime = () => {
      const now = new Date();
      // Format: Month Day, Year (e.g. June 26, 2001)
      const datePart = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      // Format: HH:MM:SS AM/PM
      const timePart = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTimeStr(`${datePart} - ${timePart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
        <Clock className="h-3.5 w-3.5" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
      <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
      <span>{timeStr}</span>
    </div>
  );
}
