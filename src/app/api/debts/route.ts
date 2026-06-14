import { NextRequest } from "next/server";
import { db } from "@/db";
import { debts, debtPayments, auditLogs } from "@/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";
import { createDebtSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // active | paid | overdue | all

    const conditions = [eq(debts.userId, user.id)];
    if (statusFilter && statusFilter !== "all") {
      conditions.push(eq(debts.status, statusFilter));
    }

    const rows = await db
      .select({
        id: debts.id,
        creditorName: debts.creditorName,
        originalAmount: debts.originalAmount,
        remainingAmount: debts.remainingAmount,
        dueDate: debts.dueDate,
        status: debts.status,
        notes: debts.notes,
        createdAt: debts.createdAt,
        updatedAt: debts.updatedAt,
      })
      .from(debts)
      .where(and(...conditions))
      .orderBy(desc(debts.createdAt));

    // Summary totals
    const [totals] = await db
      .select({
        totalOriginal: sql<string>`COALESCE(SUM(${debts.originalAmount}), 0)`,
        totalRemaining: sql<string>`COALESCE(SUM(${debts.remainingAmount}), 0)`,
        activeCount: sql<number>`SUM(CASE WHEN ${debts.status} != 'paid' THEN 1 ELSE 0 END)`,
      })
      .from(debts)
      .where(eq(debts.userId, user.id));

    return ok({
      debts: rows,
      summary: {
        totalOriginal: Number(totals?.totalOriginal ?? 0),
        totalRemaining: Number(totals?.totalRemaining ?? 0),
        activeCount: Number(totals?.activeCount ?? 0),
      },
    });
  } catch (error: any) {
    console.error("GET /api/debts error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to load debts.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = createDebtSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { creditorName, originalAmount, remainingAmount, dueDate, notes } = parsed.data;

    // Remaining amount must not exceed original amount
    if (remainingAmount > originalAmount) {
      return fail(
        "INVALID_REMAINING",
        "Remaining amount cannot exceed the original amount.",
        400
      );
    }

    const id = crypto.randomUUID();
    // Auto-derive status
    const status =
      remainingAmount <= 0
        ? "paid"
        : dueDate && new Date(dueDate) < new Date()
        ? "overdue"
        : "active";

    await db.insert(debts).values({
      id,
      userId: user.id,
      creditorName,
      originalAmount: originalAmount.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2),
      dueDate: dueDate ?? null,
      status,
      notes: notes ?? null,
    });

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "create_debt",
      entityType: "debts",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Debt created successfully.");
  } catch (error: any) {
    console.error("POST /api/debts error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to create debt.", 500);
  }
}
