import { NextResponse } from 'next/server';
import { DbApprovalService } from '@/services/db/approval.service';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    const [pendingBlogs, approvalHistory] = await Promise.all([
      DbApprovalService.getPendingApprovals(userId),
      DbApprovalService.getApprovalHistory(userId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        pendingBlogs,
        approvalHistory,
      },
      count: pendingBlogs.length,
    });
  } catch (err: unknown) {
    console.error('[API /approvals GET Error]:', err);
    return NextResponse.json({ success: false, error: 'Failed to load approvals' }, { status: 500 });
  }
}
