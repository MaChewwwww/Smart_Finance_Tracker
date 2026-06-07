"use client";

import React from "react";

// Icons
import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  HandCoins,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DebtsPage() {
  // Mock Debts Data
  const debts = [
    {
      id: "1",
      creditor: "BDO Credit Card",
      original: 3500.00,
      remaining: 2100.00,
      dueDate: "2026-06-12",
      status: "due_soon", // active / due_soon / overdue / paid
      notes: "Monthly utilities auto-charged here",
    },
    {
      id: "2",
      creditor: "Car Financing (Bank of Commerce)",
      original: 15000.00,
      remaining: 8500.00,
      dueDate: "2026-06-25",
      status: "active",
      notes: "Auto-debit from payroll account",
    },
    {
      id: "3",
      creditor: "Personal Loan (Juan's Uncle)",
      original: 2000.00,
      remaining: 500.00,
      dueDate: "2026-05-15",
      status: "overdue",
      notes: "Interest-free loan for emergency repair",
    },
    {
      id: "4",
      creditor: "Student Loan Fund",
      original: 5000.00,
      remaining: 0.00,
      dueDate: "2026-04-30",
      status: "paid",
      notes: "Final clearance processed",
    },
  ];

  const totalOriginal = debts.reduce((sum, d) => sum + d.original, 0);
  const totalRemaining = debts.reduce((sum, d) => sum + d.remaining, 0);
  const totalPaid = totalOriginal - totalRemaining;
  const overallProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

  const getStatusBadge = (status: string, dueDate: string) => {
    switch (status) {
      case "overdue":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/25 font-bold gap-1 rounded-lg neon-glow-rose">
            <AlertCircle className="h-3 w-3" /> Overdue
          </Badge>
        );
      case "due_soon":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/25 font-bold gap-1 rounded-lg neon-glow-amber">
            <Clock className="h-3 w-3" /> Due Soon
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 font-bold gap-1 rounded-lg neon-glow-emerald">
            <CheckCircle className="h-3 w-3" /> Paid
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-400 font-bold gap-1 rounded-lg border-border">
            Active
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Debts
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Coordinate your liabilities, schedule due dates, and track partial payments.
          </p>
        </div>
        <Button className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer">
          <Plus className="mr-1.5 h-4 w-4" /> Add Debt
        </Button>
      </div>

      {/* Repayment Progress Summary Banner */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3 items-center">
            <div className="space-y-1 md:border-r border-border pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
              <h2 className="text-3xl font-black tracking-tight gradient-text-rose">${totalRemaining.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              <p className="text-xs text-slate-450 font-bold">From {debts.filter(d => d.remaining > 0).length} active liabilities</p>
            </div>
            <div className="space-y-1 md:border-r border-border pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Repaid</span>
              <h2 className="text-3xl font-black tracking-tight gradient-text-emerald">${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              <p className="text-xs text-slate-455 font-bold">Out of ${totalOriginal.toLocaleString(undefined, {minimumFractionDigits: 2})} original debt</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                <span>Overall Repayment Progress</span>
                <span>{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debts List */}
      <div className="grid gap-4 md:grid-cols-2">
        {debts.map((debt) => {
          const paidAmount = debt.original - debt.remaining;
          const percentPaid = (paidAmount / debt.original) * 100;

          return (
            <Card
              key={debt.id}
              className={`glass-card hover:scale-[1.01] ${
                debt.status === "overdue" ? "border-rose-500/20 dark:border-rose-500/15" : ""
              } ${debt.status === "paid" ? "opacity-70" : ""}`}
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {debt.creditor}
                  </h3>
                  <p className="text-xs font-bold text-slate-400">Due {debt.dueDate}</p>
                </div>
                {getStatusBadge(debt.status, debt.dueDate)}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-450 font-bold">Repaid: ${paidAmount.toLocaleString()}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {percentPaid.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={percentPaid} className="h-2 bg-slate-100/50 dark:bg-slate-900/40 rounded-full" />
                  <div className="flex items-center justify-between text-[10px] text-slate-450 font-bold">
                    <span>Original: ${debt.original.toLocaleString()}</span>
                    <span>Remaining: ${debt.remaining.toLocaleString()}</span>
                  </div>
                </div>

                {/* Notes Block */}
                {debt.notes && (
                  <div className="rounded-xl bg-slate-150/40 p-3 text-xs text-slate-600 dark:bg-slate-900/20 dark:text-slate-400 font-semibold border border-border/40">
                    <strong>Note:</strong> {debt.notes}
                  </div>
                )}

                {/* Card Actions */}
                {debt.status !== "paid" && (
                  <div className="flex gap-2 border-t border-border pt-3">
                    <Button variant="outline" size="sm" className="flex-1 text-xs font-bold h-9 border-border dark:border-border hover:border-blue-500 dark:hover:border-blue-400 transition-all rounded-xl cursor-pointer">
                      <HandCoins className="mr-1 h-3.5 w-3.5" /> Make Payment
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs font-bold h-9 text-emerald-500 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 rounded-xl cursor-pointer transition-all">
                      Mark as Paid
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
