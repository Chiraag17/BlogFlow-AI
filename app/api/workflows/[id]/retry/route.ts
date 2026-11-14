import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WorkflowStatus } from '@prisma/client';
import { getAuthenticatedUserId } from '@/lib/apiAuth';
import { DbWebsiteService } from '@/services/db/website.service';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);

    if (!process.env.DATABASE_URL) {
      const target = serverFallbackStore.getWorkflowByIdOrThreadId(id);
      if (!target) {
        return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
      }
      if (accessibleIds.length > 0 && !accessibleIds.includes(target.websiteId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      const updatedCount = serverFallbackStore.updateWorkflowStatus(
        id,
        WorkflowStatus.RUNNING,
        null,
        null
      );
      return NextResponse.json({
        success: true,
        message: `Workflow ${id} queued for retry from last checkpoint.`,
        updatedCount,
      });
    }

    try {
      const target = await prisma.workflowExecution.findFirst({
        where: { OR: [{ id }, { graphThreadId: id }] },
      });
      if (!target) {
        return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
      }
      if (accessibleIds.length > 0 && !accessibleIds.includes(target.websiteId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      const updated = await prisma.workflowExecution.updateMany({
        where: { OR: [{ id }, { graphThreadId: id }] },
        data: {
          status: WorkflowStatus.RUNNING,
          errorMessage: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Workflow ${id} queued for retry from last checkpoint.`,
        updatedCount: updated.count,
      });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        const updatedCount = serverFallbackStore.updateWorkflowStatus(
          id,
          WorkflowStatus.RUNNING,
          null,
          null
        );
        return NextResponse.json({
          success: true,
          message: `Workflow ${id} queued for retry from last checkpoint.`,
          updatedCount,
        });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
