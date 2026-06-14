"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Sparkles,
  DollarSign,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecentTransaction {
  id: string;
  type: "income" | "expense";
  amount: string;
  description: string | null;
  transactionDate: string;
  categoryName: string | null;
}

interface Summary {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyIncomeCount: number;
  monthlyExpenseCount: number;
  activeDebtTotal: number;
  activeDebtCount: number;
  recentTransactions: RecentTransaction[];
}

function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [meRes, sumRes] = await Promise.all([
          axios.get("/api/auth/me"),
          axios.get("/api/dashboard/summary"),
        ]);
        if (!active) return;
        if (meRes.data.success) setName(meRes.data.data.user.name);
        if (sumRes.data.success) setSummary(sumRes.data.data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const firstName = name ? name.split(" ")[0] : "there";

  const stats = summary
    ? [
        {
          title: "Current Balance",
          value: money(summary.balance),
          change: "Income minus expenses, all time",
          trend: summary.balance >= 0 ? "up" : "down",
          icon: DollarSign,
          color: "text-blue-500 bg-blue-500/10 dark:text-blue-400 border border-blue-500/20",
          glow: "neon-glow-blue",
        },
        {
          title: "Monthly Income",
          value: money(summary.monthlyIncome),
          change: `${summary.monthlyIncomeCount} transaction${summary.monthlyIncomeCount === 1 ? "" : "s"}`,
          trend: "up",
          icon: TrendingUp,
          color: "text-emerald-500 bg-emerald-500/10 dark:text-emerald-450 border border-emerald-500/20",
          glow: "neon-glow-emerald",
        },
        {
          title: "Monthly Expenses",
          value: money(summary.monthlyExpenses),
          change: `${summary.monthlyExpenseCount} transaction${summary.monthlyExpenseCount === 1 ? "" : "s"}`,
          trend: "down",
          icon: TrendingDown,
          color: "text-rose-500 bg-rose-500/10 dark:text-rose-450 border border-rose-500/20",
          glow: "neon-glow-rose",
        },
        {
          title: "Active Debts",
          value: money(summary.activeDebtTotal),
          change: `${summary.activeDebtCount} active debt${summary.activeDebtCount === 1 ? "" : "s"}`,
          trend: "warning",
          icon: CreditCard,
          color: "text-amber-500 bg-amber-500/10 dark:text-amber-450 border border-amber-500/20",
          glow: "neon-glow-amber",
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hello, {firstName}
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Here is your financial status overview for this month.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions">
            <Button className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer">
              <Plus className="mr-1.5 h-4 w-4" /> Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="glass-card hover:scale-[1.02]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {stat.title}
                    </CardTitle>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color} ${stat.glow}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Recent Transactions */}
            <Card className="md:col-span-2 glass-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-450">
                    Your last 5 income and expense logs.
                  </CardDescription>
                </div>
                <Link href="/transactions">
                  <Button variant="ghost" size="sm" className="font-bold text-xs gap-1 cursor-pointer">
                    View All <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-400 uppercase border-b border-border/60">
                      <tr>
                        <th className="px-6 py-3.5 font-bold">Description</th>
                        <th className="px-6 py-3.5 font-bold">Category</th>
                        <th className="px-6 py-3.5 font-bold">Date</th>
                        <th className="px-6 py-3.5 font-bold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-semibold">
                      {summary && summary.recentTransactions.length > 0 ? (
                        summary.recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                              {tx.description || <span className="text-slate-400 italic font-semibold">No description</span>}
                            </td>
                            <td className="px-6 py-4">
                              {tx.categoryName ? (
                                <Badge
                                  variant="secondary"
                                  className="font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                                >
                                  {tx.categoryName}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-400 font-bold">{formatDate(tx.transactionDate)}</td>
                            <td
                              className={`px-6 py-4 text-right font-bold ${
                                tx.type === "income" ? "text-emerald-500" : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {tx.type === "income" ? "+" : "-"}
                              {money(Number(tx.amount))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                            No transactions yet. Add your first one to see it here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* AI Insight */}
            <div className="space-y-6">
              <Card className="glass-card border-blue-500/20 dark:border-blue-500/15 bg-gradient-to-br from-blue-500/[0.04] to-transparent shadow-blue-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-4.5 w-4.5 animate-pulse text-blue-500" /> AI Spending Insight
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-sm">
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                    {summary && summary.monthlyExpenses > 0
                      ? `You've logged ${money(summary.monthlyExpenses)} in expenses this month. Ask the AI assistant how to optimize your budget.`
                      : "Once you start logging transactions, your personalized spending insights will appear here."}
                  </p>
                  <Link href="/chatbot">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-blue-600 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-600 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/15 font-bold cursor-pointer transition-all"
                    >
                      Ask AI Assistant for tips
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
