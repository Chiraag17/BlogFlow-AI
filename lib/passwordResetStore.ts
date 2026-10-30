import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const DEMO_STUDIO_EMAIL = "demo@blogflow.ai";
export const DEMO_STUDIO_DEFAULT_PASSWORD = "DemoStudio!2026";

interface OtpRecord {
  email: string;
  otpHash: string;
  expiresAt: number;
  used: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var passwordResetOtpStore: Map<string, OtpRecord> | undefined;
}

const otpStore: Map<string, OtpRecord> =
  globalThis.passwordResetOtpStore ?? new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== "production") {
  globalThis.passwordResetOtpStore = otpStore;
}

function getSigningSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.DATABASE_URL ||
    "blogflow-ai-portal-hmac-secret-2026"
  );
}

function createHmacSignature(payload: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");
}

/**
 * Ensures the Demo Studio user exists in the database so 1-click Demo Login
 * and Demo Forgot Password flows always work out of the box.
 */
export async function ensureDemoAccountExists() {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_STUDIO_EMAIL },
  });
  if (existing) {
    return existing;
  }
  const passwordHash = await bcrypt.hash(DEMO_STUDIO_DEFAULT_PASSWORD, 12);
  return prisma.user.create({
    data: {
      email: DEMO_STUDIO_EMAIL,
      name: "Aria Vance",
      passwordHash,
    },
  });
}

/**
 * Generates a 6-digit OTP and a stateless HMAC-signed reset token valid for 10 minutes.
 */
export function generatePasswordResetChallenge(email: string): {
  otp: string;
  resetToken: string;
  expiresAt: number;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = String(crypto.randomInt(100000, 999999));
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const otpHash = createHmacSignature(`${normalizedEmail}:${otp}:${expiresAt}`);
  const resetToken = Buffer.from(
    JSON.stringify({
      email: normalizedEmail,
      expiresAt,
      sig: otpHash,
    })
  ).toString("base64url");

  otpStore.set(normalizedEmail, {
    email: normalizedEmail,
    otpHash,
    expiresAt,
    used: false,
  });

  return { otp, resetToken, expiresAt };
}

/**
 * Verifies a 6-digit OTP against both the signed resetToken and the server-side store.
 */
export function verifyPasswordResetChallenge(
  email: string,
  otp: string,
  resetToken: string,
  consume = false
): { valid: boolean; reason?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return { valid: false, reason: "Please enter a valid 6-digit verification code." };
  }

  try {
    const decodedRaw = Buffer.from(resetToken, "base64url").toString("utf-8");
    const parsed = JSON.parse(decodedRaw) as {
      email?: string;
      expiresAt?: number;
      sig?: string;
    };

    if (!parsed.email || !parsed.expiresAt || !parsed.sig) {
      return { valid: false, reason: "Invalid recovery session token." };
    }

    if (parsed.email !== normalizedEmail) {
      return { valid: false, reason: "Email does not match recovery session." };
    }

    if (Date.now() > parsed.expiresAt) {
      return { valid: false, reason: "Verification code has expired. Please request a new one." };
    }

    const expectedSig = createHmacSignature(
      `${normalizedEmail}:${cleanOtp}:${parsed.expiresAt}`
    );

    const sigBuffer = Buffer.from(parsed.sig, "hex");
    const expectedBuffer = Buffer.from(expectedSig, "hex");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return { valid: false, reason: "Incorrect 6-digit verification code." };
    }

    const stored = otpStore.get(normalizedEmail);
    if (stored && stored.used) {
      return { valid: false, reason: "This verification code has already been used." };
    }

    if (consume) {
      otpStore.set(normalizedEmail, {
        email: normalizedEmail,
        otpHash: expectedSig,
        expiresAt: parsed.expiresAt,
        used: true,
      });
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Invalid or corrupted recovery token." };
  }
}
