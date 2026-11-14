import { WorkflowGraphState } from '../workflow.state';
import { WordPressService } from '../../cms/wordpress.service';
import { DbBlogService } from '@/services/db/blog.service';

export async function publisherNode(state: WorkflowGraphState): Promise<Partial<WorkflowGraphState>> {
  console.log('[Agent 4: Publishing Agent] Starting publishing workflow');

  const blogId = (state.blogDraft as any)?.id;
  if (!blogId) {
    return {
      error: 'Cannot publish without a persisted blog ID.',
      currentStage: 'publishing_failed',
    };
  }

  const dbBlog = await DbBlogService.getBlogById(blogId);

  if (!dbBlog) {
    return {
      error: 'Security Check Failed: Blog record not found.',
      currentStage: 'publishing_failed',
    };
  }

  const latestApproval = dbBlog.approvals?.[0];
  const isApproved =
    dbBlog.status === 'APPROVED' ||
    dbBlog.status === 'SCHEDULED' ||
    latestApproval?.status === 'APPROVED';

  if (!isApproved) {
    return {
      error: 'Security Violation: Publishing rejected. Blog has not been approved by a human reviewer.',
      currentStage: 'publishing_blocked',
    };
  }

  const integrations = dbBlog.website?.cmsIntegrations || [];
  const integrationId =
    state.integrationId ||
    integrations.find((c: any) => c.connectionStatus === 'CONNECTED')?.id;

  if (!integrationId) {
    return {
      publishingResult: {
        success: true,
        message: 'Blog is APPROVED. Connect WordPress in Integrations to enable automated remote publishing.',
        status: 'approved_ready_for_cms',
      },
      currentStage: 'publishing_completed',
      error: null,
    };
  }

  try {
    const result = await WordPressService.publishPost({
      blogId,
      integrationId,
      publishMode: 'draft',
    });

    if (!result.success) {
      return {
        error: result.error || 'WordPress publication failed.',
        publishingResult: result,
        currentStage: 'publishing_failed',
      };
    }

    return {
      publishingResult: result,
      currentStage: 'publishing_completed',
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Agent 4: Publishing Agent] Publishing error:', message);
    return {
      error: `Publishing Agent failed: ${message}`,
      currentStage: 'publishing_failed',
    };
  }
}
