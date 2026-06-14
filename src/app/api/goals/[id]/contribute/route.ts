import { NextRequest } from "next/server";
import { db } from "@/db";
import { financialGoals, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";
import { contributeGoalSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = contributeGoalSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { amount } = parsed.data;

    const [goal] = await db
      .select()
      .from(financialGoals)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)))
      .limit(1);

    if (!goal) return fail("NOT_FOUND", "Goal not found.", 404);
    if (goal.status === "completed") return fail("ALREADY_COMPLETED", "This goal is already completed.", 400);

    const currentAmount = Number(goal.currentAmount);
    const targetAmount = Number(goal.targetAmount);
    const newAmount = Math.min(currentAmount + amount, targetAmount);
    const newStatus = newAmount >= targetAmount ? "completed" : "active";

    await db
      .update(financialGoals)
      .set({ currentAmount: newAmount.toFixed(2), status: newStatus })
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)));

    await db.insert(auditLogs).values({
      userId: user.id, action: "contribute_goal", entityType: "financial_goals", entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok(
      { id, newAmount, newStatus },
      newStatus === "completed" ? "Goal completed! Congratulations!" : "Contribution recorded."
    );
  } catch (error: any) {
    console.error("POST /api/goals/[id]/contribute error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to contribute.", 500);
  }
}
