import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DbWebsiteService } from '@/services/db/website.service';
import { validateExternalUrl } from '@/services/security/url-validator';
import { getAuthenticatedUserEmail, getAuthenticatedUserId } from '@/lib/apiAuth';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { DEMO_OWNER_ID, serverFallbackStore } from '@/lib/serverFallbackStore';
import { DEMO_STUDIO_EMAIL } from '@/lib/passwordResetStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();

    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(id)) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const website = await DbWebsiteService.getWebsiteById(id);
    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: website });
  } catch (err: unknown) {
    console.error('[API /websites/[id] GET Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to load website' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    const userEmail = await getAuthenticatedUserEmail();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { name, url, niche, targetAudience, writingTone, preferredKeywords, excludedTopics } = body;

    let sanitizedUrl: string | undefined;
    if (url !== undefined) {
      sanitizedUrl = validateExternalUrl(String(url)).toString().replace(/\/$/, '');
    }

    const runFallbackPatch = async () => {
      const existing = serverFallbackStore.getWebsiteById(id);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
      }
      const isOwner =
        existing.userId === userId ||
        (existing.userId === DEMO_OWNER_ID && userEmail === DEMO_STUDIO_EMAIL);
      if (!isOwner) {
        return NextResponse.json({ success: false, error: 'Forbidden or website not found' }, { status: 403 });
      }
      const updated = serverFallbackStore.updateWebsite(id, {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(sanitizedUrl !== undefined && { url: sanitizedUrl }),
        ...(niche !== undefined && { niche: String(niche).trim() }),
        ...(targetAudience !== undefined && { targetAudience: String(targetAudience).trim() }),
        ...(writingTone !== undefined && { writingTone: String(writingTone).trim() }),
        ...(preferredKeywords !== undefined && { preferredKeywords }),
        ...(excludedTopics !== undefined && { excludedTopics }),
      });
      return NextResponse.json({ success: true, data: updated });
    };

    if (!process.env.DATABASE_URL) {
      return await runFallbackPatch();
    }

    try {
      const existing = await prisma.website.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: 'Forbidden or website not found' }, { status: 403 });
      }

      const updated = await prisma.website.update({
        where: { id },
        data: {
          ...(name !== undefined && { name: String(name).trim() }),
          ...(sanitizedUrl !== undefined && { url: sanitizedUrl }),
          ...(niche !== undefined && { niche: String(niche).trim() }),
          ...(targetAudience !== undefined && { targetAudience: String(targetAudience).trim() }),
          ...(writingTone !== undefined && { writingTone: String(writingTone).trim() }),
          ...(preferredKeywords !== undefined && { preferredKeywords }),
          ...(excludedTopics !== undefined && { excludedTopics }),
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        return await runFallbackPatch();
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith('Invalid URL') || message.startsWith('Restricted URL')) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    console.error('[API /websites/[id] PATCH Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to update website' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    const userEmail = await getAuthenticatedUserEmail();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const runFallbackDelete = () => {
      const existing = serverFallbackStore.getWebsiteById(id);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
      }
      const isOwner =
        existing.userId === userId ||
        (existing.userId === DEMO_OWNER_ID && userEmail === DEMO_STUDIO_EMAIL);
      if (!isOwner) {
        return NextResponse.json({ success: false, error: 'Forbidden or website not found' }, { status: 403 });
      }
      serverFallbackStore.deleteWebsite(id);
      return NextResponse.json({ success: true, message: 'Website deleted.' });
    };

    if (!process.env.DATABASE_URL) {
      return runFallbackDelete();
    }

    try {
      const existing = await prisma.website.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: 'Forbidden or website not found' }, { status: 403 });
      }

      await prisma.website.delete({ where: { id } });

      return NextResponse.json({ success: true, message: 'Website deleted.' });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        return runFallbackDelete();
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    console.error('[API /websites/[id] DELETE Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete website' }, { status: 500 });
  }
}
