import { NextRequest } from "next/server";
import { db } from "@/db";
import { debts, debtPayments, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";
import { logDebtPaymentSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id: debtId } = await ctx.params;

    const body = await req.json();
    const parsed = logDebtPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { amount, paymentDate } = parsed.data;

    // Confirm ownership and fetch current remaining amount
    const [debt] = await db
      .select({
        id: debts.id,
        remainingAmount: debts.remainingAmount,
        originalAmount: debts.originalAmount,
        dueDate: debts.dueDate,
        status: debts.status,
      })
      .from(debts)
      .where(and(eq(debts.id, debtId), eq(debts.userId, user.id)))
      .limit(1);

    if (!debt) return fail("NOT_FOUND", "Debt not found.", 404);

    if (debt.status === "paid") {
      return fail("ALREADY_PAID", "This debt is already fully paid.", 400);
    }

    const currentRemaining = Number(debt.remainingAmount);

    if (amount > currentRemaining) {
      return fail(
        "OVERPAYMENT",
        `Payment of $${amount.toFixed(2)} exceeds the remaining balance of $${currentRemaining.toFixed(2)}.`,
        400
      );
    }

    const newRemaining = Math.max(0, currentRemaining - amount);
    const newStatus =
      newRemaining <= 0
        ? "paid"
        : debt.dueDate && new Date(debt.dueDate) < new Date()
        ? "overdue"
        : "active";

    // Insert payment record
    const paymentId = crypto.randomUUID();
    await db.insert(debtPayments).values({
      id: paymentId,
      debtId,
      userId: user.id,
      amount: amount.toFixed(2),
      paymentDate,
    });

    // Update remaining balance and status on the parent debt
    await db
      .update(debts)
      .set({
        remainingAmount: newRemaining.toFixed(2),
        status: newStatus,
      })
      .where(and(eq(debts.id, debtId), eq(debts.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "log_debt_payment",
      entityType: "debt_payments",
      entityId: paymentId,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok(
      { paymentId, newRemaining, newStatus },
      newStatus === "paid" ? "Payment recorded. Debt is now fully paid!" : "Payment recorded successfully."
    );
  } catch (error: any) {
    console.error("POST /api/debts/[id]/payment error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to log payment.", 500);
  }
}
