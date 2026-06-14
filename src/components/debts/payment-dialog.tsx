"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { HandCoins, Loader2 } from "lucide-react";

import {
  logDebtPaymentSchema,
  type LogDebtPaymentInput,
  type LogDebtPaymentFormInput,
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

export interface DebtForPayment {
  id: string;
  creditorName: string;
  remainingAmount: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: DebtForPayment | null;
  onSaved: () => void;
}

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function PaymentDialog({ open, onOpenChange, debt, onSaved }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogDebtPaymentFormInput, unknown, LogDebtPaymentInput>({
    resolver: zodResolver(logDebtPaymentSchema),
    defaultValues: {
      amount: undefined,
      paymentDate: todayISO(),
    },
  });

  useEffect(() => {
    if (open) {
      reset({ amount: undefined, paymentDate: todayISO() });
    }
  }, [open, reset]);

  const onSubmit = async (data: LogDebtPaymentInput) => {
    if (!debt) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/debts/${debt.id}/payment`, data);
      if (res.data.success) {
        toast.success(res.data.message || "Payment recorded.");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(res.data.error?.message || "Failed to record payment.");
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : null;
      toast.error(msg || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = debt ? Number(debt.remainingAmount) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-blue-500" />
            Log Payment
          </DialogTitle>
          <DialogDescription>
            Recording a payment for{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {debt?.creditorName}
            </span>
            . Remaining balance:{" "}
            <span className="font-bold text-rose-500">
              ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="payAmount" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment Amount
            </Label>
            <Input
              id="payAmount"
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              placeholder="0.00"
              className="h-11 font-semibold"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs font-bold text-rose-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment Date
            </Label>
            <Input
              id="paymentDate"
              type="date"
              className="h-11 font-semibold"
              {...register("paymentDate")}
            />
            {errors.paymentDate && (
              <p className="text-xs font-bold text-rose-500">{errors.paymentDate.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recording...
                </>
              ) : (
                "Record Payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
