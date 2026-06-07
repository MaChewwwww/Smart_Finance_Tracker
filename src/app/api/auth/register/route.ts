import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpVerifications, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, generateOTP, hashToken } from "@/lib/security";
import { registerSchema } from "@/lib/validators";
import { sendOTPEmail } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

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

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      // If user exists and is already verified, block registration
      if (existingUser.emailVerifiedAt) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "EMAIL_ALREADY_EXISTS",
              message: "An account with this email already exists.",
            },
          },
          { status: 400 }
        );
      }

      // If user exists but is NOT verified, we will resend them a new OTP
      const otpCode = generateOTP();
      const codeHash = hashToken(otpCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Delete previous OTP attempts for this email
      await db.delete(otpVerifications).where(eq(otpVerifications.email, normalizedEmail));

      // Store new OTP hash
      await db.insert(otpVerifications).values({
        userId: existingUser.id,
        email: normalizedEmail,
        codeHash,
        purpose: "register",
        expiresAt,
      });

      // Send the real Brevo email
      await sendOTPEmail(normalizedEmail, otpCode, "register");

      // Log audit
      await db.insert(auditLogs).values({
        userId: existingUser.id,
        action: "resend_registration_otp",
        entityType: "users",
        entityId: existingUser.id,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return NextResponse.json({
        success: true,
        message: "An unverified account exists. A new verification code has been sent.",
      });
    }

    // 2. Create unverified user
    const passwordHash = hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name,
      email: normalizedEmail,
      passwordHash,
    });

    // 3. Generate OTP
    const otpCode = generateOTP();
    const codeHash = hashToken(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(otpVerifications).values({
      userId,
      email: normalizedEmail,
      codeHash,
      purpose: "register",
      expiresAt,
    });

    // 4. Send the real Brevo email
    await sendOTPEmail(normalizedEmail, otpCode, "register");

    // Log audit
    await db.insert(auditLogs).values({
      userId,
      action: "register_request",
      entityType: "users",
      entityId: userId,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. A verification code has been sent to your email.",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Something went wrong during registration.",
        },
      },
      { status: 500 }
    );
  }
}
