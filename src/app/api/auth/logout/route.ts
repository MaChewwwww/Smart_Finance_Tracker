import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { refreshTokens, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/security";
import { verifyJWT, clearAuthCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const refreshTokenCookie = req.cookies.get("refreshToken")?.value;

    let userId: string | undefined = undefined;

    if (refreshTokenCookie) {
      const decoded = await verifyJWT(refreshTokenCookie);
      if (decoded && decoded.userId) {
        userId = decoded.userId as string;
        const currentTokenHash = hashToken(refreshTokenCookie);

        // Revoke token in database
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokens.tokenHash, currentTokenHash));
      }
    }

    // Clear cookies
    await clearAuthCookies();

    // Log logout audit
    if (userId) {
      await db.insert(auditLogs).values({
        userId,
        action: "logout",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Something went wrong during logout.",
        },
      },
      { status: 500 }
    );
  }
}
