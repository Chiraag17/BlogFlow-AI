/**
 * Tavily Web Research & Discovery Adapter
 *
 * Delegates web search execution to the centralized TavilyService (`tavily.service.ts`)
 * and shapes results into structured `ResearchTopic[]` entries for `/api/research`.
 */

import { ResearchTopic, ResearchSource } from '@/types';
import { tavilyService as coreTavilyService } from '@/services/research/tavily.service';

export interface TavilySearchParams {
  topic: string;
  category: string;
  targetAudience?: string;
  keywords?: string[];
}

export interface TavilyResearchResult {
  topic: string;
  discoveredTopics: ResearchTopic[];
  totalSourcesEvaluated: number;
}

export class TavilyResearchAdapter {
  /**
   * Conducts topic research and produces structured topics with citations.
   */
  async conductResearch(params: TavilySearchParams): Promise<TavilyResearchResult> {
    const query = `${params.topic} ${params.category} guide best practices`.trim();
    const searchRes = await coreTavilyService.search({
      query,
      searchDepth: 'advanced',
      maxResults: 6,
      includeAnswer: true,
    });

    const sources: ResearchSource[] = searchRes.results.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      relevanceScore: Math.round((r.score || 0.85) * 100),
    }));

    const primaryTopic: ResearchTopic = {
      id: `topic-${Date.now()}-1`,
      title: `${params.topic}: Strategies, Trends, and Practical Insights`,
      description:
        searchRes.answer ||
        `Comprehensive analysis and implementation guide on ${params.topic} in ${params.category}.`,
      searchIntent: 'Informational',
      suggestedKeywords:
        params.keywords && params.keywords.length > 0
          ? params.keywords
          : [params.topic, params.category, 'best practices'],
      insights: [
        `Search intent around ${params.topic} favors structured step-by-step frameworks.`,
        `Audience (${params.targetAudience || 'Practitioners'}) prioritizes reproducible examples and clear FAQs.`,
        `Long-form, well-headed articles outperform shallow overviews.`,
      ],
      sources,
      selected: true,
    };

    const secondaryTopic: ResearchTopic = {
      id: `topic-${Date.now()}-2`,
      title: `Common Mistakes When Implementing ${params.topic}`,
      description: `Critical analysis of pitfalls and quality bottlenecks in ${params.category}, plus practical fixes.`,
      searchIntent: 'Problem-Solving',
      suggestedKeywords: [
        `${params.topic.toLowerCase()} mistakes`,
        `${params.category.toLowerCase()} checklist`,
        'troubleshooting',
      ],
      insights: [
        'Articles addressing edge-cases achieve higher reader retention.',
        'Pairing quantitative benchmarks with troubleshooting steps improves search authority.',
      ],
      sources: sources.slice(0, 2),
      selected: false,
    };

    return {
      topic: params.topic,
      discoveredTopics: [primaryTopic, secondaryTopic],
      totalSourcesEvaluated: sources.length,
    };
  }
}

export const tavilyService = new TavilyResearchAdapter();
