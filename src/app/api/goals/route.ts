import { NextRequest } from "next/server";
import { db } from "@/db";
import { financialGoals, auditLogs } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";
import { createGoalSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // active | completed | all

    const conditions = [eq(financialGoals.userId, user.id)];
    if (statusFilter && statusFilter !== "all") {
      conditions.push(eq(financialGoals.status, statusFilter));
    }

    const rows = await db
      .select()
      .from(financialGoals)
      .where(and(...conditions))
      .orderBy(desc(financialGoals.createdAt));

    return ok({ goals: rows });
  } catch (error: any) {
    console.error("GET /api/goals error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to load goals.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = createGoalSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { name, targetAmount, currentAmount, targetDate, notes } = parsed.data;

    if ((currentAmount ?? 0) > targetAmount) {
      return fail("INVALID_AMOUNT", "Current amount cannot exceed the target amount.", 400);
    }

    const id = crypto.randomUUID();
    const status = (currentAmount ?? 0) >= targetAmount ? "completed" : "active";

    await db.insert(financialGoals).values({
      id,
      userId: user.id,
      name,
      targetAmount: targetAmount.toFixed(2),
      currentAmount: (currentAmount ?? 0).toFixed(2),
      targetDate: targetDate ?? null,
      status,
    });

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "create_goal",
      entityType: "financial_goals",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Goal created successfully.");
  } catch (error: any) {
    console.error("POST /api/goals error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to create goal.", 500);
  }
}
