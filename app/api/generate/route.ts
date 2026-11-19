import { NextRequest, NextResponse } from 'next/server';
import { blogGenerationService } from '@/services/content/blog-generation.service';
import { BlogGenerationFormData, ApiResponse } from '@/types';
import { checkRateLimit, getClientIdentifier } from '@/services/security/rate-limiter';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const userId = (await headers()).get('x-user-id');
    const clientKey = getClientIdentifier(req, userId);
    const rateLimit = checkRateLimit(`ai:generate:${clientKey}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Rate limit exceeded. Please wait before generating another article.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body: BlogGenerationFormData = await req.json();

    if (!body.topic || !body.websiteId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Topic and websiteId are required fields' },
        { status: 400 }
      );
    }

    if (String(body.topic).length > 500) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Topic exceeds maximum allowed length (500 characters).' },
        { status: 400 }
      );
    }

    const structured = await blogGenerationService.generateCompleteBlog({
      websiteId: body.websiteId,
      researchId: body.researchId,
      topic: body.topic,
      category: body.category || 'General',
      targetAudience: body.targetAudience || 'General Audience',
      tone: body.tone || 'professional',
      articleLength: body.articleLength || 'medium',
      primaryKeywords: body.primaryKeywords || [body.topic],
      secondaryKeywords: body.secondaryKeywords || [],
      instructions: body.instructions || '',
    });

    const focusKeyword = body.primaryKeywords?.[0] || body.topic;
    const secondaryKeywords = body.secondaryKeywords || [];

    const generated = {
      title: structured.title,
      subtitle: structured.subtitle,
      slug: structured.slug,
      content: structured.fullMarkdown,
      metaTitle: structured.seo.metaTitle,
      metaDescription: structured.seo.metaDescription,
      focusKeyword: structured.seo.focusKeyword || focusKeyword,
      secondaryKeywords: structured.seo.secondaryKeywords || secondaryKeywords,
      category: body.category || 'General',
      tags: [body.category, ...(body.primaryKeywords || []), ...secondaryKeywords]
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

    return NextResponse.json<ApiResponse<typeof generated>>({
      success: true,
      data: generated,
      message: 'Article successfully drafted with Gemini AI',
    });
  } catch (error: any) {
    console.error('[API /generate Error]:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal generation error' },
      { status: 500 }
    );
  }
}
