import { NextRequest, NextResponse } from 'next/server';
import { blogGenerationService } from '@/services/content/blog-generation.service';
import { ApiResponse, StructuredBlogOutput } from '@/types';
import { checkRateLimit, getClientIdentifier } from '@/services/security/rate-limiter';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const userId = (await headers()).get('x-user-id');
    const clientKey = getClientIdentifier(req, userId);
    const rateLimit = checkRateLimit(`ai:generate-blog:${clientKey}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Rate limit exceeded. Please wait before generating another article.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json();

    if (!body.topic || !body.websiteId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Topic and websiteId are required to generate an article.' },
        { status: 400 }
      );
    }

    if (String(body.topic).length > 500 || (body.instructions && String(body.instructions).length > 4000)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Topic or instructions exceed maximum allowed length.' },
        { status: 400 }
      );
    }

    const blogOutput = await blogGenerationService.generateCompleteBlog(
      {
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
      },
      body.researchReport,
      body.jobId
    );

    return NextResponse.json<ApiResponse<StructuredBlogOutput>>({
      success: true,
      data: blogOutput,
      message: 'Article successfully drafted with Gemini AI.',
    });
  } catch (error: any) {
    console.error('[API /ai/generate-blog Error]:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Blog generation failed.' },
      { status: 500 }
    );
  }
}
