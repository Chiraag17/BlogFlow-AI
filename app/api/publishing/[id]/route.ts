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

    let record: any = null;
    if (!process.env.DATABASE_URL) {
      record = serverFallbackStore.getPublishingRecordById(id);
    } else {
      try {
        record = await prisma.publishingRecord.findUnique({
          where: { id },
          include: {
            blog: true,
            integration: { select: { id: true, provider: true, cmsUrl: true, username: true } },
          },
        });
      } catch (dbErr) {
        if (isDatabaseUnavailableError(dbErr)) {
          record = serverFallbackStore.getPublishingRecordById(id);
        } else {
          throw dbErr;
        }
      }
    }

    if (!record) {
      return NextResponse.json({ success: false, error: 'Publishing record not found' }, { status: 404 });
    }

    if (record.blog && accessibleIds.length > 0 && !accessibleIds.includes(record.blog.websiteId)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);

    let record: any = null;
    if (!process.env.DATABASE_URL) {
      record = serverFallbackStore.getPublishingRecordById(id);
    } else {
      try {
        record = await prisma.publishingRecord.findUnique({
          where: { id },
          include: {
            blog: {
              include: {
                approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
              },
            },
            integration: true,
          },
        });
      } catch (dbErr) {
        if (isDatabaseUnavailableError(dbErr)) {
          record = serverFallbackStore.getPublishingRecordById(id);
        } else {
          throw dbErr;
        }
      }
    }

    if (!record || !record.blog) {
      return NextResponse.json({ success: false, error: 'Publishing record not found.' }, { status: 404 });
    }

    if (accessibleIds.length > 0 && !accessibleIds.includes(record.blog.websiteId)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const latestApproval = record.blog.approvals?.[0];
    const isApproved =
      record.blog.status === 'APPROVED' ||
      record.blog.status === 'SCHEDULED' ||
      latestApproval?.status === 'APPROVED';

    if (!isApproved) {
      return NextResponse.json(
        { success: false, error: 'Cannot retry publishing: Article must be approved in the Approval Center.' },
        { status: 403 }
      );
    }

    const result = await WordPressService.publishPost({
      blogId: record.blogId,
      integrationId: record.integrationId,
      publishMode: 'draft',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Retry publishing failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Publishing retry succeeded! Draft created on WordPress.',
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
