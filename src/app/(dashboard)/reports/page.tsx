"use client";

import React from "react";

// Icons
import {
  Calendar,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function ReportsPage() {
  // Mock Data
  const categories = [
    { name: "Rent & Bills", amount: 1342.10, percentage: 62.4, color: "bg-blue-500 neon-glow-blue" },
    { name: "Food & Groceries", amount: 485.30, percentage: 22.5, color: "bg-emerald-500 neon-glow-emerald" },
    { name: "Transportation", amount: 185.00, percentage: 8.6, color: "bg-amber-500 neon-glow-amber" },
    { name: "Health & Fitness", amount: 60.00, percentage: 2.8, color: "bg-rose-500 neon-glow-rose" },
    { name: "Entertainment", amount: 35.49, percentage: 1.6, color: "bg-indigo-500" },
    { name: "Others", amount: 42.36, percentage: 2.1, color: "bg-slate-400" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Reports
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Analyze spending patterns and review automated budget forecasting metrics.
          </p>
        </div>
        <Button variant="outline" className="font-bold text-xs border-border dark:border-border hover:border-blue-500 dark:hover:border-blue-400 transition-all rounded-xl cursor-pointer">
          <Calendar className="mr-1.5 h-4 w-4" /> This Month (June 2026)
        </Button>
      </div>

      {/* Grid: SVG Charts & Category Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left/Middle Column: Cashflow trend SVG and details (takes 2 cols) */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Monthly Cash Flow Trend</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-450">Income vs Expense comparisons across the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual SVG Chart Placeholder - Custom Styled */}
            <div className="relative h-64 w-full rounded-2xl bg-slate-50/20 p-4 dark:bg-slate-900/10 border border-dashed border-border/80 flex flex-col justify-between">
              {/* Chart Grid Lines */}
              <div className="absolute inset-x-0 top-1/4 border-t border-border/40" />
              <div className="absolute inset-x-0 top-2/4 border-t border-border/40" />
              <div className="absolute inset-x-0 top-3/4 border-t border-border/40" />

              {/* Bar Elements */}
              <div className="relative z-10 flex h-full items-end justify-around pt-6">
                {[
                  { month: "Jan", inc: 4800, exp: 3100 },
                  { month: "Feb", inc: 5000, exp: 3500 },
                  { month: "Mar", inc: 5500, exp: 3800 },
                  { month: "Apr", inc: 5200, exp: 4100 },
                  { month: "May", inc: 5400, exp: 2800 },
                  { month: "Jun", inc: 5200, exp: 2150 },
                ].map((item, idx) => {
                  const maxVal = 6000;
                  const incHeight = (item.inc / maxVal) * 100;
                  const expHeight = (item.exp / maxVal) * 100;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 w-12 group">
                      <div className="flex items-end justify-center gap-1.5 h-44 w-full">
                        {/* Income Bar */}
                        <div
                          style={{ height: `${incHeight}%` }}
                          className="w-3.5 rounded-t-md bg-emerald-500/80 transition-all group-hover:bg-emerald-500 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)] shadow-sm"
                          title={`Income: $${item.inc}`}
                        />
                        {/* Expense Bar */}
                        <div
                          style={{ height: `${expHeight}%` }}
                          className="w-3.5 rounded-t-md bg-blue-500/80 transition-all group-hover:bg-blue-500 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] shadow-sm"
                          title={`Expenses: $${item.exp}`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend indicators */}
            <div className="flex justify-center gap-6 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-emerald-500 neon-glow-emerald" />
                <span className="text-slate-600 dark:text-slate-400">Total Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-blue-500 neon-glow-blue" />
                <span className="text-slate-600 dark:text-slate-400">Total Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Category Breakdown List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Category Distribution</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-450">Top spending categories for this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <span className="text-slate-450 font-bold">
                    ${cat.amount.toFixed(2)} ({cat.percentage}%)
                  </span>
                </div>
                <Progress value={cat.percentage} className={`h-1.5 rounded-full bg-slate-100/50 dark:bg-slate-900/40 ${cat.color}`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Section: Rule-Based Forecasting & AI Warnings */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Rule-Based Forecasting Block */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" /> AI Financial Forecasting
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-450">
              We estimate next-month spending habits by analyzing historical averages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-slate-50/20 p-4 dark:bg-slate-900/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Historical Average</span>
                <div className="text-lg font-extrabold mt-1 text-slate-900 dark:text-white">$3,230.15/mo</div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Calculated over last 6 months</p>
              </div>

              <div className="rounded-xl border border-border bg-slate-50/20 p-4 dark:bg-slate-900/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Projected Expenses</span>
                <div className="text-lg font-extrabold mt-1 text-blue-600 dark:text-blue-400">$2,450.00</div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Based on active bill patterns</p>
              </div>

              <div className="rounded-xl border border-border bg-slate-50/20 p-4 dark:bg-slate-900/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Target Savings</span>
                <div className="text-lg font-extrabold mt-1 text-emerald-500">$1,000.00</div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Required for active goals</p>
              </div>
            </div>

            {/* AI Warning Box */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 neon-glow-amber" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-500">Budget Warning Recommendation</h4>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                  &quot;Your billing expenses increased by <strong>20% this month</strong>. If this rate continues, your projected cash savings for July will decrease by approximately <strong>$142.10</strong>, potentially delaying your emergency fund savings goal target.&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress Summary panel */}
        <Card className="glass-card flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Goal Projections</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-450">Will you hit your active targets on time?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-4 font-semibold">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-800 dark:text-slate-200">Emergency Fund</span>
                  <span className="text-emerald-500 font-bold">On track (Jun 30)</span>
                </div>
                <Progress value={85} className="h-1.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-full bg-emerald-500 neon-glow-emerald" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-800 dark:text-slate-200">New Laptop</span>
                  <span className="text-amber-500 font-bold">Delayed (Aug 15)</span>
                </div>
                <Progress value={40} className="h-1.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-full bg-amber-500 neon-glow-amber" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
