import { NextRequest, NextResponse } from 'next/server';
import { DbBlogService } from '@/services/db/blog.service';
import { DbWebsiteService } from '@/services/db/website.service';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const userId = (await headers()).get('x-user-id') || undefined;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const websiteId = searchParams.get('websiteId') || undefined;

    const data = await DbBlogService.getBlogs({
      userId,
      search,
      status,
      websiteId,
    });

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('[API /blogs GET Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to load blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = (await headers()).get('x-user-id') || undefined;
    const body = await req.json();
    const {
      websiteId,
      title,
      subtitle,
      slug,
      content,
      introduction,
      conclusion,
      faqs,
      metaTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      tags,
      category,
      estimatedReadingTime,
      status,
      researchReportId,
    } = body;

    if (!websiteId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: websiteId, title, content' },
        { status: 400 }
      );
    }

    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(websiteId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have access to this website' },
        { status: 403 }
      );
    }

    // Prevent direct creation of APPROVED/PUBLISHED blogs to enforce governance
    const allowedInitialStatus = status === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : 'DRAFT';

    const blog = await DbBlogService.createBlog({
      websiteId,
      title,
      subtitle,
      slug,
      content,
      introduction,
      conclusion,
      faqs,
      metaTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      tags,
      category,
      estimatedReadingTime: estimatedReadingTime || 5,
      status: allowedInitialStatus,
      researchReportId,
    });

    return NextResponse.json({
      success: true,
      message: 'Article successfully saved to PostgreSQL database.',
      data: blog,
    });
  } catch (err: unknown) {
    console.error('[API /blogs POST Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to save article' }, { status: 500 });
  }
}

