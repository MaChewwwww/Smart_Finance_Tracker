"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";

import {
  createDebtSchema,
  type CreateDebtInput,
  type CreateDebtFormInput,
} from "@/lib/validators";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface DebtForEdit {
  id: string;
  creditorName: string;
  originalAmount: string;
  remainingAmount: string;
  dueDate: string | null;
  notes: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: DebtForEdit | null;
  onSaved: () => void;
}

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function DebtDialog({ open, onOpenChange, debt, onSaved }: Props) {
  const isEdit = Boolean(debt);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDebtFormInput, unknown, CreateDebtInput>({
    resolver: zodResolver(createDebtSchema),
    defaultValues: {
      creditorName: "",
      originalAmount: undefined,
      remainingAmount: undefined,
      dueDate: null,
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (debt) {
      reset({
        creditorName: debt.creditorName,
        originalAmount: Number(debt.originalAmount),
        remainingAmount: Number(debt.remainingAmount),
        dueDate: debt.dueDate ?? null,
        notes: debt.notes ?? "",
      });
    } else {
      reset({
        creditorName: "",
        originalAmount: undefined,
        remainingAmount: undefined,
        dueDate: null,
        notes: "",
      });
    }
  }, [open, debt, reset]);

  const onSubmit = async (data: CreateDebtInput) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        dueDate: data.dueDate || null,
        notes: data.notes || null,
      };
      const res = isEdit
        ? await axios.patch(`/api/debts/${debt!.id}`, payload)
        : await axios.post("/api/debts", payload);

      if (res.data.success) {
        toast.success(res.data.message || "Saved.");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(res.data.error?.message || "Failed to save debt.");
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : null;
      toast.error(msg || "Failed to save debt.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Debt" : "Add Debt"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this debt record."
              : "Record a new debt or liability to track."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Creditor Name */}
          <div className="space-y-2">
            <Label htmlFor="creditorName" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Creditor / Lender
            </Label>
            <Input
              id="creditorName"
              placeholder="e.g. BDO Credit Card"
              className="h-11 font-semibold"
              {...register("creditorName")}
            />
            {errors.creditorName && (
              <p className="text-xs font-bold text-rose-500">{errors.creditorName.message}</p>
            )}
          </div>

          {/* Amounts Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="originalAmount" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Original Amount
              </Label>
              <Input
                id="originalAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-11 font-semibold"
                {...register("originalAmount")}
              />
              {errors.originalAmount && (
                <p className="text-xs font-bold text-rose-500">{errors.originalAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="remainingAmount" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Remaining
              </Label>
              <Input
                id="remainingAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-11 font-semibold"
                {...register("remainingAmount")}
              />
              {errors.remainingAmount && (
                <p className="text-xs font-bold text-rose-500">{errors.remainingAmount.message}</p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Due Date <span className="text-slate-400 normal-case font-medium">(optional)</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              className="h-11 font-semibold"
              {...register("dueDate")}
            />
            {errors.dueDate && (
              <p className="text-xs font-bold text-rose-500">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Notes <span className="text-slate-400 normal-case font-medium">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional details..."
              className="font-semibold resize-none"
              rows={2}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Debt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
