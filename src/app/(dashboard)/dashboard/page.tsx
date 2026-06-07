"use client";

import React from "react";
import Link from "next/link";

import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Sparkles,
  Calendar,
  DollarSign,
  Plus,
  ArrowRight,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  // Stats representing premium financial metrics
  const stats = [
    {
      title: "Current Balance",
      value: "$14,800.50",
      change: "+8.2% from last month",
      trend: "up",
      icon: DollarSign,
      color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20",
      glow: "neon-glow-blue",
    },
    {
      title: "Monthly Income",
      value: "$5,200.00",
      change: "4 transactions",
      trend: "up",
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-450 border border-emerald-500/20",
      glow: "neon-glow-emerald",
    },
    {
      title: "Monthly Expenses",
      value: "$2,150.25",
      change: "18 transactions",
      trend: "down",
      icon: TrendingDown,
      color: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/10 dark:text-rose-450 border border-rose-500/20",
      glow: "neon-glow-rose",
    },
    {
      title: "Active Debts",
      value: "$4,500.00",
      change: "2 lenders • Due in 5 days",
      trend: "warning",
      icon: CreditCard,
      color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/10 dark:text-amber-450 border border-amber-500/20",
      glow: "neon-glow-amber",
    },
  ];

  const recentTransactions = [
    {
      id: "1",
      description: "Safeway Groceries",
      category: "Food",
      type: "expense",
      amount: "-$124.50",
      date: "Jun 05, 2026",
    },
    {
      id: "2",
      description: "Client Project Milestone",
      category: "Freelance",
      type: "income",
      amount: "+$2,500.00",
      date: "Jun 01, 2026",
    },
    {
      id: "3",
      description: "Chevron Gas Station",
      category: "Transportation",
      type: "expense",
      amount: "-$45.00",
      date: "May 28, 2026",
    },
    {
      id: "4",
      description: "Netflix Subscription",
      category: "Entertainment",
      type: "expense",
      amount: "-$15.49",
      date: "May 25, 2026",
    },
    {
      id: "5",
      description: "Apartment Monthly Rent",
      category: "Bills",
      type: "expense",
      amount: "-$1,200.00",
      date: "May 01, 2026",
    },
  ];

  const reminders = [
    { id: "1", title: "Credit Card Bill", date: "Due Jun 12", amount: "$180.00", priority: "high", glow: "bg-rose-500 neon-glow-rose" },
    { id: "2", title: "Car Loan Payment", date: "Due Jun 18", amount: "$320.00", priority: "medium", glow: "bg-amber-500 neon-glow-amber" },
    { id: "3", title: "Emergency Fund Goal", date: "Target Jun 30", amount: "$10,000.00", priority: "low", glow: "bg-blue-500 neon-glow-blue" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hello, Juan
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

      {/* Bento Stats Row */}
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
                  {stat.trend === "up" && <span className="text-emerald-500 font-bold">↑</span>}
                  {stat.trend === "down" && <span className="text-rose-500 font-bold">↓</span>}
                  {stat.trend === "warning" && <span className="text-amber-500 font-bold">⚠️</span>}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Bento Grid Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Recent Transactions */}
        <Card className="md:col-span-2 glass-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-450">Your last 5 income and expense logs.</CardDescription>
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
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {tx.description}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                          {tx.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-bold">
                        {tx.date}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        tx.type === "income" ? "text-emerald-500" : "text-slate-900 dark:text-white"
                      }`}>
                        {tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: AI Insights & Reminders */}
        <div className="space-y-6">
          {/* AI Insight Card */}
          <Card className="glass-card border-blue-500/20 dark:border-blue-500/15 bg-gradient-to-br from-blue-500/[0.04] to-transparent shadow-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4.5 w-4.5 animate-pulse text-blue-500" /> AI Spending Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                &quot;You spent <strong className="text-slate-950 dark:text-white">12% more on Food</strong> this month than your usual average. Consolidating meal prep could save you approximately <strong className="text-emerald-500">$150.00</strong> next month.&quot;
              </p>
              <Link href="/chatbot">
                <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-600 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/15 font-bold cursor-pointer transition-all">
                  Ask AI Assistant for tips
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Reminders Card */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-bold flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-slate-400" /> Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between rounded-xl border border-border/80 p-3 bg-slate-50/20 dark:bg-slate-900/10"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {reminder.title}
                    </h4>
                    <p className="text-[10px] text-slate-450 font-bold flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${reminder.glow}`} />
                      {reminder.date}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {reminder.amount}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
