"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";

import {
  createTransactionSchema,
  type CreateTransactionInput,
  type CreateTransactionFormInput,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
}

export interface TransactionForEdit {
  id: string;
  type: "income" | "expense";
  amount: string;
  description: string | null;
  transactionDate: string;
  categoryId: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  transaction?: TransactionForEdit | null;
  onSaved: () => void;
}

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function TransactionDialog({ open, onOpenChange, categories, transaction, onSaved }: Props) {
  const isEdit = Boolean(transaction);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionFormInput, unknown, CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "expense",
      amount: undefined,
      categoryId: null,
      description: "",
      transactionDate: todayISO(),
    },
  });

  const selectedType = watch("type");

  // Reset form whenever the dialog opens for a new target.
  useEffect(() => {
    if (!open) return;
    if (transaction) {
      reset({
        type: transaction.type,
        amount: Number(transaction.amount),
        categoryId: transaction.categoryId,
        description: transaction.description ?? "",
        transactionDate: transaction.transactionDate,
      });
    } else {
      reset({
        type: "expense",
        amount: undefined,
        categoryId: null,
        description: "",
        transactionDate: todayISO(),
      });
    }
  }, [open, transaction, reset]);

  // Clear category when switching type if it no longer matches.
  useEffect(() => {
    const current = watch("categoryId");
    if (!current) return;
    const cat = categories.find((c) => c.id === current);
    if (cat && cat.type !== selectedType) {
      setValue("categoryId", null);
    }
  }, [selectedType, categories, setValue, watch]);

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = async (data: CreateTransactionInput) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        categoryId: data.categoryId || null,
        description: data.description || null,
      };
      const res = isEdit
        ? await axios.patch(`/api/transactions/${transaction!.id}`, payload)
        : await axios.post("/api/transactions", payload);

      if (res.data.success) {
        toast.success(res.data.message || "Saved.");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(res.data.error?.message || "Failed to save transaction.");
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : null;
      toast.error(msg || "Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of this transaction." : "Record a new income or expense."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <div className="inline-flex w-full rounded-xl border border-border p-1">
                  <button
                    type="button"
                    onClick={() => field.onChange("expense")}
                    className={`flex-1 h-9 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      field.value === "expense" ? "bg-rose-500 text-white" : "text-slate-500"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("income")}
                    className={`flex-1 h-9 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      field.value === "income" ? "bg-emerald-500 text-white" : "text-slate-500"
                    }`}
                  >
                    Income
                  </button>
                </div>
              )}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-11 font-semibold"
              {...register("amount")}
            />
            {errors.amount && <p className="text-xs font-bold text-rose-500">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || null)}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400">No categories</div>
                    ) : (
                      filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="transactionDate" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Date
            </Label>
            <Input id="transactionDate" type="date" className="h-11 font-semibold" {...register("transactionDate")} />
            {errors.transactionDate && (
              <p className="text-xs font-bold text-rose-500">{errors.transactionDate.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Optional note..."
              className="font-semibold resize-none"
              rows={2}
              {...register("description")}
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
                "Add Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
