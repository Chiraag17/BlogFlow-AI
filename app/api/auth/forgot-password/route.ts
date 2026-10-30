import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier } from "@/services/security/rate-limiter";
import {
  DEMO_STUDIO_EMAIL,
  ensureDemoAccountExists,
  generatePasswordResetChallenge,
} from "@/lib/passwordResetStore";

const ForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export async function POST(request: Request) {
  try {
    const clientKey = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`auth:forgot:${clientKey}`, 8, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many recovery requests. Please wait a few minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Auto-provision the demo account if the user is testing with demo@blogflow.ai
    if (email === DEMO_STUDIO_EMAIL) {
      await ensureDemoAccountExists();
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "No account was found with that email. Try demo@blogflow.ai or create a new account.",
        },
        { status: 404 }
      );
    }

    const challenge = generatePasswordResetChallenge(email);

    return NextResponse.json(
      {
        ok: true,
        email: user.email,
        resetToken: challenge.resetToken,
        expiresAt: challenge.expiresAt,
        otpPreview: challenge.otp,
        message: "A 6-digit verification code has been generated for your account.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Auth Forgot Password Error]:", err);
    return NextResponse.json(
      { error: "Unable to initiate password recovery. Please try again." },
      { status: 500 }
    );
  }
}
