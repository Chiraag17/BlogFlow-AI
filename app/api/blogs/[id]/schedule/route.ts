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

    if (!body.scheduledDate) {
      return NextResponse.json(
        { success: false, error: 'A scheduled publication date (ISO 8601 string) is required.' },
        { status: 400 }
      );
    }

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

    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(blog.websiteId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this website.' },
        { status: 403 }
      );
    }

    const latestApproval = blog.approvals[0];
    const isApproved =
      blog.status === 'APPROVED' ||
      blog.status === 'SCHEDULED' ||
      latestApproval?.status === 'APPROVED';

    if (!isApproved) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheduling rejected: Article has not been approved in the Approval Center.',
        },
        { status: 403 }
      );
    }

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
        { success: false, error: 'No active WordPress CMS integration found for this website.' },
        { status: 400 }
      );
    }

    const result = await WordPressService.publishPost({
      blogId: id,
      integrationId,
      publishMode: 'schedule',
      scheduledDate: body.scheduledDate,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Article scheduled for publication on ${body.scheduledDate}`,
      data: result,
    });
  } catch (err: unknown) {
    console.error('[API /blogs/[id]/schedule POST Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to schedule article' }, { status: 500 });
  }
}
