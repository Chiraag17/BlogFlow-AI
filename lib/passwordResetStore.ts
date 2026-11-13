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

export interface AuthUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
}

declare global {
  // eslint-disable-next-line no-var
  var passwordResetOtpStore: Map<string, OtpRecord> | undefined;
  // eslint-disable-next-line no-var
  var fallbackAuthUserStore: Map<string, AuthUserRecord> | undefined;
}

const otpStore: Map<string, OtpRecord> =
  globalThis.passwordResetOtpStore ?? new Map<string, OtpRecord>();

const fallbackUsers: Map<string, AuthUserRecord> =
  globalThis.fallbackAuthUserStore ?? new Map<string, AuthUserRecord>();

if (process.env.NODE_ENV !== "production") {
  globalThis.passwordResetOtpStore = otpStore;
  globalThis.fallbackAuthUserStore = fallbackUsers;
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
 * Finds a user by email in Prisma, falling back to the in-memory store if DB is unreachable.
 */
export async function findUserWithFallback(
  email: string
): Promise<AuthUserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (dbUser) {
      const record: AuthUserRecord = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name ?? "",
        passwordHash: dbUser.passwordHash ?? "",
        role: dbUser.role ?? "USER",
      };
      fallbackUsers.set(normalizedEmail, record);
      return record;
    }
  } catch (err) {
    console.warn("[Auth Store] Prisma lookup fallback active:", err);
  }
  return fallbackUsers.get(normalizedEmail) ?? null;
}

/**
 * Creates a user in Prisma, falling back to the in-memory store if DB is unreachable.
 */
export async function createUserWithFallback(data: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<AuthUserRecord> {
  const normalizedEmail = data.email.trim().toLowerCase();
  try {
    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: data.name,
        passwordHash: data.passwordHash,
      },
    });
    const record: AuthUserRecord = {
      id: created.id,
      email: created.email,
      name: created.name ?? data.name,
      passwordHash: created.passwordHash ?? data.passwordHash,
      role: created.role ?? "USER",
    };
    fallbackUsers.set(normalizedEmail, record);
    return record;
  } catch (err) {
    console.warn("[Auth Store] Prisma create fallback active:", err);
    const record: AuthUserRecord = {
      id: `usr_${crypto.randomBytes(8).toString("hex")}`,
      email: normalizedEmail,
      name: data.name,
      passwordHash: data.passwordHash,
      role: "USER",
    };
    fallbackUsers.set(normalizedEmail, record);
    return record;
  }
}

/**
 * Updates a user's passwordHash in Prisma and the fallback store.
 */
export async function updateUserPasswordWithFallback(
  email: string,
  passwordHash: string
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  let updated = false;
  try {
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });
    updated = true;
  } catch (err) {
    console.warn("[Auth Store] Prisma update fallback active:", err);
  }
  const existing = fallbackUsers.get(normalizedEmail);
  if (existing) {
    fallbackUsers.set(normalizedEmail, { ...existing, passwordHash });
    updated = true;
  }
  return updated;
}

/**
 * Ensures the Demo Studio user exists in the database or fallback store so 1-click Demo Login,
 * 6-Digit OTP Login, and Demo Forgot Password flows always work out of the box.
 */
export async function ensureDemoAccountExists(): Promise<AuthUserRecord> {
  const existing = await findUserWithFallback(DEMO_STUDIO_EMAIL);
  if (existing) {
    return existing;
  }
  const passwordHash = await bcrypt.hash(DEMO_STUDIO_DEFAULT_PASSWORD, 12);
  return createUserWithFallback({
    email: DEMO_STUDIO_EMAIL,
    name: "Aria Vance",
    passwordHash,
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
