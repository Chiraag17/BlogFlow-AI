import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * Resolves the authenticated user ID for server route handlers.
 * Prefers the proxy-verified `x-user-id` header and falls back to `getServerSession`.
 */
export async function getAuthenticatedUserId(): Promise<string | undefined> {
  try {
    const headerStore = await headers();
    const headerUserId = headerStore.get("x-user-id");
    if (headerUserId) {
      return headerUserId;
    }
  } catch {
    // Outside request header context
  }

  try {
    const session = await getServerSession(authOptions);
    const id = (session?.user as { id?: string } | undefined)?.id;
    return id || undefined;
  } catch {
    return undefined;
  }
}

export async function getAuthenticatedUserEmail(): Promise<string | undefined> {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    return email ? email.trim().toLowerCase() : undefined;
  } catch {
    return undefined;
  }
}
