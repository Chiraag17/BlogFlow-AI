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
      return NextResponse.json({
        success: true,
        data: serverFallbackStore.getPublishingHistory(userId),
      });
    }

    try {
      const history = await prisma.publishingRecord.findMany({
        where:
          accessibleIds.length > 0
            ? { blog: { websiteId: { in: accessibleIds } } }
            : {},
        include: {
          blog: { select: { id: true, title: true, slug: true, status: true } },
          integration: { select: { id: true, provider: true, cmsUrl: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({ success: true, data: history });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        return NextResponse.json({
          success: true,
          data: serverFallbackStore.getPublishingHistory(userId),
        });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
