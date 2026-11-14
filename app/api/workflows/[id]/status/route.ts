import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowExecutionStatus } from '@/services/langgraph/workflow.graph';
import { getAuthenticatedUserId } from '@/lib/apiAuth';
import { DbWebsiteService } from '@/services/db/website.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    const statusData = await getWorkflowExecutionStatus(id);

    if (!statusData.dbRecord && (!statusData.values || Object.keys(statusData.values).length === 0)) {
      return NextResponse.json({ success: false, error: 'Workflow execution not found' }, { status: 404 });
    }

    const recordWebsiteId = statusData.dbRecord?.websiteId || (statusData.values as any)?.websiteId;
    if (recordWebsiteId) {
      const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
      if (accessibleIds.length > 0 && !accessibleIds.includes(recordWebsiteId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      data: statusData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
