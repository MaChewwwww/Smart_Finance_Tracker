import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpVerifications, refreshTokens, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, generateOTP, hashToken } from "@/lib/security";
import { loginSchema } from "@/lib/validators";
import { sendOTPEmail } from "@/lib/brevo";
import { signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

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

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      // Security: Keep error messages generic to prevent email enumeration
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password.",
          },
        },
        { status: 401 }
      );
    }

    // 2. Verify password
    const isPasswordCorrect = verifyPassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      // Log failed login audit
      await db.insert(auditLogs).values({
        userId: user.id,
        action: "login_failed_password",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password.",
          },
        },
        { status: 401 }
      );
    }

    // 3. Check email verification status
    if (!user.emailVerifiedAt) {
      // Resend OTP code for registration purposes
      const otpCode = generateOTP();
      const codeHash = hashToken(otpCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete previous OTP attempts for this email
      await db.delete(otpVerifications).where(eq(otpVerifications.email, normalizedEmail));

      // Store new OTP
      await db.insert(otpVerifications).values({
        userId: user.id,
        email: normalizedEmail,
        codeHash,
        purpose: "register",
        expiresAt,
      });

      // Send the real Brevo email
      await sendOTPEmail(normalizedEmail, otpCode, "register");

      // Log audit
      await db.insert(auditLogs).values({
        userId: user.id,
        action: "login_failed_unverified",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNVERIFIED_EMAIL",
            message: "Your email is not verified. A new verification code has been sent to your inbox.",
          },
        },
        { status: 403 }
      );
    }

    // 4. Success: Generate Access & Refresh tokens
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

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    // Log login success audit
    await db.insert(auditLogs).values({
      userId: user.id,
      action: "login_success",
      entityType: "users",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Something went wrong during login.",
        },
      },
      { status: 500 }
    );
  }
}
