"use client";

import React, { useState } from "react";

// Icons
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  Trash2,
  Edit2,
  Calendar,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  // Mock Transactions List
  const transactions = [
    { id: "1", desc: "Safeway Groceries", cat: "Food", type: "expense", amt: 124.50, date: "2026-06-05" },
    { id: "2", desc: "Client Project Milestone", cat: "Freelance", type: "income", amt: 2500.00, date: "2026-06-01" },
    { id: "3", desc: "Chevron Gas Station", cat: "Transportation", type: "expense", amt: 45.00, date: "2026-05-28" },
    { id: "4", desc: "Netflix Subscription", cat: "Entertainment", type: "expense", amt: 15.49, date: "2026-05-25" },
    { id: "5", desc: "Salary Payroll Deposit", cat: "Salary", type: "income", amt: 2700.00, date: "2026-05-15" },
    { id: "6", desc: "Starbucks Coffee", cat: "Food", type: "expense", amt: 6.80, date: "2026-05-14" },
    { id: "7", desc: "Electricity Utility Bill", cat: "Bills", type: "expense", amt: 142.10, date: "2026-05-10" },
    { id: "8", desc: "Gym Membership Fee", cat: "Health", type: "expense", amt: 60.00, date: "2026-05-02" },
    { id: "9", desc: "Apartment Monthly Rent", cat: "Bills", type: "expense", amt: 1200.00, date: "2026-05-01" },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.cat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Log and review all incoming and outgoing payments.
          </p>
        </div>
        <Button className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer">
          <Plus className="mr-1.5 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-450" />
            <Input
              type="text"
              placeholder="Search by description or category..."
              className="pl-11 h-11 bg-slate-50/50 border-border dark:bg-slate-950/40 text-slate-900 dark:text-white placeholder-slate-450 focus:border-blue-500 focus:ring-blue-500/10 font-semibold rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Type Buttons */}
            <div className="inline-flex rounded-xl border border-border p-1 bg-slate-50 dark:bg-slate-950/40">
              <Button
                variant={filterType === "all" ? "secondary" : "ghost"}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg px-3.5 cursor-pointer ${
                  filterType === "all" ? "bg-white dark:bg-slate-900 border border-border/80 text-blue-500" : ""
                }`}
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              <Button
                variant={filterType === "income" ? "secondary" : "ghost"}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg px-3.5 cursor-pointer ${
                  filterType === "income" ? "bg-white dark:bg-slate-900 border border-border/80 text-emerald-500" : ""
                }`}
                onClick={() => setFilterType("income")}
              >
                Income
              </Button>
              <Button
                variant={filterType === "expense" ? "secondary" : "ghost"}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg px-3.5 cursor-pointer ${
                  filterType === "expense" ? "bg-white dark:bg-slate-900 border border-border/80 text-rose-500" : ""
                }`}
                onClick={() => setFilterType("expense")}
              >
                Expenses
              </Button>
            </div>

            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white dark:bg-slate-950/40 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 h-10 cursor-pointer select-none outline-none">
                <Filter className="h-3.5 w-3.5" /> Category <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-slate-950/95 border-border rounded-xl">
                <DropdownMenuLabel className="font-bold text-xs text-slate-400">Filter Category</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem className="font-semibold cursor-pointer">All Categories</DropdownMenuItem>
                <DropdownMenuItem className="font-semibold cursor-pointer">Food</DropdownMenuItem>
                <DropdownMenuItem className="font-semibold cursor-pointer">Bills</DropdownMenuItem>
                <DropdownMenuItem className="font-semibold cursor-pointer">Transportation</DropdownMenuItem>
                <DropdownMenuItem className="font-semibold cursor-pointer">Freelance</DropdownMenuItem>
                <DropdownMenuItem className="font-semibold cursor-pointer">Entertainment</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Dropdown */}
            <Button variant="outline" size="sm" className="h-10 gap-1.5 font-bold text-xs border-border dark:border-border dark:hover:bg-white/5 rounded-xl cursor-pointer">
              <Calendar className="h-3.5 w-3.5" /> Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table Card */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-400 uppercase border-b border-border/60">
                <tr>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Description</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      {tx.type === "income" ? (
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 neon-glow-emerald">
                          <ArrowDownLeft className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/10">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {tx.desc}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                        {tx.cat}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-bold">
                      {tx.date}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
                      tx.type === "income" ? "text-emerald-500" : "text-slate-950 dark:text-white"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amt.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                      No transactions found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
