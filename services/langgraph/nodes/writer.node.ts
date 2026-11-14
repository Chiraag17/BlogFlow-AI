import { WorkflowGraphState } from '@/services/langgraph/workflow.state';
import { blogGenerationService } from '@/services/content/blog-generation.service';
import { prisma } from '@/lib/prisma';
import { BlogStatus } from '@prisma/client';
import { BlogArticleSection } from '@/types';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function writerNode(state: WorkflowGraphState): Promise<Partial<WorkflowGraphState>> {
  console.log(`[Agent 2: Content Writer Agent] Generating complete article for topic: "${state.topic}"`);

  if (!state.researchReport) {
    return {
      error: 'Cannot generate blog without a valid research report.',
      currentStage: 'writer_failed',
    };
  }

  try {
    const websiteContext = state.websiteContext || {
      websiteName: 'Connected Website',
      niche: 'Technology',
      targetAudience: 'General Audience',
      writingTone: 'Professional',
      contentCategories: [],
      contentPreferences: [],
    };

    const blogDraft = await blogGenerationService.generateCompleteBlog(
      {
        websiteId: state.websiteId,
        topic: state.topic,
        category: websiteContext.contentCategories?.[0] || 'Technology',
        targetAudience: websiteContext.targetAudience,
        tone: (websiteContext.writingTone?.toLowerCase() as any) || 'professional',
        articleLength: 'medium',
        primaryKeywords: state.researchReport.keywords || [state.topic],
        secondaryKeywords: [],
        instructions: '',
      },
      state.researchReport
    );

    const fullContent = [
      `## ${blogDraft.title}`,
      blogDraft.subtitle ? `*${blogDraft.subtitle}*\n` : '',
      blogDraft.introduction,
      ...blogDraft.sections.map((s: BlogArticleSection) => `### ${s.heading}\n\n${s.content}`),
      `### Conclusion\n\n${blogDraft.conclusion}`,
    ].join('\n\n');

    // Prevent cross-website slug collisions by scoping slug cleanly
    const uniqueSlug = `${blogDraft.slug}-${Date.now().toString(36)}`;
    blogDraft.slug = uniqueSlug;

    let persistedInDb = false;
    if (process.env.DATABASE_URL && state.websiteId) {
      try {
        const savedBlog = await prisma.blog.create({
          data: {
            websiteId: state.websiteId,
            researchReportId: state.researchReport?.id || null,
            title: blogDraft.title,
            subtitle: blogDraft.subtitle,
            slug: uniqueSlug,
            content: fullContent,
            introduction: blogDraft.introduction,
            conclusion: blogDraft.conclusion,
            faqs: blogDraft.faqs as any,
            metaTitle: blogDraft.seo.metaTitle,
            metaDescription: blogDraft.seo.metaDescription,
            focusKeyword: blogDraft.seo.focusKeyword,
            secondaryKeywords: blogDraft.seo.secondaryKeywords as any,
            category: websiteContext.contentCategories?.[0] || 'General',
            estimatedReadingTime: blogDraft.estimatedReadingTime || 5,
            status: BlogStatus.QUALITY_CHECK,
          },
        });
        (blogDraft as any).id = savedBlog.id;
        persistedInDb = true;
      } catch (dbErr) {
        console.warn('[Agent 2] DB save fallback activated:', dbErr);
      }
    }

    if (!persistedInDb && state.websiteId) {
      const fbBlog = serverFallbackStore.createBlog({
        websiteId: state.websiteId,
        title: blogDraft.title,
        subtitle: blogDraft.subtitle,
        slug: uniqueSlug,
        content: fullContent,
        introduction: blogDraft.introduction,
        conclusion: blogDraft.conclusion,
        faqs: blogDraft.faqs,
        metaTitle: blogDraft.seo.metaTitle,
        metaDescription: blogDraft.seo.metaDescription,
        focusKeyword: blogDraft.seo.focusKeyword,
        secondaryKeywords: blogDraft.seo.secondaryKeywords,
        category: websiteContext.contentCategories?.[0] || 'General',
        estimatedReadingTime: blogDraft.estimatedReadingTime || 5,
        status: BlogStatus.PENDING_APPROVAL,
      });
      (blogDraft as any).id = fbBlog.id;
    }

    return {
      blogDraft,
      currentStage: 'blog_drafted',
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Agent 2: Content Writer Agent] Failed:', message);
    return {
      error: `Content Writer Agent failed: ${message}`,
      currentStage: 'writer_failed',
    };
  }
}
