import { NextRequest } from "next/server";
import { db } from "@/db";
import { transactions, categories, debts } from "@/db/schema";
import { and, eq, gte, lte, desc, sql } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";

function monthBounds(now: Date) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${y}-${pad(m + 1)}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const end = `${y}-${pad(m + 1)}-${pad(lastDay)}`;
  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const { start, end } = monthBounds(new Date());

    // All-time totals for current balance.
    const [allTime] = await db
      .select({
        income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.userId, user.id));

    // This month's income/expense totals and counts.
    const [month] = await db
      .select({
        income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
        incomeCount: sql<number>`SUM(CASE WHEN ${transactions.type} = 'income' THEN 1 ELSE 0 END)`,
        expenseCount: sql<number>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN 1 ELSE 0 END)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          gte(transactions.transactionDate, start),
          lte(transactions.transactionDate, end)
        )
      );

    // Active debt total.
    const [debtTotals] = await db
      .select({
        remaining: sql<string>`COALESCE(SUM(${debts.remainingAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(debts)
      .where(and(eq(debts.userId, user.id), eq(debts.status, "active")));

    // Five most recent transactions.
    const recent = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        transactionDate: transactions.transactionDate,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(5);

    const totalIncome = Number(allTime?.income ?? 0);
    const totalExpense = Number(allTime?.expense ?? 0);

    return ok({
      balance: totalIncome - totalExpense,
      monthlyIncome: Number(month?.income ?? 0),
      monthlyExpenses: Number(month?.expense ?? 0),
      monthlyIncomeCount: Number(month?.incomeCount ?? 0),
      monthlyExpenseCount: Number(month?.expenseCount ?? 0),
      activeDebtTotal: Number(debtTotals?.remaining ?? 0),
      activeDebtCount: Number(debtTotals?.count ?? 0),
      recentTransactions: recent,
    });
  } catch (error: any) {
    console.error("GET /api/dashboard/summary error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to load dashboard.", 500);
  }
}
