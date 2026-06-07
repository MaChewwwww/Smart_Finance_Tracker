import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpVerifications, refreshTokens, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { hashToken } from "@/lib/security";
import { verifyOtpSchema } from "@/lib/validators";
import { signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/auth";
import { seedDefaultCategories } from "@/lib/db-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const { email, code, purpose } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User account not found.",
          },
        },
        { status: 404 }
      );
    }

    // 2. Fetch latest active OTP record for this purpose
    const [otpRecord] = await db
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.email, normalizedEmail))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    if (!otpRecord || otpRecord.purpose !== purpose || otpRecord.usedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_OTP",
            message: "No active verification code was found. Please request a new code.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Check expiration
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXPIRED_OTP",
            message: "Verification code has expired. Please request a new one.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Increment verification attempt
    const newAttemptCount = otpRecord.attemptCount + 1;
    await db
      .update(otpVerifications)
      .set({ attemptCount: newAttemptCount })
      .where(eq(otpVerifications.id, otpRecord.id));

    if (newAttemptCount > 5) {
      // Invalidate the code
      await db
        .update(otpVerifications)
        .set({ expiresAt: new Date(0) })
        .where(eq(otpVerifications.id, otpRecord.id));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_ATTEMPTS",
            message: "Too many failed attempts. This code is now invalid. Please request a new one.",
          },
        },
        { status: 400 }
      );
    }

    // 5. Compare hash
    const inputCodeHash = hashToken(code);
    if (otpRecord.codeHash !== inputCodeHash) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CODE",
            message: `Incorrect verification code. Attempts remaining: ${5 - newAttemptCount}`,
          },
        },
        { status: 400 }
      );
    }

    // 6. Success: Mark OTP as used
    await db
      .update(otpVerifications)
      .set({ usedAt: new Date() })
      .where(eq(otpVerifications.id, otpRecord.id));

    // If purpose is registration, verify user email & seed default categories
    if (purpose === "register" && !user.emailVerifiedAt) {
      await db
        .update(users)
        .set({ emailVerifiedAt: new Date() })
        .where(eq(users.id, user.id));

      // Seed categories
      await seedDefaultCategories(user.id);
    }

    // 7. Establish Session: Generate Access & Refresh tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const familyId = crypto.randomUUID();
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload, familyId);

    // Save hashed refresh token to database
    const hashedRefreshToken = hashToken(refreshToken);
    const refreshExpiry = new Date(
      Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "7", 10) * 24 * 60 * 60 * 1000
    );

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: hashedRefreshToken,
      familyId,
      expiresAt: refreshExpiry,
    });

    // Set secure HTTP-only cookies
    await setAuthCookies(accessToken, refreshToken);

    // Log success audit
    await db.insert(auditLogs).values({
      userId: user.id,
      action: purpose === "register" ? "register_verify_success" : "login_verify_success",
      entityType: "users",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Verification successful.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Something went wrong during verification.",
        },
      },
      { status: 500 }
    );
  }
}
