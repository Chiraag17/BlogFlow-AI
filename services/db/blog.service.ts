import { prisma } from '@/lib/prisma';
import { BlogStatus, Prisma } from '@prisma/client';
import { DbWebsiteService } from '@/services/db/website.service';

export class DbBlogService {
  public static async getBlogs(params?: {
    userId?: string | null;
    websiteId?: string;
    status?: BlogStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.BlogWhereInput = {};

    const accessibleWebsiteIds = await DbWebsiteService.getAccessibleWebsiteIds(params?.userId);

    if (params?.websiteId) {
      if (accessibleWebsiteIds.length > 0 && !accessibleWebsiteIds.includes(params.websiteId)) {
        return { blogs: [], total: 0 };
      }
      where.websiteId = params.websiteId;
    } else if (accessibleWebsiteIds.length > 0) {
      where.websiteId = { in: accessibleWebsiteIds };
    }

    if (params?.status) where.status = params.status;
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
        { focusKeyword: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    try {
      const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
          where,
          include: {
            website: { select: { id: true, name: true, url: true, userId: true } },
            qualityReports: { orderBy: { createdAt: 'desc' }, take: 1 },
            approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
            publishingRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
          take: Math.min(Math.max(params?.limit || 50, 1), 100),
          skip: Math.max(params?.offset || 0, 0),
        }),
        prisma.blog.count({ where }),
      ]);

      return { blogs, total };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[DbBlogService] Database query error:', message);
      throw new Error('Failed to load blogs from database');
    }
  }

  public static async getBlogById(id: string) {
    try {
      return await prisma.blog.findUnique({
        where: { id },
        include: {
          website: true,
          researchReport: true,
          qualityReports: { orderBy: { createdAt: 'desc' } },
          approvals: { orderBy: { createdAt: 'desc' } },
          publishingRecords: {
            include: {
              integration: {
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
            },
          },
          workflowExecutions: { orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[DbBlogService] Failed to load blog ${id}:`, message);
      throw new Error('Database error loading blog');
    }
  }

  public static async updateBlog(id: string, data: {
    title?: string;
    subtitle?: string | null;
    slug?: string;
    content?: string;
    introduction?: string | null;
    conclusion?: string | null;
    faqs?: any;
    metaTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    secondaryKeywords?: any;
    tags?: any;
    category?: string | null;
    estimatedReadingTime?: number;
    status?: BlogStatus;
  }) {
    try {
      return await prisma.blog.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.error('[DbBlogService] Blog update failed:', err);
      throw err;
    }
  }

  public static async updateBlogStatus(id: string, status: BlogStatus) {
    try {
      return await prisma.blog.update({
        where: { id },
        data: { status },
      });
    } catch (err) {
      console.error('[DbBlogService] Status update failed:', err);
      throw err;
    }
  }

  public static async createBlog(data: {
    websiteId: string;
    title: string;
    subtitle?: string | null;
    slug?: string;
    content: string;
    introduction?: string | null;
    conclusion?: string | null;
    faqs?: any;
    metaTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    secondaryKeywords?: any;
    tags?: any;
    category?: string | null;
    estimatedReadingTime?: number;
    status?: BlogStatus;
    researchReportId?: string | null;
  }) {
    try {
      const generatedSlug =
        data.slug ||
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') +
          '-' +
          Date.now().toString(36);

      return await prisma.blog.create({
        data: {
          ...data,
          slug: generatedSlug,
          ...(data.status === 'PENDING_APPROVAL'
            ? {
                approvals: {
                  create: {
                    status: 'PENDING',
                    comments: 'Submitted for editorial review and approval.',
                  },
                },
              }
            : {}),
        },
        include: {
          website: true,
          researchReport: true,
          approvals: true,
        },
      });
    } catch (err) {
      console.error('[DbBlogService] Blog creation failed:', err);
      throw err;
    }
  }
}
