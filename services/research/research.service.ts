/**
 * Web Research Agent Service
 *
 * Implements Module 3 of the BlogFlow AI architecture.
 * Manages query formulation -> Tavily search -> Gemini 4 synthesis -> Structured Research Report,
 * with graceful fallback when AI or search API keys are absent.
 */

import { DetailedResearchReport } from '@/types';
import { geminiService } from '@/services/ai/gemini.service';
import { tavilyService } from '@/services/research/tavily.service';
import { promptService } from '@/services/ai/prompt.service';
import { outputValidatorService } from '@/services/ai/output-validator.service';

export interface ConductResearchInput {
  topic: string;
  niche?: string;
  targetAudience?: string;
  keywords?: string[];
  maxQueries?: number;
}

const researchReportStore = new Map<string, DetailedResearchReport>();

export class ResearchService {
  public getResearchReportById(id: string): DetailedResearchReport | undefined {
    return researchReportStore.get(id);
  }

  public async conductResearch(input: ConductResearchInput): Promise<DetailedResearchReport> {
    const {
      topic,
      niche = 'General',
      targetAudience = 'Professionals and enthusiasts',
      keywords = [],
      maxQueries = 3,
    } = input;

    let searchQueries: string[] = [
      `${topic} overview and fundamentals`,
      `${topic} latest trends and best practices`,
      `${topic} common challenges and solutions`,
    ];

    if (geminiService.isConfigured()) {
      try {
        const queryPrompt = promptService.buildSearchQueryGenerationPrompt(topic, niche, targetAudience);
        const queryResult = await geminiService.generateStructuredJson<{ queries: string[] }>({
          prompt: queryPrompt,
          systemInstruction: promptService.getSystemInstruction(),
        });
        if (queryResult.queries && queryResult.queries.length > 0) {
          searchQueries = queryResult.queries;
        }
      } catch (err) {
        console.warn('[ResearchService] Query generation fallback used:', err);
      }
    }

    const queriesToRun = searchQueries.slice(0, maxQueries);
    const rawSources = await tavilyService.multiSearch(queriesToRun, 4);

    const sourceCandidates = rawSources.map((s) => ({
      title: s.title,
      url: s.url,
      content: s.content,
      publishedDate: s.publishedDate || null,
    }));

    if (geminiService.isConfigured() && sourceCandidates.length > 0) {
      try {
        const synthesisPrompt = promptService.buildResearchSynthesisPrompt({
          topic,
          niche,
          audience: targetAudience,
          sources: sourceCandidates,
        });

        const rawReport = await geminiService.generateStructuredJson<any>({
          prompt: synthesisPrompt,
          systemInstruction: promptService.getSystemInstruction(),
        });

        const report = outputValidatorService.validateResearchReport(rawReport, topic);
        researchReportStore.set(report.id, report);
        return report;
      } catch (err) {
        console.warn('[ResearchService] Gemini synthesis fallback used:', err);
      }
    }

    const fallbackReport = outputValidatorService.validateResearchReport(
      {
        topic,
        overview: `Comprehensive research synthesis on "${topic}" within ${niche}, tailored for ${targetAudience}.`,
        keyInsights: [
          `Readers researching ${topic} prioritize actionable steps over high-level summaries.`,
          `Clear H2/H3 structure and FAQ coverage strongly improve engagement in ${niche}.`,
          `Integrating domain keywords naturally strengthens topical authority.`,
        ],
        importantFacts: [
          `Focus keyword alignment across title, intro, and subheadings supports organic visibility.`,
          `Verified external citations improve reader trust and editorial durability.`,
        ],
        differentPerspectives: [
          `Strategic decision-makers focus on ROI and workflow velocity.`,
          `Hands-on practitioners evaluate implementation patterns and edge cases.`,
        ],
        subtopics: [
          `Core Principles of ${topic}`,
          `Implementation Architecture`,
          `Common Pitfalls & Optimization`,
        ],
        suggestedHeadings: [
          `Why ${topic} Matters Today`,
          `Step-by-Step ${topic} Framework`,
          `Best Practices & Mistakes to Avoid`,
          `Frequently Asked Questions`,
        ],
        keywords: keywords.length > 0 ? keywords : [topic, niche, 'best practices'],
        sources: sourceCandidates.slice(0, 5).map((s) => ({
          title: s.title,
          url: s.url,
          publishedDate: s.publishedDate,
          relevance: 'High',
          summary: s.content.slice(0, 200),
        })),
      },
      topic
    );

    researchReportStore.set(fallbackReport.id, fallbackReport);
    return fallbackReport;
  }
}

export const researchService = new ResearchService();
