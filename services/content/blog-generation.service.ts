/**
 * AI Blog Generation Agent Service
 *
 * Implements Module 4 of the BlogFlow AI architecture.
 * Transforms research reports and website context into publication-ready,
 * SEO-optimized blog articles with graceful structured fallback when GEMINI_API_KEY is absent.
 */

import {
  BlogGenerationFormData,
  BlogOutline,
  StructuredBlogOutput,
  DetailedResearchReport,
} from '@/types';
import { geminiService } from '@/services/ai/gemini.service';
import { promptService } from '@/services/ai/prompt.service';
import { outputValidatorService } from '@/services/ai/output-validator.service';

export interface GenerationStatusItem {
  id: string;
  stage:
    | 'initializing'
    | 'analyzing_research'
    | 'creating_outline'
    | 'writing_article'
    | 'generating_faqs_seo'
    | 'completed'
    | 'failed';
  progress: number;
  output?: StructuredBlogOutput;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const generationStatusMap = new Map<string, GenerationStatusItem>();

export class BlogGenerationService {
  public getGenerationStatus(id: string): GenerationStatusItem | undefined {
    return generationStatusMap.get(id);
  }

  private buildFallbackOutline(
    topic: string,
    audience: string,
    tone: string
  ): BlogOutline {
    return outputValidatorService.validateBlogOutline(
      {
        title: `${topic}: Complete Guide & Best Practices`,
        angle: `Actionable ${tone} playbook crafted for ${audience}`,
        targetAudience: audience,
        estimatedWordCount: 1500,
        sections: [
          {
            heading: `Understanding ${topic}`,
            intent: 'Establish foundational concepts and why this topic matters now',
            subheadings: ['Core Concepts', 'Key Drivers & Industry Shift'],
            keyPoints: ['Clear definition', 'Measurable impact on workflows'],
          },
          {
            heading: `Step-by-Step Implementation Framework`,
            intent: 'Provide a practical, repeatable blueprint for readers',
            subheadings: ['Discovery & Planning', 'Execution & Quality Verification'],
            keyPoints: ['Practical checklist', 'Common trade-offs to evaluate'],
          },
          {
            heading: `Common Pitfalls & Optimization Tips`,
            intent: 'Help readers avoid frequent mistakes and scale effectively',
            subheadings: ['Structural & SEO Mistakes', 'Continuous Iteration Loop'],
            keyPoints: ['Proactive QA metrics', 'Human editorial oversight'],
          },
        ],
      },
      topic
    );
  }

  private buildFallbackStructuredBlog(
    params: BlogGenerationFormData,
    outline: BlogOutline,
    researchReport?: DetailedResearchReport
  ): StructuredBlogOutput {
    const focusKeyword = params.primaryKeywords?.[0] || params.topic;
    const secondaryKeywords = params.secondaryKeywords || [];
    const insights = researchReport?.keyInsights || [
      'Structured workflows accelerate publishing cadence without sacrificing depth.',
      'Combining search-intent alignment with clear heading hierarchy improves organic discoverability.',
    ];

    const rawFallback = {
      title: outline.title,
      subtitle: `A practical, search-optimized breakdown of ${params.topic} for ${params.targetAudience}`,
      slug: params.topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      introduction: `Mastering **${focusKeyword}** has become essential for ${params.targetAudience}. In this guide, we examine the core fundamentals, implementation blueprint, and quality checks needed to deliver measurable results.`,
      sections: [
        {
          heading: `Why ${focusKeyword} Matters for ${params.targetAudience}`,
          content: `Teams adopting structured ${focusKeyword} practices consistently outperform ad-hoc workflows. Key findings include:\n\n- ${insights.join('\n- ')}`,
          subheadings: [
            {
              heading: 'Strategic Foundations',
              content: `Aligning your editorial and technical workflow ensures every initiative built around ${focusKeyword} directly supports audience trust and organic visibility.`,
            },
          ],
        },
        {
          heading: `Implementation Blueprint for ${params.topic}`,
          content: `A reliable rollout follows three distinct stages: discovery, modular execution, and human quality review.`,
          subheadings: [
            {
              heading: 'Phase 1: Research & Entity Alignment',
              content: `Capture real-world reader questions and map primary keyword **${focusKeyword}** alongside supporting terms (${secondaryKeywords.join(', ') || 'strategy, architecture, workflow'}).`,
            },
            {
              heading: 'Phase 2: Drafting & Review',
              content: `Maintain clear H2/H3 section breaks, concise paragraphs, and verifiable citations before pushing content into production.`,
            },
          ],
        },
        {
          heading: 'Pitfalls to Avoid & Editorial Best Practices',
          content: `Avoid thin generic summaries, keyword stuffing, or skipping human-in-the-loop quality checks. Always confirm factual claims and metadata lengths prior to publishing.`,
          subheadings: [],
        },
      ],
      conclusion: `Establishing a disciplined **${params.topic}** workflow gives ${params.targetAudience} a durable advantage. Apply the framework above and refine continuously based on audience engagement.`,
      faqs: [
        {
          question: `What is the biggest benefit of focusing on ${focusKeyword}?`,
          answer: `It delivers higher content consistency, clearer search relevance, and faster turnaround from research to published article.`,
        },
        {
          question: `How can teams ensure quality at scale?`,
          answer: `Pair automated SEO/readability checks with human editorial approval checkpoints before publishing.`,
        },
      ],
      seo: {
        metaTitle: `${params.topic} | Complete Guide & Best Practices`.slice(0, 60),
        metaDescription: `Learn how ${params.targetAudience} can implement ${focusKeyword} effectively with proven steps, FAQs, and SEO best practices.`.slice(0, 160),
        focusKeyword,
        secondaryKeywords,
        suggestedSlug: params.topic
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      },
      sources: researchReport?.sources?.map((s) => s.url) || [],
    };

    return outputValidatorService.validateStructuredBlog(rawFallback, params.topic);
  }

  public async generateOutline(
    topic: string,
    audience: string,
    tone: BlogGenerationFormData['tone'],
    researchSummary: string = ''
  ): Promise<BlogOutline> {
    if (!geminiService.isConfigured()) {
      return this.buildFallbackOutline(topic, audience, tone);
    }

    try {
      const prompt = promptService.buildOutlinePrompt(topic, researchSummary, audience, tone);
      const rawOutline = await geminiService.generateStructuredJson<any>({
        prompt,
        systemInstruction: promptService.getSystemInstruction(),
      });
      return outputValidatorService.validateBlogOutline(rawOutline, topic);
    } catch (err) {
      console.warn('[BlogGenerationService] Outline Gemini fallback used:', err);
      return this.buildFallbackOutline(topic, audience, tone);
    }
  }

  public async generateCompleteBlog(
    params: BlogGenerationFormData,
    researchReport?: DetailedResearchReport,
    jobId?: string
  ): Promise<StructuredBlogOutput> {
    const id = jobId || `gen-${Date.now()}`;

    generationStatusMap.set(id, {
      id,
      stage: 'analyzing_research',
      progress: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    try {
      let researchSummary = '';
      if (researchReport) {
        researchSummary = `Overview: ${researchReport.overview}\nKey Insights: ${researchReport.keyInsights.join('; ')}\nImportant Facts: ${researchReport.importantFacts.join('; ')}`;
      }

      generationStatusMap.set(id, {
        ...generationStatusMap.get(id)!,
        stage: 'creating_outline',
        progress: 40,
        updatedAt: new Date().toISOString(),
      });

      const outline = await this.generateOutline(
        params.topic,
        params.targetAudience,
        params.tone,
        researchSummary
      );

      generationStatusMap.set(id, {
        ...generationStatusMap.get(id)!,
        stage: 'writing_article',
        progress: 70,
        updatedAt: new Date().toISOString(),
      });

      let structuredBlog: StructuredBlogOutput | null = null;

      if (geminiService.isConfigured()) {
        try {
          const blogPrompt = promptService.buildBlogGenerationPrompt({
            ...params,
            researchSummary,
            outline,
          });

          const rawBlog = await geminiService.generateStructuredJson<any>({
            prompt: blogPrompt,
            systemInstruction: promptService.getSystemInstruction(),
            maxOutputTokens: 8192,
          });

          structuredBlog = outputValidatorService.validateStructuredBlog(rawBlog, params.topic);
        } catch (err) {
          console.warn('[BlogGenerationService] Article Gemini fallback used:', err);
        }
      }

      if (!structuredBlog) {
        structuredBlog = this.buildFallbackStructuredBlog(params, outline, researchReport);
      }

      generationStatusMap.set(id, {
        ...generationStatusMap.get(id)!,
        stage: 'generating_faqs_seo',
        progress: 90,
        updatedAt: new Date().toISOString(),
      });

      if (researchReport?.sources && structuredBlog.sources.length === 0) {
        structuredBlog.sources = researchReport.sources.map((s) => s.url);
      }

      generationStatusMap.set(id, {
        id,
        stage: 'completed',
        progress: 100,
        output: structuredBlog,
        createdAt: generationStatusMap.get(id)!.createdAt,
        updatedAt: new Date().toISOString(),
      });

      return structuredBlog;
    } catch (err: any) {
      generationStatusMap.set(id, {
        id,
        stage: 'failed',
        progress: 0,
        error: err.message || 'Generation failed',
        createdAt: generationStatusMap.get(id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      throw err;
    }
  }
}

export const blogGenerationService = new BlogGenerationService();
