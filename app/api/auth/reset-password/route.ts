import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier } from "@/services/security/rate-limiter";
import { verifyPasswordResetChallenge } from "@/lib/passwordResetStore";

const VerifyOtpOnlySchema = z.object({
  action: z.literal("verify_otp"),
  email: z.string().trim().toLowerCase().email().max(254),
  otp: z.string().trim().length(6),
  resetToken: z.string().min(10),
});

const ResetPasswordSchema = z.object({
  action: z.literal("reset_password").optional(),
  email: z.string().trim().toLowerCase().email().max(254),
  otp: z.string().trim().length(6),
  resetToken: z.string().min(10),
  newPassword: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const clientKey = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`auth:reset:${clientKey}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait a few minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();

    // Step 2 check: Verify 6-digit OTP without consuming it yet
    if (body?.action === "verify_otp") {
      const parsedVerify = VerifyOtpOnlySchema.safeParse(body);
      if (!parsedVerify.success) {
        return NextResponse.json(
          { error: "Please enter all 6 digits of your verification code." },
          { status: 400 }
        );
      }

      const { email, otp, resetToken } = parsedVerify.data;
      const check = verifyPasswordResetChallenge(email, otp, resetToken, false);
      if (!check.valid) {
        return NextResponse.json(
          { error: check.reason || "Invalid verification code." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        verified: true,
        message: "Verification code confirmed. You may now set your new password.",
      });
    }

    // Step 3: Verify OTP + update passwordHash in PostgreSQL
    const parsedReset = ResetPasswordSchema.safeParse(body);
    if (!parsedReset.success) {
      return NextResponse.json(
        { error: "Password must be between 8 and 72 characters." },
        { status: 400 }
      );
    }

    const { email, otp, resetToken, newPassword } = parsedReset.data;

    const verification = verifyPasswordResetChallenge(email, otp, resetToken, true);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason || "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return NextResponse.json({
      ok: true,
      message: "Your password has been updated. You can now sign in.",
    });
  } catch (err) {
    console.error("[Auth Reset Password Error]:", err);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
