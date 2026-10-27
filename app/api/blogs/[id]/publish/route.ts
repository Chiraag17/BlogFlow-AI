import { NextRequest, NextResponse } from 'next/server';
import { WordPressService } from '@/services/cms/wordpress.service';
import { DbWebsiteService } from '@/services/db/website.service';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const userId = (await headers()).get('x-user-id') || undefined;

    // Retrieve blog with website and existing integrations
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        website: { include: { cmsIntegrations: { select: { id: true, connectionStatus: true } } } },
        approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!blog) {
      return NextResponse.json({ success: false, error: 'Article not found.' }, { status: 404 });
    }

    // Verify user ownership / accessible website
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(blog.websiteId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this website.' },
        { status: 403 }
      );
    }

    // Strict approval verification: Only approved articles can be published
    const latestApproval = blog.approvals[0];
    const isApproved =
      blog.status === 'APPROVED' ||
      blog.status === 'SCHEDULED' ||
      latestApproval?.status === 'APPROVED';

    if (!isApproved) {
      return NextResponse.json(
        {
          success: false,
          error: 'Publishing rejected: Article has not been approved in the Approval Center. Please approve the article before publishing.',
        },
        { status: 403 }
      );
    }

    // Verify integrationId belongs to this website's integrations
    const validIntegrations = blog.website.cmsIntegrations;
    let integrationId: string | undefined;

    if (body.integrationId) {
      const matched = validIntegrations.find((c) => c.id === body.integrationId);
      if (!matched) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Specified CMS integration does not belong to this website.' },
          { status: 403 }
        );
      }
      integrationId = matched.id;
    } else {
      integrationId = validIntegrations.find((c) => c.connectionStatus === 'CONNECTED')?.id;
    }

    if (!integrationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active WordPress CMS integration found for this website. Connect your WordPress site in Integrations first.',
        },
        { status: 400 }
      );
    }

    // Requirement: Initially publish articles as Draft, not directly as public posts
    const publishMode = body.publishMode === 'publish' ? 'publish' : 'draft';

    const result = await WordPressService.publishPost({
      blogId: id,
      integrationId,
      publishMode,
      scheduledDate: body.scheduledDate,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.isDuplicate
        ? 'Article was already synchronized with WordPress; record updated.'
        : `Article successfully published to WordPress as ${publishMode.toUpperCase()}!`,
      data: result,
    });
  } catch (err: unknown) {
    console.error('[API /blogs/[id]/publish POST Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to publish article' }, { status: 500 });
  }
}
