/**
 * Website Context Analysis Service
 *
 * Implements Module 1 of the BlogFlow AI architecture.
 * Safely fetches target website content with SSRF defenses, extracts structure & semantics,
 * and feeds the content into Gemini to establish a verified website context profile.
 */

import { WebsiteAnalysis, WebsiteFormData } from '@/types';
import { geminiService } from '@/services/ai/gemini.service';
import { promptService } from '@/services/ai/prompt.service';
import { outputValidatorService } from '@/services/ai/output-validator.service';
import { validateExternalUrl } from '@/services/security/url-validator';

export interface WebsiteAnalysisInput {
  websiteId?: string;
  name: string;
  url: string;
  niche?: string;
  audience?: string;
  tone?: string;
  keywords?: string[];
  excludedTopics?: string[];
  manualContext?: string;
}

export class WebsiteAnalysisService {
  /**
   * SSRF protection: verifies that the URL uses HTTP/HTTPS and does not target internal/private/metadata hosts.
   */
  private validateUrlSafety(rawUrl: string): URL {
    return validateExternalUrl(rawUrl);
  }

  /**
   * Safely extracts text and metadata from target website homepage.
   */
  public async extractWebsiteContent(urlStr: string): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
      const validUrl = this.validateUrlSafety(urlStr);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(validUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BlogFlowAI/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: Target site returned an error (${response.statusText}).`,
        };
      }

      const html = await response.text();

      // Extract title, meta description, and paragraph text
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      const description = metaDescMatch ? metaDescMatch[1].trim() : '';

      // Strip tags to get clean content excerpts
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4500);

      const fullExtracted = `Page Title: ${title}\nMeta Description: ${description}\nContent Sample: ${textContent}`;

      return {
        success: true,
        text: fullExtracted,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Connection timed out while fetching website.' : err.message,
      };
    }
  }

  /**
   * Analyzes the website using Gemini.
   */
  public async analyzeWebsite(input: WebsiteAnalysisInput): Promise<WebsiteAnalysis> {
    let extractedText = input.manualContext || '';
    let extractionError: string | null = null;

    if (!extractedText && input.url) {
      const crawlResult = await this.extractWebsiteContent(input.url);
      if (crawlResult.success && crawlResult.text) {
        extractedText = crawlResult.text;
      } else {
        extractionError = crawlResult.error || 'Could not access website URL directly.';
      }
    }

    // If website couldn't be accessed and no manual context was supplied, report clearly
    if (!extractedText && extractionError) {
      throw new Error(
        `Unable to reach "${input.url}": ${extractionError}. Please verify the URL is public, or provide manual website context notes.`
      );
    }

    const prompt = promptService.buildWebsiteAnalysisPrompt({
      name: input.name,
      url: input.url,
      niche: input.niche,
      audience: input.audience,
      tone: input.tone,
      extractedHtmlText: extractedText,
    });

    const rawResult = await geminiService.generateStructuredJson<any>({
      prompt,
      systemInstruction: promptService.getSystemInstruction(),
      temperature: 0.3,
    });

    const analysis = outputValidatorService.validateWebsiteAnalysis(rawResult);
    if (input.websiteId) {
      analysis.websiteId = input.websiteId;
    }

    return analysis;
  }
}

export const websiteAnalysisService = new WebsiteAnalysisService();
