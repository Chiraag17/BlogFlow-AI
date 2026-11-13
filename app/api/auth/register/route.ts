// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/services/security/rate-limiter";
import {
  createUserWithFallback,
  findUserWithFallback,
} from "@/lib/passwordResetStore";

const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(72, "Password must be 72 characters or fewer."),
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(120, "Name must be 120 characters or fewer.")
    .optional(),
});

export const POST = async (request: Request) => {
  try {
    const clientKey = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`auth:register:${clientKey}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in a few minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Please check your registration details.";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }
    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existing = await findUserWithFallback(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUserWithFallback({
      email,
      passwordHash,
      name: name ?? "",
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Auth Register Error]:", err);
    return NextResponse.json(
      { error: "Unable to create account right now. Please try again." },
      { status: 500 }
    );
  }
};
