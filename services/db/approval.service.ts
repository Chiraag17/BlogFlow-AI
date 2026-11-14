import { prisma } from '@/lib/prisma';
import { BlogStatus, ApprovalStatus } from '@prisma/client';
import { resumeWorkflowDecision } from '../langgraph/workflow.graph';
import { DbWebsiteService } from './website.service';
import { isDatabaseUnavailableError } from '@/lib/authSecret';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export class DbApprovalService {
  /**
   * Retrieves all blogs awaiting human review for the user's accessible websites.
   */
  public static async getPendingApprovals(userId?: string | null) {
    if (!process.env.DATABASE_URL) {
      return serverFallbackStore.getPendingApprovals(userId);
    }

    try {
      const accessibleWebsiteIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
      return await prisma.blog.findMany({
        where: {
          ...(accessibleWebsiteIds.length > 0 ? { websiteId: { in: accessibleWebsiteIds } } : {}),
          status: {
            in: [BlogStatus.PENDING_APPROVAL, BlogStatus.CHANGES_REQUESTED],
          },
        },
        include: {
          website: { select: { id: true, name: true, url: true } },
          researchReport: true,
          qualityReports: { orderBy: { createdAt: 'desc' }, take: 1 },
          approvals: { orderBy: { createdAt: 'desc' } },
          workflowExecutions: {
            where: { status: 'PAUSED' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (err) {
      if (isDatabaseUnavailableError(err)) {
        return serverFallbackStore.getPendingApprovals(userId);
      }
      console.warn('[DbApprovalService] DB query fallback:', err);
      return serverFallbackStore.getPendingApprovals(userId);
    }
  }

  /**
   * Retrieves review history across accessible articles.
   */
  public static async getApprovalHistory(userId?: string | null) {
    if (!process.env.DATABASE_URL) {
      return serverFallbackStore.getApprovalHistory(userId);
    }

    try {
      const accessibleWebsiteIds = await DbWebsiteService.getAccessibleWebsiteIds(userId);
      return await prisma.approval.findMany({
        where:
          accessibleWebsiteIds.length > 0
            ? { blog: { websiteId: { in: accessibleWebsiteIds } } }
            : {},
        include: {
          blog: {
            include: {
              website: { select: { id: true, name: true, url: true } },
              researchReport: true,
              qualityReports: { orderBy: { createdAt: 'desc' }, take: 1 },
              publishingRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
          },
          reviewer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    } catch (err) {
      console.warn('[DbApprovalService] getApprovalHistory fallback:', err);
      return serverFallbackStore.getApprovalHistory(userId);
    }
  }

  /**
   * Handles human approval decision: APPROVE, REJECT, or REQUEST_REVISION.
   * Resumes LangGraph workflow thread if associated, and falls back gracefully when DB is offline.
   */
  public static async processDecision(params: {
    blogId: string;
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION';
    comments?: string;
    reviewerId?: string;
  }) {
    const { blogId, decision, comments } = params;

    let verifiedUserId = params.reviewerId;
    try {
      const { headers } = await import('next/headers');
      const headerUserId = (await headers()).get('x-user-id');
      if (headerUserId) {
        verifiedUserId = headerUserId;
      }
    } catch {
      // Outside request context
    }

    if (!process.env.DATABASE_URL) {
      const fallbackBlog = serverFallbackStore.getBlogById(blogId);
      if (!fallbackBlog) {
        throw new Error('Blog not found.');
      }
      if (verifiedUserId) {
        const accessibleWebsiteIds = serverFallbackStore.getAccessibleWebsiteIds(verifiedUserId);
        if (accessibleWebsiteIds.length > 0 && !accessibleWebsiteIds.includes(fallbackBlog.websiteId)) {
          throw new Error('Forbidden: You do not have permission to review this article.');
        }
      }
      return serverFallbackStore.processApprovalDecision({
        blogId,
        decision,
        comments,
        reviewerId: verifiedUserId,
      });
    }

    try {
      // 1. Fetch blog and active workflow execution thread
      const blog = await prisma.blog.findUnique({
        where: { id: blogId },
        include: {
          workflowExecutions: {
            where: { status: 'PAUSED' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!blog) {
        throw new Error('Blog not found.');
      }

      if (verifiedUserId) {
        const accessibleWebsiteIds = await DbWebsiteService.getAccessibleWebsiteIds(verifiedUserId);
        if (accessibleWebsiteIds.length > 0 && !accessibleWebsiteIds.includes(blog.websiteId)) {
          throw new Error('Forbidden: You do not have permission to review this article.');
        }
      }

      let newBlogStatus: BlogStatus = BlogStatus.PENDING_APPROVAL;
      let approvalStatus: ApprovalStatus = ApprovalStatus.PENDING;

      if (decision === 'APPROVE') {
        newBlogStatus = BlogStatus.APPROVED;
        approvalStatus = ApprovalStatus.APPROVED;
      } else if (decision === 'REJECT') {
        newBlogStatus = BlogStatus.REJECTED;
        approvalStatus = ApprovalStatus.REJECTED;
      } else if (decision === 'REQUEST_REVISION') {
        newBlogStatus = BlogStatus.CHANGES_REQUESTED;
        approvalStatus = ApprovalStatus.REVISION_REQUESTED;
      }

      // Verify reviewer exists in User table if verifiedUserId is provided
      let validReviewerId: string | undefined = undefined;
      if (verifiedUserId) {
        const userExists = await prisma.user.findUnique({
          where: { id: verifiedUserId },
          select: { id: true },
        });
        if (userExists) {
          validReviewerId = userExists.id;
        }
      }

      // 2. Update PostgreSQL database records
      const [updatedBlog, approvalRecord] = await prisma.$transaction([
        prisma.blog.update({
          where: { id: blogId },
          data: { status: newBlogStatus },
        }),
        prisma.approval.create({
          data: {
            blogId,
            reviewerId: validReviewerId,
            status: approvalStatus,
            comments: comments || `Human decision recorded: ${decision}`,
            reviewedAt: new Date(),
          },
        }),
      ]);

      // 3. Resume LangGraph workflow execution if thread exists
      let graphResumeResult = null;
      const threadId = blog.workflowExecutions[0]?.graphThreadId;
      if (threadId) {
        try {
          graphResumeResult = await resumeWorkflowDecision({
            threadId,
            decision,
            comments,
            reviewerId: validReviewerId,
          });
        } catch (graphErr) {
          console.warn(`[Approval Service] Graph resumption notice:`, graphErr);
        }
      }

      return {
        success: true,
        blog: updatedBlog,
        approval: approvalRecord,
        graphResume: graphResumeResult,
      };
    } catch (err) {
      if (isDatabaseUnavailableError(err)) {
        const fallbackBlog = serverFallbackStore.getBlogById(blogId);
        if (!fallbackBlog) {
          throw new Error('Blog not found.');
        }
        if (verifiedUserId) {
          const accessibleWebsiteIds = serverFallbackStore.getAccessibleWebsiteIds(verifiedUserId);
          if (accessibleWebsiteIds.length > 0 && !accessibleWebsiteIds.includes(fallbackBlog.websiteId)) {
            throw new Error('Forbidden: You do not have permission to review this article.');
          }
        }
        return serverFallbackStore.processApprovalDecision({
          blogId,
          decision,
          comments,
          reviewerId: verifiedUserId,
        });
      }
      throw err;
    }
  }
}
