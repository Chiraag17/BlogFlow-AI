import { NextRequest, NextResponse } from 'next/server';
import { DbApprovalService } from '@/services/db/approval.service';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const userId = await getAuthenticatedUserId();

    const result = await DbApprovalService.processDecision({
      blogId: id,
      decision: 'APPROVE',
      comments: body.comments,
      reviewerId: userId || body.reviewerId,
    });

    return NextResponse.json({
      success: true,
      message: 'Article successfully approved and queued for WordPress publishing.',
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.startsWith('Forbidden')
      ? 403
      : message.toLowerCase().includes('not found')
      ? 404
      : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
