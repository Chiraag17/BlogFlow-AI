// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/services/security/rate-limiter";

export const authOptions: NextAuthOptions = {
  providers: [
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
        const rateLimit = checkRateLimit(`auth:login:${normalizedEmail}`, 10, 10 * 60 * 1000);
        if (!rateLimit.allowed) {
          throw new Error("Too many login attempts. Please try again in a few minutes.");
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
  ],
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
  secret: process.env.NEXTAUTH_SECRET,
};
