/**
 * AI Topic Discovery Agent Service
 *
 * Implements Module 2 of the BlogFlow AI architecture.
 * Formulates focused search queries, retrieves SERP data via Tavily,
 * and uses Gemini 4 to structure high-relevance blog topics with graceful fallback.
 */

import { ResearchTopic } from '@/types';
import { geminiService } from '@/services/ai/gemini.service';
import { tavilyService } from '@/services/research/tavily.service';
import { promptService } from '@/services/ai/prompt.service';
import { outputValidatorService } from '@/services/ai/output-validator.service';

export interface DiscoverTopicsInput {
  websiteId: string;
  websiteName: string;
  niche: string;
  targetAudience: string;
  keywords?: string[];
  excludedTopics?: string[];
  seedTopic?: string;
}

export class TopicDiscoveryService {
  public async discoverTopics(input: DiscoverTopicsInput): Promise<ResearchTopic[]> {
    const {
      websiteName,
      niche,
      targetAudience,
      keywords = [],
      excludedTopics = [],
      seedTopic,
    } = input;

    const queryTopic = seedTopic || `${niche} trends best practices guide`;
    let searchQueries = [
      `${niche} trends 2026`,
      `${niche} best practices guide for ${targetAudience}`,
      `${queryTopic} practical implementation`,
    ];

    if (geminiService.isConfigured()) {
      try {
        const queryPrompt = promptService.buildSearchQueryGenerationPrompt(queryTopic, niche, targetAudience);
        const queryResult = await geminiService.generateStructuredJson<{ queries: string[] }>({
          prompt: queryPrompt,
          systemInstruction: promptService.getSystemInstruction(),
        });
        if (queryResult.queries && queryResult.queries.length > 0) {
          searchQueries = queryResult.queries;
        }
      } catch (err) {
        console.warn('[TopicDiscoveryService] Search query fallback used:', err);
      }
    }

    const searchData = await tavilyService.multiSearch(searchQueries.slice(0, 3), 3);

    let validatedTopics: ResearchTopic[] = [];

    if (geminiService.isConfigured() && searchData.length > 0) {
      try {
        const discoveryPrompt = promptService.buildTopicDiscoveryPrompt({
          websiteName,
          niche,
          audience: targetAudience,
          keywords,
          excludedTopics,
          searchData,
        });

        const rawTopics = await geminiService.generateStructuredJson<any>({
          prompt: discoveryPrompt,
          systemInstruction: promptService.getSystemInstruction(),
        });

        validatedTopics = outputValidatorService.validateDiscoveredTopics(rawTopics);
      } catch (err) {
        console.warn('[TopicDiscoveryService] Gemini topic discovery fallback used:', err);
      }
    }

    if (validatedTopics.length === 0) {
      const baseTopic = seedTopic || niche;
      validatedTopics = outputValidatorService.validateDiscoveredTopics({
        topics: [
          {
            title: `Complete ${baseTopic} Strategy Guide for ${targetAudience}`,
            description: `Deep-dive guide helping ${targetAudience} implement repeatable ${baseTopic} workflows with measurable outcomes.`,
            searchIntent: 'Informational',
            primaryKeyword: keywords[0] || `${baseTopic} strategy`,
            secondaryKeywords: keywords.slice(1, 4),
            suggestedAngle: `Actionable playbook tailored for ${websiteName}`,
            relevanceReason: `Aligns directly with ${websiteName}'s core ${niche} positioning`,
            supportingSources: searchData.slice(0, 2).map((s) => ({
              title: s.title,
              url: s.url,
              snippet: s.content.slice(0, 140),
            })),
          },
          {
            title: `Top ${baseTopic} Benchmarks & Tooling Comparisons`,
            description: `Side-by-side evaluation of leading approaches, tradeoffs, and operational patterns across ${niche}.`,
            searchIntent: 'Commercial',
            primaryKeyword: `${baseTopic} comparison`,
            secondaryKeywords: [`best ${baseTopic} tools`, `${niche} workflows`],
            suggestedAngle: `Data-backed comparison matrix for fast decision making`,
            relevanceReason: `Captures high-intent search queries in ${niche}`,
            supportingSources: searchData.slice(0, 2).map((s) => ({
              title: s.title,
              url: s.url,
              snippet: s.content.slice(0, 140),
            })),
          },
          {
            title: `Common ${baseTopic} Mistakes and How High-Performing Teams Fix Them`,
            description: `Practical troubleshooting guide addressing frequent roadblocks and quality pitfalls for ${targetAudience}.`,
            searchIntent: 'How-to',
            primaryKeyword: `${baseTopic} best practices`,
            secondaryKeywords: [`${baseTopic} troubleshooting`, `${niche} checklist`],
            suggestedAngle: `Checklist-driven breakdown of pitfalls and fixes`,
            relevanceReason: `High bookmark and share rate among ${targetAudience}`,
            supportingSources: searchData.slice(0, 2).map((s) => ({
              title: s.title,
              url: s.url,
              snippet: s.content.slice(0, 140),
            })),
          },
        ],
      });
    }

    if (excludedTopics.length > 0) {
      const lowerExcluded = excludedTopics.map((e) => e.toLowerCase().trim()).filter(Boolean);
      const filtered = validatedTopics.filter((t) => {
        const titleLower = t.title.toLowerCase();
        const descLower = t.description.toLowerCase();
        return !lowerExcluded.some((ex) => titleLower.includes(ex) || descLower.includes(ex));
      });
      if (filtered.length > 0) return filtered;
    }

    return validatedTopics;
  }
}

export const topicDiscoveryService = new TopicDiscoveryService();
