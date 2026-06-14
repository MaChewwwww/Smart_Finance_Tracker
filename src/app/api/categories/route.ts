import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getAuthUser, ok, fail, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
        icon: categories.icon,
      })
      .from(categories)
      .where(eq(categories.userId, user.id))
      .orderBy(asc(categories.type), asc(categories.name));

    return ok({ categories: rows });
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return fail("INTERNAL_SERVER_ERROR", error.message || "Failed to load categories.", 500);
  }
}
