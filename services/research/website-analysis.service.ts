/**
 * Website Context Analysis Service
 *
 * Implements Module 1 of the BlogFlow AI architecture.
 * Safely fetches target website content with SSRF defenses, extracts structure & semantics,
 * and feeds the content into Gemini 4 (or resilient profile synthesis fallback).
 */

import { WebsiteAnalysis } from '@/types';
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
  private validateUrlSafety(rawUrl: string): URL {
    return validateExternalUrl(rawUrl);
  }

  public async extractWebsiteContent(urlStr: string): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
      const validUrl = this.validateUrlSafety(urlStr);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(validUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogFlowAI/1.0)',
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
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      const description = metaDescMatch ? metaDescMatch[1].trim() : '';

      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4500);

      return {
        success: true,
        text: `Page Title: ${title}\nMeta Description: ${description}\nContent Sample: ${textContent}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Connection timed out while fetching website.' : err.message,
      };
    }
  }

  public async analyzeWebsite(input: WebsiteAnalysisInput): Promise<WebsiteAnalysis> {
    if (input.url) {
      this.validateUrlSafety(input.url);
    }

    let extractedText = input.manualContext || '';
    if (!extractedText && input.url) {
      const crawlResult = await this.extractWebsiteContent(input.url);
      if (crawlResult.success && crawlResult.text) {
        extractedText = crawlResult.text;
      }
    }

    if (geminiService.isConfigured() && (extractedText || input.name)) {
      try {
        const prompt = promptService.buildWebsiteAnalysisPrompt({
          name: input.name,
          url: input.url,
          niche: input.niche,
          audience: input.audience,
          tone: input.tone,
          extractedHtmlText:
            extractedText ||
            `Website: ${input.name} (${input.url})\nNiche: ${input.niche || 'General'}\nAudience: ${input.audience || 'General Audience'}`,
        });

        const rawResult = await geminiService.generateStructuredJson<any>({
          prompt,
          systemInstruction: promptService.getSystemInstruction(),
        });

        const analysis = outputValidatorService.validateWebsiteAnalysis(rawResult);
        if (input.websiteId) analysis.websiteId = input.websiteId;
        return analysis;
      } catch (err) {
        console.warn('[WebsiteAnalysisService] Gemini fallback synthesis active:', err);
      }
    }

    const niche = input.niche || 'Technology & Digital Strategy';
    const audience = input.audience || 'Practitioners, founders, and informed readers';
    const analysis = outputValidatorService.validateWebsiteAnalysis({
      websiteId: input.websiteId || 'web-temp',
      detectedNiche: niche,
      targetAudience: audience,
      existingContentSummary: extractedText
        ? `Analyzed site profile for ${input.name}: ${extractedText.slice(0, 280)}`
        : `Registered editorial profile for ${input.name} (${input.url}) covering ${niche}.`,
      writingStyle: `${input.tone || 'Professional'}, structured with clear headings, practical examples, and search-aligned summaries.`,
      contentOpportunities: [
        `Comprehensive ${niche} pillar guides and comparison benchmarks`,
        `Step-by-step implementation tutorials tailored for ${audience}`,
        `Common ${niche} troubleshooting checklists and FAQ hubs`,
        `Emerging workflow automation and tooling deep dives`,
      ],
    });

    if (input.websiteId) {
      analysis.websiteId = input.websiteId;
    }

    return analysis;
  }
}

export const websiteAnalysisService = new WebsiteAnalysisService();
