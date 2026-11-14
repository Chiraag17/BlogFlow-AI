/**
 * Shared secret resolution for NextAuth JWT signing (authOptions) and
 * middleware verification (proxy.ts), preventing secret drift when
 * NEXTAUTH_SECRET is unset in local/preview environments.
 */
export function getNextAuthSecret(): string {
  return process.env.NEXTAUTH_SECRET || "blogflow-ai-dev-secret-key-2026";
}

/**
 * Checks whether an unknown thrown error represents a database connectivity,
 * initialization, or adapter unavailability failure so services can safely
 * transition to resilient in-memory fallback.
 */
export function isDatabaseUnavailableError(err: unknown): boolean {
  if (!process.env.DATABASE_URL) return true;
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  return (
    lower.includes("environment variable not found: database_url") ||
    lower.includes("can't reach database server") ||
    lower.includes("connection refused") ||
    lower.includes("connection terminated") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("etimedout") ||
    lower.includes("timeout") ||
    lower.includes("prismaclientinitializationerror") ||
    lower.includes("error validating datasource") ||
    lower.includes("neon") ||
    lower.includes("websocket") ||
    lower.includes("does not exist in the current database") ||
    lower.includes("relation")
  );
}
