import { StateGraph, START, END, Command } from '@langchain/langgraph';
import { BlogWorkflowAnnotation, WorkflowGraphState } from './workflow.state';
import { researchNode } from './nodes/research.node';
import { writerNode } from './nodes/writer.node';
import { qualityNode } from './nodes/quality.node';
import { revisionNode } from './nodes/revision.node';
import { approvalNode, HumanApprovalPayload } from './nodes/approval.node';
import { publisherNode } from './nodes/publisher.node';
import { workflowCheckpointer } from './checkpointer';
import { prisma } from '@/lib/prisma';
import { WorkflowStatus } from '@prisma/client';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

function createWorkflowGraph() {
  const workflow = new StateGraph(BlogWorkflowAnnotation)
    .addNode('research', researchNode)
    .addNode('writer', writerNode)
    .addNode('quality', qualityNode)
    .addNode('revision', revisionNode)
    .addNode('humanApproval', approvalNode)
    .addNode('publisher', publisherNode)

    .addEdge(START, 'research')
    .addEdge('research', 'writer')
    .addEdge('writer', 'quality')

    .addConditionalEdges('quality', (state) => {
      if (state.error) return END;

      const score = state.qualityReport?.contentQuality.score;
      if (typeof score === 'number' && score < 70 && state.revisionCount < 1) {
        return 'revision';
      }

      return 'humanApproval';
    })

    .addEdge('revision', 'quality')

    .addConditionalEdges('humanApproval', (state) => {
      if (state.approvalDecision === 'APPROVE') {
        return 'publisher';
      }
      if (state.approvalDecision === 'REQUEST_REVISION') {
        return 'revision';
      }
      return END;
    })

    .addEdge('publisher', END);

  return workflow.compile({ checkpointer: workflowCheckpointer });
}

export const blogflowGraph = createWorkflowGraph();

export async function startWorkflowExecution(params: {
  userId: string;
  websiteId: string;
  topic: string;
  websiteContext?: any;
  integrationId?: string;
  threadId?: string;
}): Promise<{ threadId: string; executionId: string; result: any; status: string }> {
  const { userId, websiteId, topic, websiteContext, integrationId } = params;
  const threadId = params.threadId || `wf-thread-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  let executionId = threadId;
  if (process.env.DATABASE_URL) {
    try {
      const execution = await prisma.workflowExecution.upsert({
        where: { graphThreadId: threadId },
        create: {
          userId,
          websiteId,
          graphThreadId: threadId,
          workflowType: 'AUTONOMOUS_BLOG_CREATION',
          currentNode: 'research',
          status: WorkflowStatus.RUNNING,
        },
        update: {
          status: WorkflowStatus.RUNNING,
          errorMessage: null,
        },
      });
      executionId = execution.id;
    } catch (dbErr) {
      console.warn('[Workflow] DB execution fallback:', dbErr);
      const fb = serverFallbackStore.upsertWorkflow({
        userId,
        websiteId,
        graphThreadId: threadId,
        currentNode: 'research',
        status: WorkflowStatus.RUNNING,
      });
      executionId = fb.id;
    }
  } else {
    const fb = serverFallbackStore.upsertWorkflow({
      userId,
      websiteId,
      graphThreadId: threadId,
      currentNode: 'research',
      status: WorkflowStatus.RUNNING,
    });
    executionId = fb.id;
  }

  const config = { configurable: { thread_id: threadId } };
  const initialState: Partial<WorkflowGraphState> = {
    userId,
    websiteId,
    topic,
    websiteContext,
    integrationId,
    revisionCount: 0,
    currentStage: 'started',
  };

  const result = await blogflowGraph.invoke(initialState, config);

  const graphState = await blogflowGraph.getState(config);
  const isInterrupted = graphState.tasks?.some((t) => t.interrupts && t.interrupts.length > 0);
  const finalStatus = isInterrupted ? WorkflowStatus.PAUSED : result.error ? WorkflowStatus.FAILED : WorkflowStatus.COMPLETED;
  const currentNode = isInterrupted ? 'humanApproval' : 'completed';
  const blogId = (result.blogDraft as any)?.id || null;

  if (process.env.DATABASE_URL) {
    await prisma.workflowExecution
      .updateMany({
        where: { graphThreadId: threadId },
        data: {
          status: finalStatus,
          currentNode,
          errorMessage: result.error || null,
          blogId,
        },
      })
      .catch(() => {});
  } else {
    serverFallbackStore.upsertWorkflow({
      userId,
      websiteId,
      graphThreadId: threadId,
      status: finalStatus,
      currentNode,
      errorMessage: result.error || null,
      blogId,
    });
  }

  return {
    threadId,
    executionId,
    result,
    status: isInterrupted ? 'PAUSED_FOR_APPROVAL' : finalStatus,
  };
}

export async function resumeWorkflowDecision(params: {
  threadId: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION';
  comments?: string;
  reviewerId?: string;
}): Promise<{ threadId: string; result: any; status: string }> {
  const { threadId, decision, comments, reviewerId } = params;
  const config = { configurable: { thread_id: threadId } };

  const approvalPayload: HumanApprovalPayload = {
    decision,
    comments,
    reviewerId,
  };

  const result = await blogflowGraph.invoke(new Command({ resume: approvalPayload }), config);

  const graphState = await blogflowGraph.getState(config);
  const isInterrupted = graphState.tasks?.some((t) => t.interrupts && t.interrupts.length > 0);
  const finalStatus = isInterrupted ? WorkflowStatus.PAUSED : result.error ? WorkflowStatus.FAILED : WorkflowStatus.COMPLETED;
  const currentNode = isInterrupted ? 'humanApproval' : 'completed';

  if (process.env.DATABASE_URL) {
    await prisma.workflowExecution
      .updateMany({
        where: { graphThreadId: threadId },
        data: {
          status: finalStatus,
          currentNode,
          completedAt: finalStatus === WorkflowStatus.COMPLETED ? new Date() : null,
          errorMessage: result.error || null,
        },
      })
      .catch(() => {});
  } else {
    serverFallbackStore.updateWorkflowStatus(
      threadId,
      finalStatus,
      result.error || null,
      finalStatus === WorkflowStatus.COMPLETED ? new Date() : null
    );
  }

  return {
    threadId,
    result,
    status: isInterrupted ? 'PAUSED_FOR_APPROVAL' : finalStatus,
  };
}

export async function getWorkflowExecutionStatus(threadId: string) {
  const config = { configurable: { thread_id: threadId } };
  const state = await blogflowGraph.getState(config);

  let dbExecution: any = null;
  if (process.env.DATABASE_URL) {
    dbExecution = await prisma.workflowExecution
      .findUnique({
        where: { graphThreadId: threadId },
        include: { blog: true, website: true },
      })
      .catch(() => null);
  }
  if (!dbExecution) {
    dbExecution = serverFallbackStore.getWorkflowByIdOrThreadId(threadId);
  }

  const isInterrupted = state.tasks?.some((t) => t.interrupts && t.interrupts.length > 0);

  return {
    threadId,
    status: isInterrupted ? 'PAUSED_FOR_APPROVAL' : dbExecution?.status || 'UNKNOWN',
    values: state.values,
    next: state.next,
    dbRecord: dbExecution,
  };
}
