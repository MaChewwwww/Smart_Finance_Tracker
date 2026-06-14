import { NextRequest } from "next/server";
import { db } from "@/db";
import { transactions, categories, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";
import { updateTransactionSchema } from "@/lib/validators";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const [tx] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .limit(1);

    if (!tx) return fail("NOT_FOUND", "Transaction not found.", 404);
    return ok({ transaction: tx });
  } catch (error: any) {
    console.error("GET /api/transactions/[id] error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to load transaction.", 500);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    // Confirm ownership first.
    const [existing] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .limit(1);

    if (!existing) return fail("NOT_FOUND", "Transaction not found.", 404);

    const data = parsed.data;
    const nextType = data.type ?? (existing.type as "income" | "expense");

    if (data.categoryId) {
      const [cat] = await db
        .select({ id: categories.id, type: categories.type })
        .from(categories)
        .where(and(eq(categories.id, data.categoryId), eq(categories.userId, user.id)))
        .limit(1);
      if (!cat) return fail("INVALID_CATEGORY", "Selected category was not found.", 400);
      if (cat.type !== nextType) {
        return fail("CATEGORY_TYPE_MISMATCH", "Category type does not match the transaction type.", 400);
      }
    }

    const updates: Record<string, unknown> = {};
    if (data.type !== undefined) updates.type = data.type;
    if (data.amount !== undefined) updates.amount = data.amount.toFixed(2);
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId || null;
    if (data.description !== undefined) updates.description = data.description || null;
    if (data.transactionDate !== undefined) updates.transactionDate = data.transactionDate;

    if (Object.keys(updates).length === 0) {
      return fail("NO_CHANGES", "No fields to update.", 400);
    }

    await db
      .update(transactions)
      .set(updates)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "update_transaction",
      entityType: "transactions",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Transaction updated successfully.");
  } catch (error: any) {
    console.error("PATCH /api/transactions/[id] error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to update transaction.", 500);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const [existing] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .limit(1);

    if (!existing) return fail("NOT_FOUND", "Transaction not found.", 404);

    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "delete_transaction",
      entityType: "transactions",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Transaction deleted successfully.");
  } catch (error: any) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to delete transaction.", 500);
  }
}
