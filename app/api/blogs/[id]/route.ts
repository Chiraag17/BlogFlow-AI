import { NextRequest, NextResponse } from 'next/server';
import { DbBlogService } from '@/services/db/blog.service';
import { DbWebsiteService } from '@/services/db/website.service';
import { calculateReadingTime } from '@/lib/utils';
import { headers } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = (await headers()).get('x-user-id') || undefined;
    const blog = await DbBlogService.getBlogById(id);

    if (!blog) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(blog.websiteId)) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not have access to this article' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (err: unknown) {
    console.error('[API /blogs/[id] GET Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to load blog' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingBlog = await DbBlogService.getBlogById(id);
    if (!existingBlog) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const userId = (await headers()).get('x-user-id') || undefined;
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(existingBlog.websiteId)) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not own this website' }, { status: 403 });
    }

    // Prevent arbitrary elevation to APPROVED or PUBLISHED via PUT
    let targetStatus = existingBlog.status;
    if (body.status !== undefined) {
      const requestedStatus = String(body.status);
      if (requestedStatus === 'DRAFT' || requestedStatus === 'PENDING_APPROVAL') {
        targetStatus = requestedStatus as any;
      } else if (requestedStatus === existingBlog.status) {
        targetStatus = existingBlog.status;
      }
    }

    const content = body.content !== undefined ? body.content : existingBlog.content;
    const readingTime = content ? calculateReadingTime(content) : existingBlog.estimatedReadingTime;

    const updatedBlog = await DbBlogService.updateBlog(id, {
      title: body.title !== undefined ? body.title : existingBlog.title,
      subtitle: body.subtitle !== undefined ? body.subtitle : existingBlog.subtitle,
      slug: body.slug !== undefined ? body.slug : existingBlog.slug,
      content,
      introduction: body.introduction !== undefined ? body.introduction : existingBlog.introduction,
      conclusion: body.conclusion !== undefined ? body.conclusion : existingBlog.conclusion,
      faqs: body.faqs !== undefined ? body.faqs : (existingBlog.faqs as any),
      metaTitle: body.metaTitle !== undefined ? body.metaTitle : existingBlog.metaTitle,
      metaDescription: body.metaDescription !== undefined ? body.metaDescription : existingBlog.metaDescription,
      focusKeyword: body.focusKeyword !== undefined ? body.focusKeyword : existingBlog.focusKeyword,
      secondaryKeywords: body.secondaryKeywords !== undefined ? body.secondaryKeywords : (existingBlog.secondaryKeywords as any),
      tags: body.tags !== undefined ? body.tags : (existingBlog.tags as any),
      category: body.category !== undefined ? body.category : existingBlog.category,
      estimatedReadingTime: readingTime,
      status: targetStatus,
    });

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully in PostgreSQL.',
      data: updatedBlog,
    });
  } catch (err: unknown) {
    console.error('[API /blogs/[id] PUT Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to update article' }, { status: 500 });
  }
}
