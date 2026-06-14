"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  HandCoins,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DebtDialog, type DebtForEdit } from "@/components/debts/debt-dialog";
import { PaymentDialog, type DebtForPayment } from "@/components/debts/payment-dialog";

interface DebtRow {
  id: string;
  creditorName: string;
  originalAmount: string;
  remainingAmount: string;
  dueDate: string | null;
  status: string;
  notes: string | null;
}

interface Summary {
  totalOriginal: number;
  totalRemaining: number;
  activeCount: number;
}

function money(value: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "overdue":
      return (
        <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/25 font-bold gap-1 rounded-lg neon-glow-rose">
          <AlertCircle className="h-3 w-3" /> Overdue
        </Badge>
      );
    case "paid":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 font-bold gap-1 rounded-lg neon-glow-emerald">
          <CheckCircle className="h-3 w-3" /> Paid
        </Badge>
      );
    default: {
      // Check due-soon (within 7 days)
      return (
        <Badge variant="outline" className="text-slate-400 font-bold gap-1 rounded-lg border-border">
          Active
        </Badge>
      );
    }
  }
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalOriginal: 0, totalRemaining: 0, activeCount: 0 });
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtForEdit | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<DebtForPayment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DebtRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const loadDebts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/debts");
      if (res.data.success) {
        setDebts(res.data.data.debts);
        setSummary(res.data.data.summary);
      }
    } catch {
      toast.error("Failed to load debts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const openCreate = () => {
    setEditingDebt(null);
    setDebtDialogOpen(true);
  };

  const openEdit = (debt: DebtRow) => {
    setEditingDebt({
      id: debt.id,
      creditorName: debt.creditorName,
      originalAmount: debt.originalAmount,
      remainingAmount: debt.remainingAmount,
      dueDate: debt.dueDate,
      notes: debt.notes,
    });
    setDebtDialogOpen(true);
  };

  const openPayment = (debt: DebtRow) => {
    setPaymentTarget({
      id: debt.id,
      creditorName: debt.creditorName,
      remainingAmount: debt.remainingAmount,
    });
  };

  const handleMarkPaid = async (debt: DebtRow) => {
    setMarkingPaid(debt.id);
    try {
      const res = await axios.post(`/api/debts/${debt.id}/mark-paid`);
      if (res.data.success) {
        toast.success("Debt marked as fully paid.");
        loadDebts();
      } else {
        toast.error(res.data.error?.message || "Failed.");
      }
    } catch {
      toast.error("Failed to mark debt as paid.");
    } finally {
      setMarkingPaid(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`/api/debts/${deleteTarget.id}`);
      if (res.data.success) {
        toast.success("Debt deleted.");
        setDeleteTarget(null);
        loadDebts();
      } else {
        toast.error(res.data.error?.message || "Failed to delete.");
      }
    } catch {
      toast.error("Failed to delete debt.");
    } finally {
      setDeleting(false);
    }
  };

  const totalPaid = summary.totalOriginal - summary.totalRemaining;
  const overallProgress =
    summary.totalOriginal > 0 ? (totalPaid / summary.totalOriginal) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Debts</h1>
          <p className="text-sm font-semibold text-slate-400">
            Coordinate your liabilities, schedule due dates, and track partial payments.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Debt
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Repayment Progress Summary Banner */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-3 items-center">
                <div className="space-y-1 md:border-r border-border pr-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Outstanding
                  </span>
                  <h2 className="text-3xl font-black tracking-tight gradient-text-rose">
                    ${money(summary.totalRemaining)}
                  </h2>
                  <p className="text-xs text-slate-450 font-bold">
                    From {summary.activeCount} active{" "}
                    {summary.activeCount === 1 ? "liability" : "liabilities"}
                  </p>
                </div>
                <div className="space-y-1 md:border-r border-border pr-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Repaid
                  </span>
                  <h2 className="text-3xl font-black tracking-tight gradient-text-emerald">
                    ${money(totalPaid)}
                  </h2>
                  <p className="text-xs text-slate-455 font-bold">
                    Out of ${money(summary.totalOriginal)} original debt
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                    <span>Overall Repayment Progress</span>
                    <span>{overallProgress.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={overallProgress}
                    className="h-2.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debts Grid */}
          {debts.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-16 text-center text-slate-400 font-bold">
                No debts recorded. Click &quot;Add Debt&quot; to start tracking your liabilities.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {debts.map((debt) => {
                const original = Number(debt.originalAmount);
                const remaining = Number(debt.remainingAmount);
                const paid = original - remaining;
                const percentPaid = original > 0 ? (paid / original) * 100 : 0;
                const isMarkingThisPaid = markingPaid === debt.id;

                return (
                  <Card
                    key={debt.id}
                    className={`glass-card hover:scale-[1.01] transition-transform ${
                      debt.status === "overdue" ? "border-rose-500/20 dark:border-rose-500/15" : ""
                    } ${debt.status === "paid" ? "opacity-70" : ""}`}
                  >
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                      <div className="space-y-1 flex-1 min-w-0 pr-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {debt.creditorName}
                        </h3>
                        <p className="text-xs font-bold text-slate-400">
                          Due {formatDate(debt.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge status={debt.status} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(debt)}
                          className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(debt)}
                          className="h-7 w-7 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-450 font-bold">
                            Repaid: ${money(paid)}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {percentPaid.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          value={percentPaid}
                          className="h-2 bg-slate-100/50 dark:bg-slate-900/40 rounded-full"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-450 font-bold">
                          <span>Original: ${money(original)}</span>
                          <span>Remaining: ${money(remaining)}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {debt.notes && (
                        <div className="rounded-xl bg-slate-150/40 p-3 text-xs text-slate-600 dark:bg-slate-900/20 dark:text-slate-400 font-semibold border border-border/40">
                          <strong>Note:</strong> {debt.notes}
                        </div>
                      )}

                      {/* Actions */}
                      {debt.status !== "paid" && (
                        <div className="flex gap-2 border-t border-border pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPayment(debt)}
                            className="flex-1 text-xs font-bold h-9 border-border hover:border-blue-500 dark:hover:border-blue-400 transition-all rounded-xl cursor-pointer"
                          >
                            <HandCoins className="mr-1 h-3.5 w-3.5" /> Make Payment
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkPaid(debt)}
                            disabled={isMarkingThisPaid}
                            className="text-xs font-bold h-9 text-emerald-500 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 rounded-xl cursor-pointer transition-all"
                          >
                            {isMarkingThisPaid ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Mark as Paid"
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Debt Dialog */}
      <DebtDialog
        open={debtDialogOpen}
        onOpenChange={setDebtDialogOpen}
        debt={editingDebt}
        onSaved={loadDebts}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={Boolean(paymentTarget)}
        onOpenChange={(o) => !o && setPaymentTarget(null)}
        debt={paymentTarget}
        onSaved={loadDebts}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete debt?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {deleteTarget?.creditorName}
              </span>{" "}
              and all its payment history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <DialogClose render={<Button variant="outline" className="font-bold cursor-pointer" />}>
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
