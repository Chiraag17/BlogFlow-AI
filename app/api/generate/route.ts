import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/services/ai/gemini-service';
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

    const generated = await geminiService.generateBlog(body);

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
