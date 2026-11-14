import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/prisma';

/**
 * GET /api/health
 * Live system health & subsystem diagnostics endpoint.
 * Performs live database check and reports service readiness without exposing credentials.
 */
export async function GET() {
  try {
    const dbCheck = await checkDatabaseConnection();

    const aiConfigured = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY.trim().length > 0 &&
        !process.env.GEMINI_API_KEY.includes('your_')
    );

    const tavilyConfigured = Boolean(
      process.env.TAVILY_API_KEY &&
        process.env.TAVILY_API_KEY.trim().length > 0 &&
        !process.env.TAVILY_API_KEY.includes('your_')
    );

    const googleOAuthConfigured = Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    );

    const githubOAuthConfigured = Boolean(
      process.env.GITHUB_ID && process.env.GITHUB_SECRET
    );

    return NextResponse.json(
      {
        status: dbCheck.connected ? 'ok' : 'degraded',
        database: dbCheck.connected ? 'connected' : 'disconnected',
        fallbackActive: !dbCheck.connected,
        services: {
          database: dbCheck.connected ? 'live' : 'fallback',
          ai: aiConfigured ? 'live' : 'fallback',
          research: tavilyConfigured ? 'live' : 'fallback',
          googleOAuth: googleOAuthConfigured,
          githubOAuth: githubOAuthConfigured,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('[Health] Unexpected check error:', err);
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'disconnected',
        fallbackActive: true,
        services: {
          database: 'fallback',
          ai: 'fallback',
          research: 'fallback',
          googleOAuth: false,
          githubOAuth: false,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
