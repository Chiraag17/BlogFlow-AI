import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/services/security/rate-limiter";
import {
  DEMO_STUDIO_EMAIL,
  ensureDemoAccountExists,
  findUserWithFallback,
  generatePasswordResetChallenge,
} from "@/lib/passwordResetStore";

const OtpLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(254),
});

export async function POST(request: Request) {
  try {
    const clientKey = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`auth:otp-login:${clientKey}`, 12, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many sign-in code requests. Please wait a few minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const parsed = OtpLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Auto-provision demo@blogflow.ai so passwordless OTP login works out of the box
    if (email === DEMO_STUDIO_EMAIL) {
      await ensureDemoAccountExists();
    }

    const user = await findUserWithFallback(email);
    if (!user) {
      return NextResponse.json(
        {
          error:
            "No account found with that email. Try demo@blogflow.ai or switch to Sign Up to create one.",
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
        message: "A 6-digit passwordless sign-in code has been generated.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Auth OTP Login Error]:", err);
    return NextResponse.json(
      { error: "Unable to send 6-digit sign-in code right now. Please try again." },
      { status: 500 }
    );
  }
}
