"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Plus, Sparkles, CheckCircle, CalendarDays, Edit2, Trash2, Loader2, PiggyBank,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoalDialog, type GoalForEdit } from "@/components/goals/goal-dialog";

interface GoalRow {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string | null;
  status: string;
  notes?: string | null;
}

function money(v: number) {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalForEdit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GoalRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [contributeTarget, setContributeTarget] = useState<GoalRow | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributing, setContributing] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/goals");
      if (res.data.success) setGoals(res.data.data.goals);
    } catch { toast.error("Failed to load goals."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const openCreate = () => { setEditingGoal(null); setGoalDialogOpen(true); };
  const openEdit = (g: GoalRow) => {
    setEditingGoal({ id: g.id, name: g.name, targetAmount: g.targetAmount, targetDate: g.targetDate, notes: g.notes });
    setGoalDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`/api/goals/${deleteTarget.id}`);
      if (res.data.success) { toast.success("Goal deleted."); setDeleteTarget(null); loadGoals(); }
      else toast.error(res.data.error?.message || "Failed to delete.");
    } catch { toast.error("Failed to delete goal."); }
    finally { setDeleting(false); }
  };

  const handleContribute = async () => {
    if (!contributeTarget) return;
    const amount = parseFloat(contributeAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid contribution amount."); return; }
    setContributing(true);
    try {
      const res = await axios.post(`/api/goals/${contributeTarget.id}/contribute`, { amount });
      if (res.data.success) {
        toast.success(res.data.message || "Contribution recorded!");
        setContributeTarget(null);
        setContributeAmount("");
        loadGoals();
      } else { toast.error(res.data.error?.message || "Failed."); }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error?.message : null;
      toast.error(msg || "Failed to record contribution.");
    } finally { setContributing(false); }
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const GoalCard = ({ goal }: { goal: GoalRow }) => {
    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const remaining = Math.max(0, target - current);
    const isComplete = goal.status === "completed";

    return (
      <Card className={`glass-card flex flex-col justify-between hover:scale-[1.01] transition-transform ${isComplete ? "border-emerald-500/20 opacity-80" : ""}`}>
        <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1 flex-1 min-w-0 pr-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">{goal.name}</h3>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDate(goal.targetDate)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isComplete ? (
              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold gap-1 rounded-lg neon-glow-emerald">
                <CheckCircle className="h-3 w-3" /> Done
              </Badge>
            ) : (
              <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold rounded-lg neon-glow-blue">
                Active
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => openEdit(goal)} className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(goal)} className="h-7 w-7 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Saved: ${money(current)}</span>
              <span className="text-slate-900 dark:text-white">{percent.toFixed(0)}%</span>
            </div>
            <Progress value={percent} className="h-2.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-full" />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span>Target: ${money(target)}</span>
              <span>Remaining: ${money(remaining)}</span>
            </div>
          </div>
          {goal.notes && (
            <div className="rounded-xl bg-slate-100/40 p-3 text-xs text-slate-500 dark:bg-slate-900/20 dark:text-slate-400 font-semibold border border-border/40">
              <strong>Description:</strong> {goal.notes}
            </div>
          )}
        </CardContent>

        {!isComplete && (
          <CardFooter className="border-t border-border px-6 py-4 bg-gradient-to-br from-blue-500/[0.03] to-transparent flex flex-col items-start gap-2 rounded-b-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-4 w-4 animate-pulse text-blue-500" /> AI Goal Tip
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              {remaining > 0 && goal.targetDate
                ? (() => {
                    const daysLeft = Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
                    const needed = (remaining / monthsLeft).toFixed(2);
                    return `To reach your target on schedule, contribute approximately $${needed}/month.`;
                  })()
                : `Keep it up! You're ${percent.toFixed(0)}% of the way there.`}
            </p>
            <Button variant="outline" size="sm" onClick={() => { setContributeTarget(goal); setContributeAmount(""); }} className="w-full mt-1 text-xs font-bold h-9 rounded-xl border-border hover:border-blue-500 cursor-pointer">
              <PiggyBank className="mr-1.5 h-3.5 w-3.5" /> Add Contribution
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Savings Goals</h1>
          <p className="text-sm font-semibold text-slate-400">Set savings targets, track progress, and log contributions.</p>
        </div>
        <Button onClick={openCreate} className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer">
          <Plus className="mr-1.5 h-4 w-4" /> Add Goal
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center text-slate-400 font-bold">
            No savings goals yet. Click &quot;Add Goal&quot; to create your first one.
          </CardContent>
        </Card>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {activeGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
              </div>
            </div>
          )}
          {completedGoals.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {completedGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
              </div>
            </div>
          )}
        </>
      )}

      <GoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} goal={editingGoal} onSaved={loadGoals} />

      {/* Contribute Dialog */}
      <Dialog open={Boolean(contributeTarget)} onOpenChange={(o) => !o && setContributeTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5 text-blue-500" /> Add Contribution</DialogTitle>
            <DialogDescription>
              Adding to <span className="font-bold text-slate-900 dark:text-white">{contributeTarget?.name}</span>.
              Remaining: <span className="font-bold text-blue-500">${money(Math.max(0, Number(contributeTarget?.targetAmount) - Number(contributeTarget?.currentAmount)))}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="contributeAmt" className="text-xs font-bold uppercase tracking-wider text-slate-400">Amount</Label>
            <Input id="contributeAmt" type="number" step="0.01" min="0.01" placeholder="0.00" className="h-11 font-semibold" value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} />
          </div>
          <DialogFooter className="flex-row justify-end gap-2">
            <DialogClose render={<Button variant="outline" className="font-bold cursor-pointer" />}>Cancel</DialogClose>
            <Button onClick={handleContribute} disabled={contributing} className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer">
              {contributing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete goal?</DialogTitle>
            <DialogDescription>
              This will permanently remove <span className="font-bold text-slate-900 dark:text-white">{deleteTarget?.name}</span>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <DialogClose render={<Button variant="outline" className="font-bold cursor-pointer" />}>Cancel</DialogClose>
            <Button onClick={confirmDelete} disabled={deleting} className="font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
