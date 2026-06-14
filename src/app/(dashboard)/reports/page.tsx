"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Sparkles, AlertTriangle, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TrendPoint {
  label: string;
  income: number;
  expense: number;
}

interface CategoryItem {
  categoryId: string | null;
  categoryName: string;
  total: number;
  percentage: number;
}

interface Forecast {
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
  projectedSavings: number;
  monthsAnalyzed: number;
}

interface GoalSummary {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  percent: number;
  monthlyNeeded: number;
}

interface ReportData {
  trend: TrendPoint[];
  categoryBreakdown: CategoryItem[];
  forecast: Forecast;
  goals: GoalSummary[];
  currentMonthLabel: string;
  totalExpenseCurrentMonth: number;
}

function money(v: number) {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BAR_COLORS = [
  "bg-blue-500 neon-glow-blue",
  "bg-emerald-500 neon-glow-emerald",
  "bg-amber-500 neon-glow-amber",
  "bg-rose-500 neon-glow-rose",
  "bg-indigo-500",
  "bg-slate-400",
];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get("/api/reports/summary");
        if (active && res.data.success) setData(res.data.data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const trend = data?.trend ?? [];
  const categoryBreakdown = data?.categoryBreakdown ?? [];
  const forecast = data?.forecast;
  const goals = data?.goals ?? [];
  const currentMonthLabel = data?.currentMonthLabel ?? "This Month";
  const totalExpense = data?.totalExpenseCurrentMonth ?? 0;

  const maxTrendValue = Math.max(...trend.flatMap((t) => [t.income, t.expense]), 1);

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
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-900/20">
          <Calendar className="h-4 w-4" /> {currentMonthLabel}
        </div>
      </div>

      {/* Grid: Cash Flow Trend + Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Monthly Cash Flow Chart */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Monthly Cash Flow Trend</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-450">
              Income vs Expenses — last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {trend.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-bold">
                No transaction data yet.
              </div>
            ) : (
              <>
                <div className="relative h-64 w-full rounded-2xl bg-slate-50/20 p-4 dark:bg-slate-900/10 border border-dashed border-border/80">
                  <div className="absolute inset-x-0 top-1/4 border-t border-border/40" />
                  <div className="absolute inset-x-0 top-2/4 border-t border-border/40" />
                  <div className="absolute inset-x-0 top-3/4 border-t border-border/40" />

                  <div className="relative z-10 flex h-full items-end justify-around pt-6">
                    {trend.map((item, idx) => {
                      const incH = (item.income / maxTrendValue) * 100;
                      const expH = (item.expense / maxTrendValue) * 100;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 w-12 group">
                          <div className="flex items-end justify-center gap-1.5 h-44 w-full">
                            <div
                              style={{ height: `${incH}%` }}
                              className="w-3.5 rounded-t-md bg-emerald-500/80 transition-all group-hover:bg-emerald-500 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)] shadow-sm"
                              title={`Income: $${money(item.income)}`}
                            />
                            <div
                              style={{ height: `${expH}%` }}
                              className="w-3.5 rounded-t-md bg-blue-500/80 transition-all group-hover:bg-blue-500 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] shadow-sm"
                              title={`Expense: $${money(item.expense)}`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full text-center">
                            {item.label.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center gap-6 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-emerald-500 neon-glow-emerald" />
                    <span className="text-slate-600 dark:text-slate-400">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-blue-500 neon-glow-blue" />
                    <span className="text-slate-600 dark:text-slate-400">Expenses</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Category Distribution</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-450">
              Top expense categories — {currentMonthLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 text-center py-6">
                No expense data for this month.
              </p>
            ) : (
              categoryBreakdown.slice(0, 6).map((cat, idx) => (
                <div key={cat.categoryId ?? cat.categoryName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 truncate pr-2">{cat.categoryName}</span>
                    <span className="text-slate-450 font-bold shrink-0">
                      ${money(cat.total)} ({cat.percentage}%)
                    </span>
                  </div>
                  <Progress
                    value={cat.percentage}
                    className={`h-1.5 rounded-full bg-slate-100/50 dark:bg-slate-900/40`}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forecasting + Goals */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Forecast Block */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Spending Forecast
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-450">
              Estimates based on your last {forecast?.monthsAnalyzed ?? 0} months of data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!forecast || forecast.monthsAnalyzed === 0 ? (
              <p className="text-xs font-bold text-slate-400 text-center py-6">
                Not enough data to generate a forecast yet.
              </p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-slate-50/20 p-4 dark:bg-slate-900/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      Avg Monthly Income
                    </span>
                    <div className="text-lg font-extrabold mt-1 text-emerald-500">
                      ${money(forecast.avgMonthlyIncome)}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      Over {forecast.monthsAnalyzed} months
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-slate-50/20 p-4 dark:bg-slate-900/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      Avg Monthly Expenses
                    </span>
                    <div className="text-lg font-extrabold mt-1 text-blue-600 dark:text-blue-400">
                      ${money(forecast.avgMonthlyExpense)}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Based on history</p>
                  </div>

                  <div className="rounded-xl border border-border bg-slate-50/20 p-4 dark:bg-slate-900/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      Projected Savings
                    </span>
                    <div
                      className={`text-lg font-extrabold mt-1 ${
                        forecast.projectedSavings >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      ${money(Math.abs(forecast.projectedSavings))}
                      {forecast.projectedSavings < 0 && (
                        <span className="text-xs font-bold ml-1 text-rose-400">(deficit)</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Estimated next month</p>
                  </div>
                </div>

                {/* Budget health indicator */}
                <div
                  className={`rounded-xl border p-4 flex items-start gap-3 ${
                    forecast.projectedSavings >= 0
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-amber-500/20 bg-amber-500/5"
                  }`}
                >
                  {forecast.projectedSavings >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 neon-glow-amber" />
                  )}
                  <div className="space-y-1">
                    <h4
                      className={`text-xs font-bold ${
                        forecast.projectedSavings >= 0 ? "text-emerald-500" : "text-amber-500"
                      }`}
                    >
                      {forecast.projectedSavings >= 0
                        ? "Budget is healthy"
                        : "Budget Warning"}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      {forecast.projectedSavings >= 0
                        ? `Based on your last ${forecast.monthsAnalyzed} months, you're saving an average of $${money(forecast.projectedSavings)} per month. Keep it up!`
                        : `Your average expenses ($${money(forecast.avgMonthlyExpense)}) exceed your average income ($${money(forecast.avgMonthlyIncome)}). Review your spending categories to find areas to cut.`}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Goals Projections Panel */}
        <Card className="glass-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Goal Projections</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-450">
              Monthly contribution needed to stay on track.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {goals.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 text-center py-6">
                No active goals. Add one on the Goals page.
              </p>
            ) : (
              <div className="space-y-4 font-semibold">
                {goals.slice(0, 4).map((g) => (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-800 dark:text-slate-200 truncate pr-2">{g.name}</span>
                      <span
                        className={`font-bold shrink-0 ${
                          g.percent >= 100 ? "text-emerald-500" : "text-blue-500"
                        }`}
                      >
                        {g.percent.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(g.percent, 100)}
                      className="h-1.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-full"
                    />
                    {g.monthlyNeeded > 0 && (
                      <p className="text-[10px] text-slate-400 font-bold">
                        Need ${money(g.monthlyNeeded)}/mo
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
