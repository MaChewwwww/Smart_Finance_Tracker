import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { refreshTokens, auditLogs, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashToken } from "@/lib/security";
import { verifyJWT, signAccessToken, signRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Read refresh token from cookies
    const refreshTokenCookie = req.cookies.get("refreshToken")?.value;

    if (!refreshTokenCookie) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Session expired or invalid.",
          },
        },
        { status: 401 }
      );
    }

    // 2. Verify JWT payload
    const decoded = await verifyJWT(refreshTokenCookie);
    if (!decoded || !decoded.userId || !decoded.familyId) {
      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Session expired or invalid.",
          },
        },
        { status: 401 }
      );
      // Clear invalid cookies
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    const userId = decoded.userId as string;
    const familyId = decoded.familyId as string;
    const email = decoded.email as string;
    const name = decoded.name as string;

    const currentTokenHash = hashToken(refreshTokenCookie);

    // 3. Find token in database
    const [dbToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, currentTokenHash))
      .limit(1);

    // 4. Reuse Detection
    if (!dbToken || dbToken.revokedAt) {
      console.warn(`🚨 Refresh token reuse detected for family ${familyId}. Revoking whole family!`);

      // Revoke all tokens belonging to this family ID
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.familyId, familyId));

      // Clear cookies
      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: "SECURITY_BREACH",
            message: "Session revoked due to security activity. Please log in again.",
          },
        },
        { status: 401 }
      );
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

      // Log security breach audit
      await db.insert(auditLogs).values({
        userId,
        action: "refresh_token_reuse_detected",
        entityType: "refresh_tokens",
        entityId: dbToken?.id || "unknown",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return response;
    }

    // Check expiration
    if (new Date() > dbToken.expiresAt) {
      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: "SESSION_EXPIRED",
            message: "Your session has expired. Please log in again.",
          },
        },
        { status: 401 }
      );
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    // 5. Rotation: Mark current token as revoked and record replacement ID
    const newRefreshTokenId = crypto.randomUUID();
    
    await db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        replacedByTokenId: newRefreshTokenId,
      })
      .where(eq(refreshTokens.id, dbToken.id));

    // Generate new Access and Refresh tokens (maintain same familyId)
    const tokenPayload = { userId, email, name };
    const newAccessToken = await signAccessToken(tokenPayload);
    const newRefreshToken = await signRefreshToken(tokenPayload, familyId);

    // Save the new refresh token
    const newHashedToken = hashToken(newRefreshToken);
    const refreshExpiry = new Date(
      Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "7", 10) * 24 * 60 * 60 * 1000
    );

    await db.insert(refreshTokens).values({
      id: newRefreshTokenId,
      userId,
      tokenHash: newHashedToken,
      familyId,
      expiresAt: refreshExpiry,
    });

    // Set cookies
    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully.",
    });

    const isProd = process.env.NODE_ENV === "production";
    
    response.cookies.set({
      name: "accessToken",
      value: newAccessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "7", 10) * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Something went wrong during token refresh.",
        },
      },
      { status: 500 }
    );
  }
}
