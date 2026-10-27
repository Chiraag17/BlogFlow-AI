import { prisma } from '@/lib/prisma';
import { validateExternalUrl } from '@/services/security/url-validator';

const SAFE_CMS_INTEGRATION_SELECT = {
  id: true,
  websiteId: true,
  provider: true,
  cmsUrl: true,
  username: true,
  connectionStatus: true,
  lastConnectedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class DbWebsiteService {
  /**
   * Retrieves websites associated with the user.
   * If the authenticated user has no personal websites yet, falls back to seeded demo websites
   * so the workspace remains functional until they add their own website.
   */
  public static async getWebsites(userId?: string) {
    try {
      const includeConfig = {
        cmsIntegrations: {
          select: SAFE_CMS_INTEGRATION_SELECT,
        },
        automationConfig: true,
        _count: {
          select: { blogs: true, researchReports: true },
        },
      };

      if (userId) {
        const userWebsites = await prisma.website.findMany({
          where: { userId },
          include: includeConfig,
          orderBy: { createdAt: 'desc' },
        });

        if (userWebsites.length > 0) {
          return userWebsites;
        }

        // Demo fallback when the user has not created any personal websites yet
        return await prisma.website.findMany({
          where: {
            user: { email: 'demo@blogflow.ai' },
          },
          include: includeConfig,
          orderBy: { createdAt: 'desc' },
        });
      }

      return await prisma.website.findMany({
        where: {
          user: { email: 'demo@blogflow.ai' },
        },
        include: includeConfig,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[DbWebsiteService] Failed to fetch websites from database:', message);
      throw new Error('Database error fetching websites');
    }
  }

  /**
   * Helper to resolve the list of accessible website IDs for a given user
   * (either their own websites, or seeded demo websites if they have none yet).
   */
  public static async getAccessibleWebsiteIds(userId?: string | null): Promise<string[]> {
    const websites = await this.getWebsites(userId || undefined);
    return websites.map((w) => w.id);
  }

  public static async getWebsiteById(id: string) {
    try {
      return await prisma.website.findUnique({
        where: { id },
        include: {
          cmsIntegrations: {
            select: SAFE_CMS_INTEGRATION_SELECT,
          },
          automationConfig: true,
          blogs: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[DbWebsiteService] Failed to fetch website ${id}:`, message);
      throw new Error('Database error fetching website');
    }
  }

  public static async createWebsite(data: {
    userId?: string;
    name: string;
    url: string;
    niche: string;
    targetAudience: string;
    writingTone: string;
    preferredKeywords?: string[];
    excludedTopics?: string[];
    websiteContext?: any;
  }) {
    if (!data.userId) {
      throw new Error('Authenticated user ID is required to register a website.');
    }

    const validatedUrl = validateExternalUrl(data.url);

    try {
      return await prisma.website.create({
        data: {
          userId: data.userId,
          name: data.name.trim(),
          url: validatedUrl.toString().replace(/\/$/, ''),
          niche: data.niche.trim(),
          targetAudience: data.targetAudience.trim(),
          writingTone: data.writingTone.trim(),
          preferredKeywords: data.preferredKeywords || [],
          excludedTopics: data.excludedTopics || [],
          websiteContext: data.websiteContext || null,
          connectionStatus: 'ACTIVE',
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[DbWebsiteService] Failed to create website in database:', message);
      throw new Error('Database error creating website');
    }
  }

  public static async deleteWebsite(id: string) {
    try {
      return await prisma.website.delete({
        where: { id },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[DbWebsiteService] Failed to delete website ${id}:`, message);
      throw new Error('Database error deleting website');
    }
  }
}
