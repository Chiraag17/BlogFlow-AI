import { NextRequest, NextResponse } from 'next/server';
import { WordPressService } from '@/services/cms/wordpress.service';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/apiAuth';
import { DbWebsiteService } from '@/services/db/website.service';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { siteUrl, username, applicationPassword, integrationId } = body;

    let authConfig;

    if (integrationId) {
      let integration: any = null;
      if (!process.env.DATABASE_URL) {
        integration = serverFallbackStore.getIntegrationWithSecretById(integrationId);
      } else {
        try {
          integration = await prisma.cMSIntegration.findUnique({
            where: { id: integrationId },
          });
        } catch (dbErr) {
          if (isDatabaseUnavailableError(dbErr)) {
            integration = serverFallbackStore.getIntegrationWithSecretById(integrationId);
          } else {
            throw dbErr;
          }
        }
      }

      if (!integration) {
        return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 });
      }

      const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
      if (accessibleIds.length > 0 && !accessibleIds.includes(integration.websiteId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      if (!integration.encryptedCredentials) {
        return NextResponse.json(
          {
            success: false,
            error: 'No encrypted credentials stored for this integration.',
          },
          { status: 400 }
        );
      }

      authConfig = {
        siteUrl: integration.cmsUrl,
        username: integration.username,
        encryptedCredentials: integration.encryptedCredentials,
      };
    } else {
      if (!siteUrl || !username || !applicationPassword) {
        return NextResponse.json(
          { success: false, error: 'siteUrl, username, and applicationPassword are required.' },
          { status: 400 }
        );
      }
      authConfig = { siteUrl, username, applicationPassword };
    }

    const result = await WordPressService.testConnection(authConfig);

    return NextResponse.json(
      {
        success: result.success,
        data: result,
        error: result.error,
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
