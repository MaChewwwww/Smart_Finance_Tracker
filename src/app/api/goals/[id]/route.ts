import { NextRequest } from "next/server";
import { db } from "@/db";
import { financialGoals, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";
import { updateGoalSchema, contributeGoalSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateGoalSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const [existing] = await db
      .select()
      .from(financialGoals)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)))
      .limit(1);
    if (!existing) return fail("NOT_FOUND", "Goal not found.", 404);

    const data = parsed.data;
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.targetAmount !== undefined) updates.targetAmount = data.targetAmount.toFixed(2);
    if (data.targetDate !== undefined) updates.targetDate = data.targetDate ?? null;
    if (data.notes !== undefined) updates.notes = data.notes ?? null;

    // Re-derive status
    const nextTarget = data.targetAmount ?? Number(existing.targetAmount);
    const currAmount = Number(existing.currentAmount);
    updates.status = currAmount >= nextTarget ? "completed" : "active";

    await db
      .update(financialGoals)
      .set(updates)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id, action: "update_goal", entityType: "financial_goals", entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Goal updated successfully.");
  } catch (error: any) {
    console.error("PATCH /api/goals/[id] error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to update goal.", 500);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const [existing] = await db
      .select({ id: financialGoals.id })
      .from(financialGoals)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)))
      .limit(1);
    if (!existing) return fail("NOT_FOUND", "Goal not found.", 404);

    await db.delete(financialGoals).where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id, action: "delete_goal", entityType: "financial_goals", entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Goal deleted successfully.");
  } catch (error: any) {
    console.error("DELETE /api/goals/[id] error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to delete goal.", 500);
  }
}
