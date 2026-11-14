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
      const { blogs } = serverFallbackStore.getBlogs({ userId, limit: 100 });
      const data = blogs.map((b) => ({
        id: b.id,
        title: b.title,
        status: b.status,
        category: b.category,
        createdAt: b.createdAt,
        estimatedReadingTime: b.estimatedReadingTime,
      }));
      return NextResponse.json({ success: true, data });
    }

    try {
      const blogs = await prisma.blog.findMany({
        where: accessibleIds.length > 0 ? { websiteId: { in: accessibleIds } } : {},
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          createdAt: true,
          estimatedReadingTime: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return NextResponse.json({ success: true, data: blogs });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        const { blogs } = serverFallbackStore.getBlogs({ userId, limit: 100 });
        const data = blogs.map((b) => ({
          id: b.id,
          title: b.title,
          status: b.status,
          category: b.category,
          createdAt: b.createdAt,
          estimatedReadingTime: b.estimatedReadingTime,
        }));
        return NextResponse.json({ success: true, data });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
