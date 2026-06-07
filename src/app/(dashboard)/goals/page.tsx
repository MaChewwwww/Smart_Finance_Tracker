"use client";

import React from "react";

// Icons
import {
  Plus,
  Sparkles,
  CheckCircle,
  CalendarDays,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function GoalsPage() {
  // Mock Goals Data
  const goals = [
    {
      id: "1",
      name: "Emergency Fund",
      target: 10000.00,
      current: 8500.00,
      date: "2026-06-30",
      status: "active",
      recommended: 500.00,
      notes: "Equivalent to 3 months of basic living expenses",
    },
    {
      id: "2",
      name: "Professional Development (NextJS Masterclass)",
      target: 800.00,
      current: 320.00,
      date: "2026-08-15",
      status: "active",
      recommended: 160.00,
      notes: "Certification exam fee + course material bundle",
    },
    {
      id: "3",
      name: "Trip to Boracay",
      target: 2500.00,
      current: 2500.00,
      date: "2026-05-01",
      status: "completed",
      recommended: 0.00,
      notes: "Flights and hotel fully booked",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Savings Goals
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Set savings targets, track progress, and review AI-estimated contribution advice.
          </p>
        </div>
        <Button className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer">
          <Plus className="mr-1.5 h-4 w-4" /> Add Goal
        </Button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const percent = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;

          return (
            <Card
              key={goal.id}
              className={`glass-card flex flex-col justify-between hover:scale-[1.01] ${
                goal.status === "completed" ? "border-emerald-500/20 dark:border-emerald-500/15 opacity-75" : ""
              }`}
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {goal.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Target Date: {goal.date}
                  </p>
                </div>
                {goal.status === "completed" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold gap-1 rounded-lg neon-glow-emerald">
                    <CheckCircle className="h-3 w-3" /> Completed
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold rounded-lg neon-glow-blue">
                    Active
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">
                      Saved: ${goal.current.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={percent} className="h-2.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-full" />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                    <span>Target: ${goal.target.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    <span>Remaining: ${remaining.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                {/* Notes Block */}
                {goal.notes && (
                  <div className="rounded-xl bg-slate-100/40 p-3 text-xs text-slate-500 dark:bg-slate-900/20 dark:text-slate-400 font-semibold border border-border/40">
                    <strong>Description:</strong> {goal.notes}
                  </div>
                )}
              </CardContent>

              {/* Card Footer: AI Recommendation details */}
              {goal.status !== "completed" && (
                <CardFooter className="border-t border-border px-6 py-4 bg-gradient-to-br from-blue-500/[0.03] to-transparent flex flex-col items-start gap-2 rounded-b-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-4 w-4 animate-pulse text-blue-500" /> AI Goal Recommendation
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    To reach your target on schedule, contribute approximately{" "}
                    <strong className="text-emerald-500">${goal.recommended.toFixed(2)}/mo</strong>. Based on your average monthly savings, this is highly achievable.
                  </p>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
