import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/apiAuth';
import { DbWebsiteService } from '@/services/db/website.service';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);

    if (!process.env.DATABASE_URL) {
      const existing = serverFallbackStore.getIntegrationWithSecretById(id);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 });
      }
      if (accessibleIds.length > 0 && !accessibleIds.includes(existing.websiteId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      serverFallbackStore.deleteIntegration(id);
      return NextResponse.json({
        success: true,
        message: `Integration ${id} disconnected successfully.`,
      });
    }

    try {
      const existing = await prisma.cMSIntegration.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 });
      }
      if (accessibleIds.length > 0 && !accessibleIds.includes(existing.websiteId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      await prisma.cMSIntegration.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: `Integration ${id} disconnected successfully.`,
      });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        serverFallbackStore.deleteIntegration(id);
        return NextResponse.json({
          success: true,
          message: `Integration ${id} disconnected successfully.`,
        });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
