import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptCredential } from '@/services/security/encryption.service';
import { WordPressService } from '@/services/cms/wordpress.service';
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
        data: serverFallbackStore.getIntegrations(userId),
      });
    }

    try {
      const integrations = await prisma.cMSIntegration.findMany({
        where: accessibleIds.length > 0 ? { websiteId: { in: accessibleIds } } : {},
        select: {
          id: true,
          websiteId: true,
          provider: true,
          cmsUrl: true,
          username: true,
          connectionStatus: true,
          lastConnectedAt: true,
          createdAt: true,
          website: { select: { id: true, name: true, url: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: integrations });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        return NextResponse.json({
          success: true,
          data: serverFallbackStore.getIntegrations(userId),
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

    const { websiteId, cmsUrl, username, applicationPassword } = body;

    if (!websiteId || !cmsUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: websiteId, cmsUrl, username, applicationPassword' },
        { status: 400 }
      );
    }

    let normalizedUrl: string;
    try {
      normalizedUrl = WordPressService.normalizeUrl(cmsUrl.trim());
    } catch (urlErr: unknown) {
      const msg = urlErr instanceof Error ? urlErr.message : 'Invalid WordPress site URL.';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    // Verify website exists and user has access
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    const website = await DbWebsiteService.getWebsiteById(websiteId);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Target website not found.' }, { status: 404 });
    }

    if (accessibleIds.length > 0 && !accessibleIds.includes(websiteId)) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not own this website.' }, { status: 403 });
    }

    // 1. Test WordPress authentication and connection before storing
    const test = await WordPressService.testConnection({
      siteUrl: normalizedUrl,
      username,
      applicationPassword,
    });

    if (!test.success) {
      return NextResponse.json(
        { success: false, error: `WordPress verification failed: ${test.error}` },
        { status: 400 }
      );
    }

    // 2. Encrypt credentials at rest using AES-256-GCM
    const encryptedCredentials = encryptCredential(applicationPassword);

    if (!process.env.DATABASE_URL) {
      const integration = serverFallbackStore.createIntegration({
        websiteId,
        cmsUrl: normalizedUrl,
        username,
        encryptedCredentials,
      });
      return NextResponse.json({
        success: true,
        message: 'WordPress website connected and verified successfully!',
        data: integration,
      });
    }

    try {
      const integration = await prisma.cMSIntegration.create({
        data: {
          websiteId,
          provider: 'WORDPRESS',
          cmsUrl: normalizedUrl,
          username,
          encryptedCredentials,
          connectionStatus: 'CONNECTED',
          lastConnectedAt: new Date(),
        },
        select: {
          id: true,
          websiteId: true,
          provider: true,
          cmsUrl: true,
          username: true,
          connectionStatus: true,
          lastConnectedAt: true,
          createdAt: true,
          website: { select: { id: true, name: true, url: true } },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'WordPress website connected and verified successfully!',
        data: integration,
      });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        const integration = serverFallbackStore.createIntegration({
          websiteId,
          cmsUrl: normalizedUrl,
          username,
          encryptedCredentials,
        });
        return NextResponse.json({
          success: true,
          message: 'WordPress website connected and verified successfully!',
          data: integration,
        });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
