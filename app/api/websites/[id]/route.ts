// app/api/websites/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { DbWebsiteService } from '@/services/db/website.service';
import { validateExternalUrl } from '@/services/security/url-validator';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = (await headers()).get('x-user-id') || undefined;

    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(id)) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const website = await prisma.website.findFirst({
      where: { id },
      include: {
        cmsIntegrations: {
          select: {
            id: true,
            websiteId: true,
            provider: true,
            cmsUrl: true,
            username: true,
            connectionStatus: true,
            lastConnectedAt: true,
            lastSyncAt: true,
            lastErrorMessage: true,
          },
        },
        automationConfig: true,
        _count: { select: { blogs: true } },
      },
    });

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
    const userId = (await headers()).get('x-user-id') || undefined;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Ensure strict ownership on mutations
    const existing = await prisma.website.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Forbidden or website not found' }, { status: 403 });
    }

    const { name, url, niche, targetAudience, writingTone, preferredKeywords, excludedTopics } = body;

    let sanitizedUrl: string | undefined;
    if (url !== undefined) {
      sanitizedUrl = validateExternalUrl(String(url)).toString().replace(/\/$/, '');
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
    const userId = (await headers()).get('x-user-id') || undefined;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure strict ownership before deleting
    const existing = await prisma.website.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Forbidden or website not found' }, { status: 403 });
    }

    await prisma.website.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Website deleted.' });
  } catch (err: unknown) {
    console.error('[API /websites/[id] DELETE Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete website' }, { status: 500 });
  }
}
