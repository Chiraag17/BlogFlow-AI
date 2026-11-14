/**
 * Gemini AI Content Generation Adapter
 *
 * Delegates live blog drafting to BlogGenerationService (powered by Gemini 4)
 * when GEMINI_API_KEY is configured, and gracefully falls back to structured drafting
 * when running without external AI credentials.
 */

import { BlogGenerationFormData, BlogFAQ, BlogImageSuggestion } from '@/types';
import { geminiService as coreGeminiService } from '@/services/ai/gemini.service';
import { blogGenerationService } from '@/services/content/blog-generation.service';

export interface GeneratedBlogResponse {
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  category: string;
  tags: string[];
  faqs: BlogFAQ[];
  imageSuggestions: BlogImageSuggestion[];
  wordCount: number;
  readingTime: number;
}

export class GeminiContentAdapter {
  /**
   * Generates a complete, structured blog article.
   * Uses live Gemini 4 generation when configured, or falls back to structured drafting.
   */
  async generateBlog(
    params: BlogGenerationFormData,
    researchContext?: { sources: string[]; insights: string[] }
  ): Promise<GeneratedBlogResponse> {
    const focusKeyword = params.primaryKeywords?.[0] || params.topic;
    const secondaryKeywords = params.secondaryKeywords || [];

    if (coreGeminiService.isConfigured()) {
      try {
        const structured = await blogGenerationService.generateCompleteBlog(params, {
          id: `rep-${Date.now()}`,
          topic: params.topic,
          overview: `Research context for ${params.topic}`,
          keyInsights: researchContext?.insights || [],
          importantFacts: [],
          differentPerspectives: [],
          subtopics: [],
          suggestedHeadings: [],
          keywords: [focusKeyword, ...secondaryKeywords],
          sources: (researchContext?.sources || []).map((url) => ({
            title: url,
            url,
            publishedDate: null,
            relevance: 'High',
            summary: '',
          })),
          createdAt: new Date().toISOString(),
        });

        return {
          title: structured.title,
          subtitle: structured.subtitle,
          slug: structured.slug,
          content: structured.fullMarkdown,
          metaTitle: structured.seo.metaTitle,
          metaDescription: structured.seo.metaDescription,
          focusKeyword: structured.seo.focusKeyword,
          secondaryKeywords: structured.seo.secondaryKeywords,
          category: params.category || 'General',
          tags: [params.category, ...(params.primaryKeywords || []), ...secondaryKeywords]
            .filter(Boolean)
            .slice(0, 5),
          faqs: structured.faqs,
          imageSuggestions: [
            {
              description: `Hero editorial visual illustrating ${focusKeyword}`,
              altText: `${structured.title} overview diagram`,
              placement: 'Directly beneath the Introduction section',
            },
          ],
          wordCount: structured.wordCount,
          readingTime: structured.estimatedReadingTime,
        };
      } catch (err) {
        console.warn('[GeminiContentAdapter] Live generation failed, using structured fallback:', err);
      }
    }

    const slug = params.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const title = `${params.topic}: Complete Practical Guide & Best Practices`;
    const subtitle = `Actionable strategies, implementation frameworks, and proven insights tailored for ${params.targetAudience}.`;

    const content = `# ${title}

${subtitle}

## Introduction

As teams and creators seek stronger organic reach and operational consistency, mastering **${focusKeyword}** has become an essential capability. In this guide, we break down actionable principles, structured workflows, and real-world considerations tailored specifically for ${params.targetAudience}.

## Core Principles of ${focusKeyword}

Effective implementation hinges on three pillars:

1. **Strategic Alignment**: Connecting every piece of content directly to measurable audience intent and topical authority.
2. **Structured Workflow Automation**: Removing repetitive research and formatting bottlenecks without sacrificing editorial standards.
3. **Continuous Quality Verification**: Validating clarity, factual grounding, and on-page SEO before publication.

## Step-by-Step Implementation Framework

### Phase 1: Discovery and Topic Intelligence
Gather real-time insights on reader questions, semantic entities, and SERP gaps before drafting a single paragraph.

### Phase 2: Modular Outlining & Drafting
Structure every article cleanly using clear H2 themes and focused H3 breakdowns for high skimmability.

### Phase 3: SEO Alignment & Editorial Review
Verify that **${focusKeyword}** appears naturally in the title, introduction, and primary headings, supported by related terms such as *${secondaryKeywords.join(', ') || 'strategy, optimization, and workflow'}*.

## Common Pitfalls to Avoid

- **Generic Summaries**: Ground claims in clear steps, concrete benchmarks, and domain nuance.
- **Mismatched Tone**: Calibrate technical depth to match ${params.targetAudience}.
- **Skipping Human Review**: Always inspect readability and factual claims before publishing live.

## Conclusion

Building a sustainable **${params.topic}** workflow combines structured planning with consistent editorial standards. Use the framework above as your repeatable blueprint.`;

    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const faqs: BlogFAQ[] = [
      {
        question: `Why is ${focusKeyword} important for ${params.targetAudience}?`,
        answer: `It improves editorial consistency, accelerates content turnaround, and helps address high-intent reader queries systematically.`,
      },
      {
        question: `How often should ${params.category || 'core'} articles be refreshed?`,
        answer: `Audit flagship articles every 3 to 6 months to keep benchmarks, references, and recommendations current.`,
      },
      {
        question: `Does automated drafting replace human editors?`,
        answer: `No. AI accelerates research and first drafts while human editors own voice, accuracy, and final publishing approval.`,
      },
    ];

    const imageSuggestions: BlogImageSuggestion[] = [
      {
        description: `Workflow architecture diagram illustrating ${focusKeyword}`,
        altText: `Diagram detailing the step-by-step lifecycle for ${focusKeyword}`,
        placement: 'Directly beneath the Introduction section',
      },
    ];

    return {
      title,
      subtitle,
      slug,
      content,
      metaTitle: `${params.topic} | Complete Guide & Best Practices`.slice(0, 60),
      metaDescription: `Discover practical strategies and workflows for mastering ${focusKeyword}, tailored for ${params.targetAudience}.`.slice(0, 160),
      focusKeyword,
      secondaryKeywords,
      category: params.category || 'General',
      tags: [params.category, ...(params.primaryKeywords || []), ...secondaryKeywords]
        .filter(Boolean)
        .slice(0, 5),
      faqs,
      imageSuggestions,
      wordCount: words,
      readingTime,
    };
  }
}

export const geminiService = new GeminiContentAdapter();
