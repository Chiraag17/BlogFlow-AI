import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/apiAuth';
import { DbWebsiteService } from '@/services/db/website.service';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);

    if (!process.env.DATABASE_URL) {
      const activity = serverFallbackStore.getPublishingHistory(userId);
      return NextResponse.json({ success: true, data: activity });
    }

    try {
      const activity = await prisma.publishingRecord.findMany({
        where:
          accessibleIds.length > 0
            ? { blog: { websiteId: { in: accessibleIds } } }
            : {},
        include: {
          blog: { select: { title: true, slug: true } },
          integration: { select: { cmsUrl: true, provider: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({ success: true, data: activity });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        const activity = serverFallbackStore.getPublishingHistory(userId);
        return NextResponse.json({ success: true, data: activity });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
