"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TransactionDialog,
  type Category,
  type TransactionForEdit,
} from "@/components/transactions/transaction-dialog";

interface TransactionRow {
  id: string;
  type: "income" | "expense";
  amount: string;
  description: string | null;
  transactionDate: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

function formatAmount(value: string | number) {
  return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  // transactionDate comes back as YYYY-MM-DD; render without timezone shift.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionForEdit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransactionRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const res = await axios.get("/api/categories");
      if (res.data.success) setCategories(res.data.data.categories);
    } catch {
      // Non-fatal: form can still open, just without category options.
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterType !== "all") params.type = filterType;
      if (filterCategory !== "all") params.categoryId = filterCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await axios.get("/api/transactions", { params });
      if (res.data.success) setTransactions(res.data.data.transactions);
    } catch {
      toast.error("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCategory, searchTerm]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Debounce reloads so typing in search doesn't spam the API.
  useEffect(() => {
    const t = setTimeout(loadTransactions, 250);
    return () => clearTimeout(t);
  }, [loadTransactions]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (tx: TransactionRow) => {
    setEditing({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      transactionDate: tx.transactionDate,
      categoryId: tx.categoryId,
    });
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`/api/transactions/${deleteTarget.id}`);
      if (res.data.success) {
        toast.success("Transaction deleted.");
        setDeleteTarget(null);
        loadTransactions();
      } else {
        toast.error(res.data.error?.message || "Failed to delete.");
      }
    } catch {
      toast.error("Failed to delete transaction.");
    } finally {
      setDeleting(false);
    }
  };

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === "expense"), [categories]);
  const incomeCategories = useMemo(() => categories.filter((c) => c.type === "income"), [categories]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm font-semibold text-slate-400">
            Log and review all incoming and outgoing payments.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-450" />
            <Input
              type="text"
              placeholder="Search by description or category..."
              className="pl-11 h-11 font-semibold rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="inline-flex rounded-xl border border-border p-1 bg-slate-50 dark:bg-slate-950/40">
              {(["all", "income", "expense"] as const).map((t) => (
                <Button
                  key={t}
                  variant="ghost"
                  size="sm"
                  className={`h-8 text-xs font-bold rounded-lg px-3.5 cursor-pointer capitalize ${
                    filterType === t
                      ? "bg-white dark:bg-slate-900 border border-border/80 text-blue-500"
                      : ""
                  }`}
                  onClick={() => setFilterType(t)}
                >
                  {t === "all" ? "All" : t}
                </Button>
              ))}
            </div>

            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "all")}>
              <SelectTrigger className="h-10 rounded-xl text-xs font-bold">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {incomeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                      No transactions found. Click &quot;Add Transaction&quot; to log your first one.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
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
                        {tx.description || <span className="text-slate-400 font-semibold italic">No description</span>}
                      </td>
                      <td className="px-6 py-4">
                        {tx.categoryName ? (
                          <Badge
                            variant="secondary"
                            className="font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
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
                          tx.type === "income" ? "text-emerald-500" : "text-slate-950 dark:text-white"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}${formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(tx)}
                            className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(tx)}
                            className="h-7 w-7 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        transaction={editing}
        onSaved={loadTransactions}
      />

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>
              This will permanently remove this {deleteTarget?.type} of $
              {deleteTarget ? formatAmount(deleteTarget.amount) : ""}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <DialogClose
              render={<Button variant="outline" className="font-bold cursor-pointer" />}
            >
              Cancel
            </DialogClose>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
