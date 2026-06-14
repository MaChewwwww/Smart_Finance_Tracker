import { NextRequest } from "next/server";
import { db } from "@/db";
import { transactions, categories, auditLogs } from "@/db/schema";
import { and, eq, gte, lte, like, or, desc } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";
import { createTransactionSchema, transactionFilterSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const parsed = transactionFilterSchema.safeParse({
      type: searchParams.get("type") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      search: searchParams.get("search") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
    });

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { type, categoryId, search, from, to } = parsed.data;

    const conditions = [eq(transactions.userId, user.id)];
    if (type) conditions.push(eq(transactions.type, type));
    if (categoryId) conditions.push(eq(transactions.categoryId, categoryId));
    if (from) conditions.push(gte(transactions.transactionDate, from));
    if (to) conditions.push(lte(transactions.transactionDate, to));
    if (search) {
      conditions.push(
        or(
          like(transactions.description, `%${search}%`),
          like(categories.name, `%${search}%`)
        )!
      );
    }

    const rows = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        transactionDate: transactions.transactionDate,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt));

    return ok({ transactions: rows });
  } catch (error: any) {
    console.error("GET /api/transactions error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to load transactions.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { type, amount, categoryId, description, transactionDate } = parsed.data;

    // Verify the category belongs to this user (and matches the type) before linking.
    if (categoryId) {
      const [cat] = await db
        .select({ id: categories.id, type: categories.type })
        .from(categories)
        .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)))
        .limit(1);

      if (!cat) {
        return fail("INVALID_CATEGORY", "Selected category was not found.", 400);
      }
      if (cat.type !== type) {
        return fail("CATEGORY_TYPE_MISMATCH", "Category type does not match the transaction type.", 400);
      }
    }

    const id = crypto.randomUUID();
    await db.insert(transactions).values({
      id,
      userId: user.id,
      type,
      amount: amount.toFixed(2),
      categoryId: categoryId || null,
      description: description || null,
      transactionDate,
    });

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "create_transaction",
      entityType: "transactions",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return ok({ id }, "Transaction created successfully.");
  } catch (error: any) {
    console.error("POST /api/transactions error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to create transaction.", 500);
  }
}
