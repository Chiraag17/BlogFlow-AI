import { decryptCredential } from '../security/encryption.service';
import { validateExternalUrl } from '../security/url-validator';
import { prisma } from '@/lib/prisma';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

const REQUEST_TIMEOUT_MS = 15000;

export interface WordPressAuth {
  siteUrl: string;
  username: string;
  applicationPassword?: string;
  encryptedCredentials?: string;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressPostPayload {
  title: string;
  content: string;
  slug?: string;
  status: 'draft' | 'publish' | 'future';
  date?: string; // ISO 8601 for scheduled
  excerpt?: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}

export interface WordPressPublishResult {
  success: boolean;
  externalPostId?: string;
  publishedUrl?: string;
  status?: string;
  error?: string;
  isDuplicate?: boolean;
}

export class WordPressService {
  /**
   * Validates and normalizes WordPress site URL against SSRF and removes trailing slashes.
   */
  public static normalizeUrl(url: string): string {
    const parsed = validateExternalUrl(url);
    return parsed.toString().replace(/\/+$/, '');
  }

  /**
   * Constructs standard Basic Auth header from username and application password.
   */
  public static getBasicAuthHeader(username: string, password: string): string {
    const cleanPassword = password.replace(/\s+/g, '');
    const token = Buffer.from(`${username}:${cleanPassword}`).toString('base64');
    return `Basic ${token}`;
  }

  /**
   * Resolves plain password from either direct password or encrypted credentials.
   */
  public static resolvePassword(auth: WordPressAuth): string {
    if (auth.applicationPassword) {
      return auth.applicationPassword;
    }
    if (auth.encryptedCredentials) {
      return decryptCredential(auth.encryptedCredentials);
    }
    throw new Error('No WordPress application password or encrypted credentials configured for this integration.');
  }

  /**
   * Verifies WordPress connection by requesting /wp-json/wp/v2/users/me.
   */
  public static async testConnection(auth: WordPressAuth): Promise<{
    success: boolean;
    user?: { id: number; name: string; slug: string };
    siteName?: string;
    error?: string;
  }> {
    try {
      const normalizedUrl = this.normalizeUrl(auth.siteUrl);
      const password = this.resolvePassword(auth);
      const authHeader = this.getBasicAuthHeader(auth.username, password);

      const endpoint = `${normalizedUrl}/wp-json/wp/v2/users/me?context=edit`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'User-Agent': 'BlogFlow-AI/1.0',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return {
            success: false,
            error: 'Authentication failed. Please verify your WordPress username and Application Password.',
          };
        }
        return {
          success: false,
          error: `WordPress API responded with HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const userData = await res.json();
      return {
        success: true,
        user: {
          id: userData.id,
          name: userData.name,
          slug: userData.slug,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Could not reach WordPress site: ${message}`,
      };
    }
  }

  /**
   * Retrieves list of categories from WordPress.
   */
  public static async getCategories(auth: WordPressAuth): Promise<WordPressCategory[]> {
    const normalizedUrl = this.normalizeUrl(auth.siteUrl);
    const password = this.resolvePassword(auth);
    const authHeader = this.getBasicAuthHeader(auth.username, password);

    const endpoint = `${normalizedUrl}/wp-json/wp/v2/categories?per_page=100`;
    const res = await fetch(endpoint, {
      headers: { Authorization: authHeader, 'User-Agent': 'BlogFlow-AI/1.0' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch WordPress categories: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c.count,
    }));
  }

  /**
   * Retrieves list of tags from WordPress.
   */
  public static async getTags(auth: WordPressAuth): Promise<WordPressTag[]> {
    const normalizedUrl = this.normalizeUrl(auth.siteUrl);
    const password = this.resolvePassword(auth);
    const authHeader = this.getBasicAuthHeader(auth.username, password);

    const endpoint = `${normalizedUrl}/wp-json/wp/v2/tags?per_page=100`;
    const res = await fetch(endpoint, {
      headers: { Authorization: authHeader, 'User-Agent': 'BlogFlow-AI/1.0' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch WordPress tags: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t.count,
    }));
  }

  /**
   * Idempotency Check: Verifies whether an external post with this slug already exists.
   */
  public static async findExistingPost(
    auth: WordPressAuth,
    slug: string
  ): Promise<{ exists: boolean; postId?: number; link?: string }> {
    try {
      const normalizedUrl = this.normalizeUrl(auth.siteUrl);
      const password = this.resolvePassword(auth);
      const authHeader = this.getBasicAuthHeader(auth.username, password);

      const endpoint = `${normalizedUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&status=any`;
      const res = await fetch(endpoint, {
        headers: { Authorization: authHeader, 'User-Agent': 'BlogFlow-AI/1.0' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (res.ok) {
        const posts = await res.json();
        if (Array.isArray(posts) && posts.length > 0) {
          return {
            exists: true,
            postId: posts[0].id,
            link: posts[0].link,
          };
        }
      }
    } catch {
      // Safe fallback if remote lookup fails
    }
    return { exists: false };
  }

  /**
   * Publishes or schedules an article to WordPress.
   * Strictly enforces human approval verification before proceeding.
   */
  public static async publishPost(params: {
    blogId: string;
    integrationId: string;
    publishMode: 'publish' | 'draft' | 'schedule';
    scheduledDate?: string;
  }): Promise<WordPressPublishResult> {
    const { blogId, integrationId, publishMode, scheduledDate } = params;

    const useFallback = !process.env.DATABASE_URL;
    let blog: any = null;
    let integration: any = null;
    let usingFallbackStore = useFallback;

    if (!useFallback) {
      try {
        blog = await prisma.blog.findUnique({
          where: { id: blogId },
          include: {
            approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
            publishingRecords: { where: { integrationId } },
          },
        });
        integration = await prisma.cMSIntegration.findUnique({
          where: { id: integrationId },
        });
      } catch (dbErr) {
        if (isDatabaseUnavailableError(dbErr)) {
          usingFallbackStore = true;
        } else {
          return {
            success: false,
            error: 'Database check failed: unable to verify human approval status.',
          };
        }
      }
    }

    if (usingFallbackStore) {
      blog = serverFallbackStore.getBlogById(blogId);
      integration = serverFallbackStore.getIntegrationWithSecretById(integrationId);
    }

    if (!blog) {
      return { success: false, error: `Blog not found with ID ${blogId}` };
    }

    const latestApproval = blog.approvals?.[0];
    const isApproved =
      blog.status === 'APPROVED' ||
      blog.status === 'SCHEDULED' ||
      latestApproval?.status === 'APPROVED';

    if (!isApproved && publishMode !== 'draft') {
      return {
        success: false,
        error: 'Publishing rejected: Article has not been approved by a human reviewer in the Approval Center.',
      };
    }

    if (!integration || integration.connectionStatus !== 'CONNECTED' || integration.websiteId !== blog.websiteId) {
      return { success: false, error: 'WordPress CMS integration is inactive, mismatched, or not found.' };
    }

    if (!integration.encryptedCredentials) {
      return {
        success: false,
        error: 'No encrypted WordPress credentials stored for this integration. Connect your WordPress site with an Application Password in Integrations.',
      };
    }

    const auth: WordPressAuth = {
      siteUrl: integration.cmsUrl,
      username: integration.username,
      encryptedCredentials: integration.encryptedCredentials,
    };

    // Idempotency Check in DB/store
    const existingDbRecord = blog.publishingRecords?.find(
      (r: any) => r.integrationId === integrationId
    );
    if (existingDbRecord && existingDbRecord.publishingStatus === 'PUBLISHED' && existingDbRecord.externalPostId) {
      return {
        success: true,
        isDuplicate: true,
        externalPostId: existingDbRecord.externalPostId,
        publishedUrl: existingDbRecord.publishedUrl || undefined,
        status: 'already_published',
      };
    }

    let postStatus: 'draft' | 'publish' | 'future' = 'draft';
    if (publishMode === 'publish') postStatus = 'publish';
    if (publishMode === 'schedule') postStatus = 'future';

    const payload: WordPressPostPayload = {
      title: blog.title,
      content: blog.content,
      slug: blog.slug,
      status: postStatus,
      excerpt: blog.metaDescription || undefined,
    };

    if (postStatus === 'future' && scheduledDate) {
      payload.date = new Date(scheduledDate).toISOString();
    }

    try {
      const normalizedUrl = this.normalizeUrl(auth.siteUrl);
      const password = this.resolvePassword(auth);
      const authHeader = this.getBasicAuthHeader(auth.username, password);

      const endpoint = `${normalizedUrl}/wp-json/wp/v2/posts`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'BlogFlow-AI/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!res.ok) {
        const errorText = await res.text();
        const errMessage = `WordPress error (HTTP ${res.status}): ${errorText.slice(0, 300)}`;
        if (!usingFallbackStore) {
          await prisma.publishingRecord
            .upsert({
              where: { blogId_integrationId: { blogId, integrationId } },
              create: {
                blogId,
                integrationId,
                publishingStatus: 'FAILED',
                errorMessage: errMessage,
              },
              update: {
                publishingStatus: 'FAILED',
                errorMessage: errMessage,
              },
            })
            .catch(() => {});
        }
        return { success: false, error: errMessage };
      }

      const postData = await res.json();
      const externalId = String(postData.id);
      const postUrl = postData.link || `${normalizedUrl}/?p=${externalId}`;
      const finalStatus =
        postStatus === 'future' ? 'SCHEDULED' : postStatus === 'publish' ? 'PUBLISHED' : 'PENDING';

      if (usingFallbackStore) {
        serverFallbackStore.recordPublishFallback({
          blogId,
          integrationId,
          publishMode,
          scheduledDate,
          externalPostId: externalId,
          publishedUrl: postUrl,
        });
      } else {
        await prisma.publishingRecord.upsert({
          where: { blogId_integrationId: { blogId, integrationId } },
          create: {
            blogId,
            integrationId,
            externalPostId: externalId,
            publishedUrl: postUrl,
            publishingStatus:
              finalStatus === 'PUBLISHED'
                ? 'PUBLISHED'
                : finalStatus === 'SCHEDULED'
                ? 'SCHEDULED'
                : 'PENDING',
            publishedAt: new Date(),
            scheduledAt:
              finalStatus === 'SCHEDULED' && scheduledDate ? new Date(scheduledDate) : null,
          },
          update: {
            externalPostId: externalId,
            publishedUrl: postUrl,
            publishingStatus:
              finalStatus === 'PUBLISHED'
                ? 'PUBLISHED'
                : finalStatus === 'SCHEDULED'
                ? 'SCHEDULED'
                : 'PENDING',
            publishedAt: new Date(),
            scheduledAt:
              finalStatus === 'SCHEDULED' && scheduledDate ? new Date(scheduledDate) : null,
            errorMessage: null,
          },
        });

        await prisma.blog.update({
          where: { id: blogId },
          data: {
            status:
              finalStatus === 'PUBLISHED'
                ? 'PUBLISHED'
                : finalStatus === 'SCHEDULED'
                ? 'SCHEDULED'
                : 'APPROVED',
          },
        });
      }

      return {
        success: true,
        externalPostId: externalId,
        publishedUrl: postUrl,
        status: postStatus,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Publishing network error: ${message}` };
    }
  }

  /**
   * Publishes or schedules an article via WordPress REST API with a typed Blog model.
   * Enforces the human-in-the-loop approval constraint and validates credentials.
   */
  public static async publishLegacyArticle(options: {
    blog: import('@/types').Blog;
    config: {
      siteUrl: string;
      username: string;
      applicationPassword?: string;
    };
    status: 'publish' | 'future' | 'draft';
    scheduledDate?: string;
  }): Promise<{
    success: boolean;
    publishedUrl?: string;
    wpPostId?: number;
    status: 'published' | 'scheduled' | 'failed';
    error?: string;
  }> {
    const { blog, config, status, scheduledDate } = options;

    if (blog.status !== 'approved' && status !== 'draft') {
      return {
        success: false,
        status: 'failed',
        error: `Policy violation: Article "${blog.title}" has status "${blog.status}". Only approved articles can be published to WordPress.`,
      };
    }

    if (!config.applicationPassword || config.applicationPassword.includes('xxxx')) {
      return {
        success: false,
        status: 'failed',
        error: 'A valid WordPress Application Password is required to publish articles.',
      };
    }

    let cleanSiteUrl: string;
    try {
      cleanSiteUrl = WordPressService.normalizeUrl(config.siteUrl);
    } catch (err: unknown) {
      return {
        success: false,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      };
    }

    try {
      const authHeader = WordPressService.getBasicAuthHeader(
        config.username,
        config.applicationPassword
      );
      const endpoint = `${cleanSiteUrl}/wp-json/wp/v2/posts`;
      const payload: Record<string, any> = {
        title: blog.title,
        content: blog.content,
        slug: blog.slug,
        excerpt: blog.metaDescription,
        status,
      };

      if (status === 'future' && scheduledDate) {
        payload.date = new Date(scheduledDate).toISOString();
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
          'User-Agent': 'BlogFlow-AI/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return {
          success: false,
          status: 'failed',
          error: `WordPress API rejected publish request (HTTP ${response.status}): ${errorText.slice(0, 200) || response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        publishedUrl: data.link || `${cleanSiteUrl}/${blog.slug}`,
        wpPostId: data.id,
        status: status === 'future' ? 'scheduled' : 'published',
      };
    } catch (err: unknown) {
      return {
        success: false,
        status: 'failed',
        error: `WordPress request failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }
}
