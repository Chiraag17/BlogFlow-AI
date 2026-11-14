import { NextRequest, NextResponse } from 'next/server';
import { DbWebsiteService } from '@/services/db/website.service';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    const websites = await DbWebsiteService.getWebsites(userId);
    return NextResponse.json({ success: true, data: websites });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to connect and manage websites.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { name, url, niche, targetAudience, writingTone, preferredKeywords, excludedTopics, websiteContext } = body;

    if (!name || !url || !niche || !targetAudience || !writingTone) {
      return NextResponse.json(
        { success: false, error: 'Missing required website configuration fields (name, url, niche, targetAudience, writingTone).' },
        { status: 400 }
      );
    }

    const website = await DbWebsiteService.createWebsite({
      userId,
      name,
      url,
      niche,
      targetAudience,
      writingTone,
      preferredKeywords,
      excludedTopics,
      websiteContext,
    });

    return NextResponse.json({
      success: true,
      message: 'Website connected and registered.',
      data: website,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith('Invalid URL') || message.startsWith('Restricted URL')) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    console.error('[API /websites POST Error]:', message);
    return NextResponse.json({ success: false, error: 'Failed to create website.' }, { status: 500 });
  }
}
