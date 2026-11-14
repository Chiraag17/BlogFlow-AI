/**
 * WordPress CMS Publishing Adapter
 *
 * Delegates directly to the hardened WordPressService while supporting
 * typed Blog objects for legacy callers like POST /api/publish.
 */

import { Blog } from '@/types';
import { WordPressService } from '@/services/cms/wordpress.service';

export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword?: string;
}

export interface PublishOptions {
  blog: Blog;
  config: WordPressConfig;
  status: 'publish' | 'future' | 'draft';
  scheduledDate?: string;
}

export interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  wpPostId?: number;
  status: 'published' | 'scheduled' | 'failed';
  error?: string;
}

export class WordPressLegacyService {
  /**
   * Publishes or schedules an article via WordPress REST API.
   * Enforces the human-in-the-loop approval constraint and returns real API errors
   * rather than simulating success when credentials are missing or invalid.
   */
  async publishArticle(options: PublishOptions): Promise<PublishResult> {
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

  /**
   * Verifies authenticated connectivity to the target WordPress site's REST API.
   */
  async testConnection(
    config: WordPressConfig
  ): Promise<{ success: boolean; siteName?: string; error?: string }> {
    const result = await WordPressService.testConnection({
      siteUrl: config.siteUrl,
      username: config.username,
      applicationPassword: config.applicationPassword,
    });
    return {
      success: result.success,
      siteName: result.user?.name || result.siteName,
      error: result.error,
    };
  }
}

export const wordPressService = new WordPressLegacyService();
