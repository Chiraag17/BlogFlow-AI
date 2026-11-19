import { NextRequest, NextResponse } from 'next/server';
import { WordPressService } from '@/services/cms/wordpress.service';
import { DbBlogService } from '@/services/db/blog.service';
import { DbWebsiteService } from '@/services/db/website.service';
import { validateExternalUrl } from '@/services/security/url-validator';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { action, blog, config, status, scheduledDate } = body;

    if (config?.siteUrl) {
      try {
        validateExternalUrl(String(config.siteUrl));
      } catch (urlErr: unknown) {
        const msg = urlErr instanceof Error ? urlErr.message : 'Invalid site URL';
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    if (action === 'test_connection') {
      if (!config?.siteUrl || !config?.username || !config?.applicationPassword) {
        return NextResponse.json(
          { error: 'Missing WordPress site URL, username, or application password.' },
          { status: 400 }
        );
      }
      const conn = await WordPressService.testConnection(config);
      return NextResponse.json(conn, { status: conn.success ? 200 : 400 });
    }

    if (!blog || !config) {
      return NextResponse.json(
        { error: 'Missing blog or WordPress configuration' },
        { status: 400 }
      );
    }

    const requestedStatus = status || 'publish';
    const userId = await getAuthenticatedUserId();

    if (!blog.id) {
      return NextResponse.json(
        { error: 'Blog ID is required for publishing verification.' },
        { status: 400 }
      );
    }

    const dbBlog = await DbBlogService.getBlogById(String(blog.id));
    if (!dbBlog) {
      return NextResponse.json(
        { error: 'Blog not found in database.' },
        { status: 404 }
      );
    }

    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    if (accessibleIds.length > 0 && !accessibleIds.includes(dbBlog.websiteId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this website.' },
        { status: 403 }
      );
    }

    const latestApproval = dbBlog.approvals?.[0];
    const isDbApproved =
      dbBlog.status === 'APPROVED' ||
      dbBlog.status === 'SCHEDULED' ||
      latestApproval?.status === 'APPROVED';

    if (requestedStatus !== 'draft' && !isDbApproved) {
      return NextResponse.json(
        {
          error: `Policy violation: Article "${dbBlog.title}" has status "${dbBlog.status}". Only approved articles can be published to WordPress.`,
        },
        { status: 403 }
      );
    }

    const verifiedBlog = {
      ...blog,
      title: dbBlog.title,
      content: dbBlog.content,
      slug: dbBlog.slug,
      metaDescription: dbBlog.metaDescription || blog.metaDescription || '',
      status: isDbApproved ? ('approved' as const) : ('draft' as const),
    };

    const result = await WordPressService.publishLegacyArticle({
      blog: verifiedBlog,
      config,
      status: requestedStatus,
      scheduledDate,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[WordPress Publish API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to publish to WordPress' },
      { status: 500 }
    );
  }
}
