// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/services/security/rate-limiter";
import {
  DEMO_STUDIO_EMAIL,
  ensureDemoAccountExists,
} from "@/lib/passwordResetStore";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "email@example.com" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      if (credentials.password.length > 72) return null;

      const normalizedEmail = credentials.email.trim().toLowerCase();
      const rateLimit = checkRateLimit(`auth:login:${normalizedEmail}`, 15, 10 * 60 * 1000);
      if (!rateLimit.allowed) {
        throw new Error("Too many login attempts. Please try again in a few minutes.");
      }

      if (normalizedEmail === DEMO_STUDIO_EMAIL) {
        const demoUser = await ensureDemoAccountExists();
        if (credentials.password === "__DEMO_STUDIO_ACCESS__") {
          return {
            id: demoUser.id,
            name: demoUser.name ?? "Aria Vance",
            email: demoUser.email,
            role: demoUser.role,
          };
        }
      }

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (user?.passwordHash && (await bcrypt.compare(credentials.password, user.passwordHash))) {
        return { id: user.id, name: user.name ?? "", email: user.email, role: user.role };
      }
      return null;
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) return url;
        return `${baseUrl}${parsed.pathname}${parsed.search}`;
      } catch {
        return baseUrl;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "blogflow-ai-dev-secret-key-2026",
};

