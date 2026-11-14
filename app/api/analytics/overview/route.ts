import { NextResponse } from 'next/server';
import { DbAnalyticsService } from '@/services/db/analytics.service';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    const data = await DbAnalyticsService.getOverviewMetrics(userId);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
