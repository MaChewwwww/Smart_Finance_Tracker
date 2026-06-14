import { NextRequest } from "next/server";
import { db } from "@/db";
import { debts, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const [debt] = await db
      .select({ id: debts.id, status: debts.status, originalAmount: debts.originalAmount })
      .from(debts)
      .where(and(eq(debts.id, id), eq(debts.userId, user.id)))
      .limit(1);

    if (!debt) return fail("NOT_FOUND", "Debt not found.", 404);
    if (debt.status === "paid") return fail("ALREADY_PAID", "This debt is already marked as paid.", 400);

    await db
      .update(debts)
      .set({ remainingAmount: "0.00", status: "paid" })
      .where(and(eq(debts.id, id), eq(debts.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "mark_debt_paid",
      entityType: "debts",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Debt marked as paid.");
  } catch (error: any) {
    console.error("POST /api/debts/[id]/mark-paid error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to mark debt as paid.", 500);
  }
}
