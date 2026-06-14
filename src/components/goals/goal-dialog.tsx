"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";

import {
  createGoalSchema,
  type CreateGoalInput,
  type CreateGoalFormInput,
} from "@/lib/validators";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface GoalForEdit {
  id: string;
  name: string;
  targetAmount: string;
  targetDate: string | null;
  notes?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: GoalForEdit | null;
  onSaved: () => void;
}

export function GoalDialog({ open, onOpenChange, goal, onSaved }: Props) {
  const isEdit = Boolean(goal);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CreateGoalFormInput, unknown, CreateGoalInput>({
      resolver: zodResolver(createGoalSchema),
      defaultValues: { name: "", targetAmount: undefined, currentAmount: 0, targetDate: null, notes: "" },
    });

  useEffect(() => {
    if (!open) return;
    if (goal) {
      reset({
        name: goal.name,
        targetAmount: Number(goal.targetAmount),
        currentAmount: 0,
        targetDate: goal.targetDate ?? null,
        notes: goal.notes ?? "",
      });
    } else {
      reset({ name: "", targetAmount: undefined, currentAmount: 0, targetDate: null, notes: "" });
    }
  }, [open, goal, reset]);

  const onSubmit = async (data: CreateGoalInput) => {
    setSubmitting(true);
    try {
      const payload = { ...data, targetDate: data.targetDate || null, notes: data.notes || null };
      const res = isEdit
        ? await axios.patch(`/api/goals/${goal!.id}`, payload)
        : await axios.post("/api/goals", payload);

      if (res.data.success) {
        toast.success(res.data.message || "Saved.");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(res.data.error?.message || "Failed to save goal.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error?.message : null;
      toast.error(msg || "Failed to save goal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Goal" : "Add Savings Goal"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this savings goal." : "Create a new savings target to work towards."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalName" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Goal Name
            </Label>
            <Input id="goalName" placeholder="e.g. Emergency Fund" className="h-11 font-semibold" {...register("name")} />
            {errors.name && <p className="text-xs font-bold text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goalTarget" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Amount
              </Label>
              <Input id="goalTarget" type="number" step="0.01" min="0" placeholder="0.00" className="h-11 font-semibold" {...register("targetAmount")} />
              {errors.targetAmount && <p className="text-xs font-bold text-rose-500">{errors.targetAmount.message}</p>}
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="goalCurrent" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Already Saved
                </Label>
                <Input id="goalCurrent" type="number" step="0.01" min="0" placeholder="0.00" className="h-11 font-semibold" {...register("currentAmount")} />
                {errors.currentAmount && <p className="text-xs font-bold text-rose-500">{errors.currentAmount.message}</p>}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalDate" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Target Date <span className="text-slate-400 normal-case font-medium">(optional)</span>
            </Label>
            <Input id="goalDate" type="date" className="h-11 font-semibold" {...register("targetDate")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalNotes" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description <span className="text-slate-400 normal-case font-medium">(optional)</span>
            </Label>
            <Textarea id="goalNotes" placeholder="What is this goal for?" className="font-semibold resize-none" rows={2} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full h-11 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEdit ? "Save Changes" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
