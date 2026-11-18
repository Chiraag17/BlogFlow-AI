import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaMock(): PrismaClient {
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    count: async () => 0,
    groupBy: async () => [],
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    updateMany: async () => ({ count: 0 }),
    upsert: async (d: any) => d?.create ?? {},
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };
  return new Proxy({} as PrismaClient, {
    get: (_target, prop) => {
      if (prop === '$queryRaw') return async () => [];
      if (prop === '$transaction') return async (ops: any[]) => Promise.all(ops);
      if (prop === '$connect' || prop === '$disconnect') return async () => {};
      return noOp;
    },
  });
}

function createPrismaClient(): PrismaClient {
  const rawDbUrl = process.env.DATABASE_URL;
  if (!rawDbUrl || !rawDbUrl.trim()) {
    return createPrismaMock();
  }

  try {
    // Adjust Neon URL: enforce WebSocket port 443 and sslmode=verify-full
    const dbUrl = (() => {
      if (rawDbUrl.includes('neon.tech')) {
        try {
          const url = new URL(rawDbUrl);
          // Set port to 443 if none specified
          if (!url.port) url.port = '443';
          // Ensure sslmode=verify-full
          if (!url.searchParams.has('sslmode')) {
            url.searchParams.set('sslmode', 'verify-full');
          }
          return url.toString();
        } catch {
          // Fallback to raw URL if parsing fails
          return rawDbUrl;
        }
      }
      return rawDbUrl;
    })();

    // If using Neon PostgreSQL, route queries through @prisma/adapter-neon over WebSockets (port 443)
    if (dbUrl.includes('neon.tech')) {
      if (!neonConfig.webSocketConstructor) {
        neonConfig.webSocketConstructor = ws;
      }

      const adapter = new PrismaNeon({
        connectionString: dbUrl,
      });

      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    }

    // Standard fallback
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  } catch (err) {
    console.warn('[AI Studio] Database not connected — using Prisma mock:', err);
    return createPrismaMock();
  }
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Validates if the PostgreSQL database is reachable.
 * Returns true if connected, false otherwise with real error message.
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
    return {
      connected: false,
      error: 'DATABASE_URL is not configured. Running with in-memory fallback store.',
    };
  }
  try {
    await prisma.$queryRaw`SELECT 1 as ping`;
    return { connected: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, error: message };
  }
}

