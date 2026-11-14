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

    if (!body.comments && !body.instructions) {
      return NextResponse.json(
        { success: false, error: 'Reviewer comments or revision instructions are required.' },
        { status: 400 }
      );
    }

    const result = await DbApprovalService.processDecision({
      blogId: id,
      decision: 'REQUEST_REVISION',
      comments: body.comments || body.instructions,
      reviewerId: userId || body.reviewerId,
    });

    return NextResponse.json({
      success: true,
      message: 'Revision requested. Workflow cycled to Content Revision Agent.',
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
