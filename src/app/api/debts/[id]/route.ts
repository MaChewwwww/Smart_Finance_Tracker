import { NextRequest } from "next/server";
import { db } from "@/db";
import { debts, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";
import { updateDebtSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

function deriveStatus(remainingAmount: number, dueDate: string | null | undefined): string {
  if (remainingAmount <= 0) return "paid";
  if (dueDate && new Date(dueDate) < new Date()) return "overdue";
  return "active";
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const [debt] = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, id), eq(debts.userId, user.id)))
      .limit(1);

    if (!debt) return fail("NOT_FOUND", "Debt not found.", 404);
    return ok({ debt });
  } catch (error: any) {
    console.error("GET /api/debts/[id] error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to load debt.", 500);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateDebtSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    // Confirm ownership
    const [existing] = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, id), eq(debts.userId, user.id)))
      .limit(1);

    if (!existing) return fail("NOT_FOUND", "Debt not found.", 404);

    const data = parsed.data;

    // Merge with existing to compute derived status
    const nextOriginal = data.originalAmount ?? Number(existing.originalAmount);
    const nextRemaining = data.remainingAmount ?? Number(existing.remainingAmount);
    const nextDueDate = data.dueDate !== undefined ? data.dueDate : existing.dueDate;

    if (nextRemaining > nextOriginal) {
      return fail("INVALID_REMAINING", "Remaining amount cannot exceed the original amount.", 400);
    }

    const updates: Record<string, unknown> = {};
    if (data.creditorName !== undefined) updates.creditorName = data.creditorName;
    if (data.originalAmount !== undefined) updates.originalAmount = data.originalAmount.toFixed(2);
    if (data.remainingAmount !== undefined) updates.remainingAmount = data.remainingAmount.toFixed(2);
    if (data.dueDate !== undefined) updates.dueDate = data.dueDate ?? null;
    if (data.notes !== undefined) updates.notes = data.notes ?? null;
    // Re-derive status whenever amounts or date change
    updates.status = deriveStatus(nextRemaining, nextDueDate);

    if (Object.keys(updates).length === 0) {
      return fail("NO_CHANGES", "No fields to update.", 400);
    }

    await db
      .update(debts)
      .set(updates)
      .where(and(eq(debts.id, id), eq(debts.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "update_debt",
      entityType: "debts",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Debt updated successfully.");
  } catch (error: any) {
    console.error("PATCH /api/debts/[id] error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to update debt.", 500);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const [existing] = await db
      .select({ id: debts.id })
      .from(debts)
      .where(and(eq(debts.id, id), eq(debts.userId, user.id)))
      .limit(1);

    if (!existing) return fail("NOT_FOUND", "Debt not found.", 404);

    await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "delete_debt",
      entityType: "debts",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Debt deleted successfully.");
  } catch (error: any) {
    console.error("DELETE /api/debts/[id] error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to delete debt.", 500);
  }
}
