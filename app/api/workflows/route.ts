import { NextRequest, NextResponse } from 'next/server';
import { startWorkflowExecution } from '@/services/langgraph/workflow.graph';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/apiAuth';
import { DbWebsiteService } from '@/services/db/website.service';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { topic, websiteId, websiteContext, integrationId } = body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: 'A valid blog topic is required to start a workflow.' },
        { status: 400 }
      );
    }

    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
    const resolvedWebsiteId = websiteId || accessibleIds[0];

    if (!resolvedWebsiteId) {
      return NextResponse.json(
        { success: false, error: 'No website available for workflow execution.' },
        { status: 400 }
      );
    }

    if (accessibleIds.length > 0 && !accessibleIds.includes(resolvedWebsiteId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have access to this website.' },
        { status: 403 }
      );
    }

    const execution = await startWorkflowExecution({
      userId,
      websiteId: resolvedWebsiteId,
      topic: topic.trim(),
      websiteContext,
      integrationId,
    });

    return NextResponse.json({
      success: true,
      message: 'LangGraph multi-agent workflow started successfully.',
      data: execution,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Failed to initiate workflow: ${message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    const accessibleIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        data: serverFallbackStore.getWorkflows(userId),
      });
    }

    try {
      const executions = await prisma.workflowExecution.findMany({
        where: accessibleIds.length > 0 ? { websiteId: { in: accessibleIds } } : {},
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          website: { select: { name: true, url: true } },
          blog: { select: { title: true, status: true } },
        },
      });

      return NextResponse.json({ success: true, data: executions });
    } catch (dbErr) {
      if (isDatabaseUnavailableError(dbErr)) {
        return NextResponse.json({
          success: true,
          data: serverFallbackStore.getWorkflows(userId),
        });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
