import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/apiAuth';
import { DbWebsiteService } from '@/services/db/website.service';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);

    if (!process.env.DATABASE_URL) {
      const target = serverFallbackStore.getAutomationConfigByIdOrWebsiteId(id);
      if (!target) {
        return NextResponse.json({ success: false, error: 'Automation config not found' }, { status: 404 });
      }
      if (accessibleIds.length > 0 && !accessibleIds.includes(target.websiteId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      const count = serverFallbackStore.setAutomationEnabled(id, false);
      return NextResponse.json({
        success: true,
        message: 'Automation schedule paused.',
        data: { count },
      });
    }

    try {
      const target = await prisma.automationConfig.findFirst({
        where: { OR: [{ id }, { websiteId: id }] },
      });
      if (!target) {
        return NextResponse.json({ success: false, error: 'Automation config not found' }, { status: 404 });
      }
      if (accessibleIds.length > 0 && !accessibleIds.includes(target.websiteId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      const config = await prisma.automationConfig.updateMany({
        where: { OR: [{ id }, { websiteId: id }] },
        data: { enabled: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Automation schedule paused.',
        data: config,
      });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        const count = serverFallbackStore.setAutomationEnabled(id, false);
        return NextResponse.json({
          success: true,
          message: 'Automation schedule paused.',
          data: { count },
        });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
