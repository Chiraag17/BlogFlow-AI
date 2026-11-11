/**
 * Specialized SEO Analysis Service
 *
 * Evaluates search engine readiness, metadata health, keyword distribution,
 * heading hierarchy, and semantic entity coverage.
 */

import { Blog } from '@/types';
import { geminiService } from '@/services/ai/gemini.service';

export interface SeoAnalysisResult {
  seoScore: number;
  titleAnalysis: {
    length: number;
    hasKeyword: boolean;
    recommendation?: string;
  };
  metaDescriptionAnalysis: {
    length: number;
    isOptimal: boolean;
    recommendation?: string;
  };
  keywordMetrics: {
    focusKeyword: string;
    occurrences: number;
    densityPercent: number;
    foundInFirst100Words: boolean;
    foundInH2: boolean;
  };
  headingStructure: {
    hasH1: boolean;
    h2Count: number;
    h3Count: number;
    status: 'good' | 'needs_improvement' | 'poor';
  };
  readabilityMetrics: {
    wordCount: number;
    readingTimeMinutes: number;
    avgSentenceWords: number;
    status: 'optimal' | 'dense' | 'short';
  };
  internalLinkingSuggestions: string[];
  actionableChecklist: {
    passed: string[];
    improvements: string[];
  };
  schemaJsonLd: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class SeoAnalysisService {
  /**
   * Computes comprehensive SEO diagnostics and Schema.org JSON-LD on an article.
   */
  public async analyzeSeo(blog: Partial<Blog>): Promise<SeoAnalysisResult> {
    const content = blog.content || '';
    const title = blog.title || '';
    const focusKeyword = (blog.focusKeyword || '').toLowerCase().trim();
    const metaTitle = blog.metaTitle || title;
    const metaDescription = blog.metaDescription || '';
    const slug =
      blog.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const words = content.trim().split(/\s+/).filter(Boolean);
    const totalWords = words.length || 1;
    const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 225));
    const sentences = content
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const avgSentenceWords = Number(
      (totalWords / Math.max(1, sentences.length)).toFixed(1)
    );
    const readabilityStatus: 'optimal' | 'dense' | 'short' =
      totalWords < 300 ? 'short' : avgSentenceWords <= 22 ? 'optimal' : 'dense';

    // Keyword metrics
    let occurrences = 0;
    let foundInFirst100Words = false;
    let foundInH2 = false;

    if (focusKeyword) {
      const lowerContent = content.toLowerCase();
      const safeRegex = new RegExp(escapeRegExp(focusKeyword), 'g');
      occurrences = (lowerContent.match(safeRegex) || []).length;

      const first100 = words.slice(0, 100).join(' ').toLowerCase();
      foundInFirst100Words = first100.includes(focusKeyword);

      const h2Matches = content.match(/^##\s+(.*)$/gm) || [];
      foundInH2 = h2Matches.some((h) => h.toLowerCase().includes(focusKeyword));
    }

    const densityPercent = Number(((occurrences / totalWords) * 100).toFixed(2));

    // Heading counts
    const h1Matches = content.match(/^#\s+(.*)$/gm) || [];
    const h2Matches = content.match(/^##\s+(.*)$/gm) || [];
    const h3Matches = content.match(/^###\s+(.*)$/gm) || [];

    const headingStatus =
      h2Matches.length >= 3 ? 'good' : h2Matches.length >= 1 ? 'needs_improvement' : 'poor';

    // Scoring calculation
    let score = 70;
    const passed: string[] = [];
    const improvements: string[] = [];

    if (metaTitle.length >= 35 && metaTitle.length <= 65) {
      score += 10;
      passed.push('Meta title length is within optimal Google display limits (35-65 chars).');
    } else {
      score -= 5;
      improvements.push(`Meta title is ${metaTitle.length} characters (aim for 45-60 characters).`);
    }

    if (metaDescription.length >= 120 && metaDescription.length <= 165) {
      score += 10;
      passed.push('Meta description length is optimal for SERP snippets (120-165 chars).');
    } else {
      score -= 5;
      improvements.push('Meta description should be between 120 and 160 characters for complete display.');
    }

    if (focusKeyword) {
      if (title.toLowerCase().includes(focusKeyword) || metaTitle.toLowerCase().includes(focusKeyword)) {
        score += 5;
        passed.push(`Focus keyword "${focusKeyword}" is present in the title.`);
      } else {
        score -= 10;
        improvements.push(`Include focus keyword "${focusKeyword}" in the article or meta title.`);
      }

      if (foundInFirst100Words) {
        score += 5;
        passed.push('Focus keyword appears in the introductory 100 words.');
      } else {
        improvements.push('Include the focus keyword in the first paragraph for stronger relevance signaling.');
      }

      if (foundInH2) {
        score += 3;
        passed.push('Focus keyword is reinforced in at least one H2 subheading.');
      } else {
        improvements.push('Include the focus keyword or a close variant in at least one H2 heading.');
      }
    }

    if (h2Matches.length >= 3) {
      score += 5;
      passed.push(`Strong hierarchical structure with ${h2Matches.length} H2 sections.`);
    } else {
      improvements.push('Add more H2 subheadings to organize distinct thematic blocks.');
    }

    // Call Gemini for targeted internal linking suggestions if content is rich
    let internalLinkingSuggestions = [
      'Link to your foundational guide on modern development practices',
      'Add reference to related case study on pipeline efficiency',
      'Include a call to action link to your product documentation or demo page',
    ];

    try {
      if (geminiService.isConfigured() && content.length > 300) {
        const prompt = `Based on this blog topic ("${title}") and focus keyword ("${focusKeyword}"), provide 3 high-relevance internal linking suggestions (topics or pages to link to).
Return JSON: { "suggestions": ["topic/anchor 1", "topic/anchor 2", "topic/anchor 3"] }`;
        const res = await geminiService.generateStructuredJson<{ suggestions: string[] }>({
          prompt,
          temperature: 0.3,
          maxOutputTokens: 500,
        });
        if (res.suggestions && res.suggestions.length > 0) {
          internalLinkingSuggestions = res.suggestions;
        }
      }
    } catch {
      // Fallback
    }

    // Build ready-to-embed Schema.org BlogPosting + FAQPage JSON-LD
    const graphEntities: Record<string, unknown>[] = [
      {
        '@type': 'BlogPosting',
        headline: metaTitle || title,
        description: metaDescription || content.slice(0, 155).trim(),
        keywords: focusKeyword || undefined,
        wordCount: totalWords,
        articleSection: blog.category || 'Editorial',
        url: `https://blogflow.ai/articles/${slug}`,
        datePublished: blog.createdAt || new Date().toISOString(),
        dateModified: new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'BlogFlow AI Editorial Studio',
        },
      },
    ];

    if (blog.faqs && blog.faqs.length > 0) {
      const validFaqs = blog.faqs.filter((f) => f.question && f.answer);
      if (validFaqs.length > 0) {
        graphEntities.push({
          '@type': 'FAQPage',
          mainEntity: validFaqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        });
      }
    }

    const schemaJsonLd = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@graph': graphEntities,
      },
      null,
      2
    );

    return {
      seoScore: Math.min(98, Math.max(35, score)),
      titleAnalysis: {
        length: metaTitle.length,
        hasKeyword: Boolean(focusKeyword && (title.toLowerCase().includes(focusKeyword) || metaTitle.toLowerCase().includes(focusKeyword))),
        recommendation: metaTitle.length > 60 ? 'Shorten to prevent truncation on mobile SERPs.' : undefined,
      },
      metaDescriptionAnalysis: {
        length: metaDescription.length,
        isOptimal: metaDescription.length >= 120 && metaDescription.length <= 165,
        recommendation: metaDescription.length < 120 ? 'Expand description with specific benefits (120-160 chars).' : undefined,
      },
      keywordMetrics: {
        focusKeyword,
        occurrences,
        densityPercent,
        foundInFirst100Words,
        foundInH2,
      },
      headingStructure: {
        hasH1: h1Matches.length > 0,
        h2Count: h2Matches.length,
        h3Count: h3Matches.length,
        status: headingStatus,
      },
      readabilityMetrics: {
        wordCount: totalWords,
        readingTimeMinutes,
        avgSentenceWords,
        status: readabilityStatus,
      },
      internalLinkingSuggestions,
      actionableChecklist: {
        passed,
        improvements,
      },
      schemaJsonLd,
    };
  }
}

export const seoAnalysisService = new SeoAnalysisService();
