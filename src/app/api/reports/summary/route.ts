import { NextRequest } from "next/server";
import { db } from "@/db";
import { transactions, categories, financialGoals } from "@/db/schema";
import { and, eq, gte, lte, desc, sql } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Returns YYYY-MM-01 and YYYY-MM-DD for the last `count` months (most-recent last). */
function lastNMonths(count: number): { label: string; start: string; end: string }[] {
  const result = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    result.push({
      label: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
      start: `${y}-${pad(m + 1)}-01`,
      end: `${y}-${pad(m + 1)}-${pad(lastDay)}`,
    });
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const months = lastNMonths(6);
    const rangeStart = months[0].start;
    const rangeEnd = months[months.length - 1].end;

    // ── 1. Monthly income & expense totals (last 6 months) ──────────────────
    const monthlyRows = await db
      .select({
        month: sql<string>`DATE_FORMAT(${transactions.transactionDate}, '%Y-%m')`,
        income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          gte(transactions.transactionDate, rangeStart),
          lte(transactions.transactionDate, rangeEnd)
        )
      )
      .groupBy(sql`DATE_FORMAT(${transactions.transactionDate}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${transactions.transactionDate}, '%Y-%m')`);

    // Map to a lookup for quick access
    const monthMap = new Map(monthlyRows.map((r) => [r.month, r]));

    // Build the trend array, filling in zeros for months with no data
    const trend = months.map((m) => {
      const key = m.start.slice(0, 7); // YYYY-MM
      const row = monthMap.get(key);
      return {
        label: m.label,
        income: Number(row?.income ?? 0),
        expense: Number(row?.expense ?? 0),
      };
    });

    // ── 2. Category breakdown for CURRENT month ──────────────────────────────
    const currentMonth = months[months.length - 1];
    const categoryRows = await db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, user.id),
          eq(transactions.type, "expense"),
          gte(transactions.transactionDate, currentMonth.start),
          lte(transactions.transactionDate, currentMonth.end)
        )
      )
      .groupBy(transactions.categoryId, categories.name)
      .orderBy(desc(sql`SUM(${transactions.amount})`));

    const totalExpenseCurrentMonth = categoryRows.reduce((s, r) => s + Number(r.total), 0);

    const categoryBreakdown = categoryRows.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName ?? "Uncategorized",
      total: Number(r.total),
      percentage:
        totalExpenseCurrentMonth > 0
          ? Math.round((Number(r.total) / totalExpenseCurrentMonth) * 1000) / 10
          : 0,
    }));

    // ── 3. Simple forecast: average monthly expense/income over last 6 months ─
    const validMonths = trend.filter((t) => t.income > 0 || t.expense > 0);
    const avgIncome =
      validMonths.length > 0
        ? validMonths.reduce((s, t) => s + t.income, 0) / validMonths.length
        : 0;
    const avgExpense =
      validMonths.length > 0
        ? validMonths.reduce((s, t) => s + t.expense, 0) / validMonths.length
        : 0;

    // ── 4. Active goals summary ───────────────────────────────────────────────
    const goals = await db
      .select({
        id: financialGoals.id,
        name: financialGoals.name,
        targetAmount: financialGoals.targetAmount,
        currentAmount: financialGoals.currentAmount,
        targetDate: financialGoals.targetDate,
        status: financialGoals.status,
      })
      .from(financialGoals)
      .where(and(eq(financialGoals.userId, user.id), eq(financialGoals.status, "active")))
      .orderBy(desc(financialGoals.targetDate));

    const goalsWithProgress = goals.map((g) => {
      const target = Number(g.targetAmount);
      const current = Number(g.currentAmount);
      const percent = target > 0 ? Math.round((current / target) * 1000) / 10 : 0;
      // Monthly contribution needed: remaining / months left (min 1)
      let monthsLeft = 1;
      if (g.targetDate) {
        const diff =
          (new Date(g.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
        monthsLeft = Math.max(1, Math.ceil(diff));
      }
      const monthlyNeeded = target > current ? (target - current) / monthsLeft : 0;
      return {
        ...g,
        targetAmount: target,
        currentAmount: current,
        percent,
        monthlyNeeded: Math.round(monthlyNeeded * 100) / 100,
      };
    });

    return ok({
      trend,
      categoryBreakdown,
      forecast: {
        avgMonthlyIncome: Math.round(avgIncome * 100) / 100,
        avgMonthlyExpense: Math.round(avgExpense * 100) / 100,
        projectedSavings: Math.round((avgIncome - avgExpense) * 100) / 100,
        monthsAnalyzed: validMonths.length,
      },
      goals: goalsWithProgress,
      currentMonthLabel: currentMonth.label,
      totalExpenseCurrentMonth: Math.round(totalExpenseCurrentMonth * 100) / 100,
    });
  } catch (error: any) {
    console.error("GET /api/reports/summary error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to load report.", 500);
  }
}
