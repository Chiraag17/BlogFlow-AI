import { NextRequest, NextResponse } from 'next/server';
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
        data: serverFallbackStore.getAutomationConfigs(userId),
      });
    }

    try {
      const configs = await prisma.automationConfig.findMany({
        where: accessibleIds.length > 0 ? { websiteId: { in: accessibleIds } } : {},
        include: {
          website: { select: { id: true, name: true, url: true } },
        },
      });

      return NextResponse.json({ success: true, data: configs });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        return NextResponse.json({
          success: true,
          data: serverFallbackStore.getAutomationConfigs(userId),
        });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const {
      websiteId,
      enabled,
      researchFrequency,
      generationFrequency,
      preferredPublishingDays,
      preferredPublishingTime,
      timezone,
      maxBlogsPerWeek,
      requireHumanApproval,
    } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required' }, { status: 400 });
    }

    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(websiteId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have access to this website.' },
        { status: 403 }
      );
    }

    if (!process.env.DATABASE_URL) {
      const config = serverFallbackStore.upsertAutomationConfig({
        websiteId,
        enabled,
        researchFrequency,
        generationFrequency,
        preferredPublishingDays,
        preferredPublishingTime,
        timezone,
        maxBlogsPerWeek,
        requireHumanApproval,
      });
      return NextResponse.json({ success: true, data: config });
    }

    try {
      const config = await prisma.automationConfig.upsert({
        where: { websiteId },
        create: {
          websiteId,
          enabled: enabled ?? false,
          researchFrequency: researchFrequency || 'WEEKLY',
          generationFrequency: generationFrequency || 'WEEKLY',
          preferredPublishingDays: preferredPublishingDays || ['Monday', 'Wednesday', 'Friday'],
          preferredPublishingTime: preferredPublishingTime || '09:00',
          timezone: timezone || 'UTC',
          maxBlogsPerWeek: maxBlogsPerWeek || 3,
          requireHumanApproval: requireHumanApproval !== undefined ? requireHumanApproval : true,
        },
        update: {
          enabled: enabled !== undefined ? enabled : undefined,
          researchFrequency,
          generationFrequency,
          preferredPublishingDays,
          preferredPublishingTime,
          timezone,
          maxBlogsPerWeek,
          requireHumanApproval,
        },
      });

      return NextResponse.json({ success: true, data: config });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        const config = serverFallbackStore.upsertAutomationConfig({
          websiteId,
          enabled,
          researchFrequency,
          generationFrequency,
          preferredPublishingDays,
          preferredPublishingTime,
          timezone,
          maxBlogsPerWeek,
          requireHumanApproval,
        });
        return NextResponse.json({ success: true, data: config });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
