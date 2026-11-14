import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WordPressService } from '@/services/cms/wordpress.service';
import { getAuthenticatedUserId } from '@/lib/apiAuth';
import { DbWebsiteService } from '@/services/db/website.service';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);

    let integration: any = null;
    if (!process.env.DATABASE_URL) {
      integration = serverFallbackStore.getIntegrationWithSecretById(id);
    } else {
      try {
        integration = await prisma.cMSIntegration.findUnique({ where: { id } });
      } catch (dbErr) {
        if (isDatabaseUnavailableError(dbErr)) {
          integration = serverFallbackStore.getIntegrationWithSecretById(id);
        } else {
          throw dbErr;
        }
      }
    }

    if (!integration) {
      return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 });
    }

    if (accessibleIds.length > 0 && !accessibleIds.includes(integration.websiteId)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (!integration.encryptedCredentials) {
      return NextResponse.json(
        { success: false, error: 'No WordPress credentials stored for this integration.' },
        { status: 400 }
      );
    }

    const categories = await WordPressService.getCategories({
      siteUrl: integration.cmsUrl,
      username: integration.username,
      encryptedCredentials: integration.encryptedCredentials,
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
