import { NextRequest, NextResponse } from 'next/server';
import { qualityService } from '@/services/quality/quality-service';
import { ApiResponse, QualityReport, Blog } from '@/types';
import { prisma } from '@/lib/prisma';
import { serverFallbackStore } from '@/lib/serverFallbackStore';

export async function POST(req: NextRequest) {
  try {
    const blog: Partial<Blog> = await req.json();

    if (!blog.content || blog.content.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Article content is required for quality audit' },
        { status: 400 }
      );
    }

    const report: QualityReport = await qualityService.evaluateContentAsync(blog);

    // If blog has an existing persisted ID, save the quality report
    if (blog.id && !blog.id.startsWith('draft') && !blog.id.startsWith('temp')) {
      if (!process.env.DATABASE_URL) {
        const fbBlog = serverFallbackStore.getBlogById(blog.id);
        if (fbBlog) {
          serverFallbackStore.addQualityReport({
            blogId: blog.id,
            grammarStatus: report.grammarScore >= 80 ? 'PASSED' : 'NEEDS_REVIEW',
            readabilityScore: report.readabilityScore,
            seoScore: report.seoScore,
            contentQualityScore: report.overallScore,
            issues: report.issues,
            suggestions: report.suggestions,
          });
        }
      } else {
        try {
          const existingBlog = await prisma.blog.findUnique({ where: { id: blog.id } });
          if (existingBlog) {
            await prisma.qualityReport.create({
              data: {
                blogId: blog.id,
                grammarStatus: report.grammarScore >= 80 ? 'PASSED' : 'NEEDS_REVIEW',
                readabilityScore: report.readabilityScore,
                seoScore: report.seoScore,
                contentQualityScore: report.overallScore,
                issues: report.issues as any,
                suggestions: report.suggestions as any,
              },
            });
          }
        } catch (dbErr) {
          console.warn('[Quality API] DB persistence fallback:', dbErr);
          const fbBlog = serverFallbackStore.getBlogById(blog.id);
          if (fbBlog) {
            serverFallbackStore.addQualityReport({
              blogId: blog.id,
              grammarStatus: report.grammarScore >= 80 ? 'PASSED' : 'NEEDS_REVIEW',
              readabilityScore: report.readabilityScore,
              seoScore: report.seoScore,
              contentQualityScore: report.overallScore,
              issues: report.issues,
              suggestions: report.suggestions,
            });
          }
        }
      }
    }

    return NextResponse.json<ApiResponse<QualityReport>>({
      success: true,
      data: report,
      message: 'Quality, SEO, readability, and grammar audit completed successfully',
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error.message || 'Internal quality check error' },
      { status: 500 }
    );
  }
}
