import { NextRequest, NextResponse } from 'next/server';
import { websiteAnalysisService } from '@/services/research/website-analysis.service';
import { ApiResponse, WebsiteAnalysis } from '@/types';
import { checkRateLimit, getClientIdentifier } from '@/services/security/rate-limiter';
import { validateExternalUrl } from '@/services/security/url-validator';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const userId = (await headers()).get('x-user-id');
    const clientKey = getClientIdentifier(req, userId);
    const rateLimit = checkRateLimit(`ai:analyze-website:${clientKey}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Rate limit exceeded. Please wait before running another analysis.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json();

    if (!body.url && !body.manualContext) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'A valid website URL or manual context is required for analysis.' },
        { status: 400 }
      );
    }

    let validatedUrl = '';
    if (body.url) {
      try {
        validatedUrl = validateExternalUrl(String(body.url)).toString();
      } catch (urlErr: unknown) {
        const msg = urlErr instanceof Error ? urlErr.message : 'Invalid website URL';
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: msg },
          { status: 400 }
        );
      }
    }

    const analysis = await websiteAnalysisService.analyzeWebsite({
      websiteId: body.websiteId,
      name: body.name || 'Website',
      url: validatedUrl,
      niche: body.niche,
      audience: body.audience,
      tone: body.tone,
      keywords: body.keywords,
      excludedTopics: body.excludedTopics,
      manualContext: body.manualContext,
    });

    return NextResponse.json<ApiResponse<WebsiteAnalysis>>({
      success: true,
      data: analysis,
      message: 'Website context analyzed successfully.',
    });
  } catch (error: any) {
    console.error('[API /ai/analyze-website Error]:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Website analysis failed.' },
      { status: 500 }
    );
  }
}
