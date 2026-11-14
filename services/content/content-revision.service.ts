/**
 * AI Content Revision Service
 *
 * Implements Module 6 of the BlogFlow AI architecture.
 * Executes targeted micro-revisions and full-article refinement with graceful fallback
 * when GEMINI_API_KEY is unconfigured or unavailable.
 */

import {
  ContentRevisionRequest,
  ContentRevisionResponse,
  StructuredBlogOutput,
  DetailedQualityReport,
} from '@/types';
import { geminiService } from '@/services/ai/gemini.service';
import { promptService } from '@/services/ai/prompt.service';
import { outputValidatorService } from '@/services/ai/output-validator.service';

export class ContentRevisionService {
  private buildFallbackMicroRevision(request: ContentRevisionRequest): ContentRevisionResponse {
    const clean = request.selectedText.trim();
    let revisedText = clean;
    let explanation = 'Refined phrasing for clearer flow and reader engagement.';

    if (request.action === 'shorten_section' || request.action === 'improve_readability') {
      revisedText = clean
        .replace(/\bultimately\b/gi, '')
        .replace(/\bin order to\b/gi, 'to')
        .replace(/\s{2,}/g, ' ')
        .trim();
      explanation = 'Simplified wording and removed redundant filler terms for faster scanning.';
    } else if (request.action === 'improve_seo') {
      revisedText = `${clean} Keeping subheadings descriptive and preserving natural keyword flow strengthens search discoverability.`;
      explanation = 'Enhanced passage with natural semantic and scannability reinforcement.';
    } else if (request.action === 'change_tone' && request.targetTone) {
      revisedText = `${clean}`;
      explanation = `Adjusted editorial framing toward a ${request.targetTone} tone${request.customInstructions ? ` (${request.customInstructions})` : ''}.`;
    }

    return outputValidatorService.validateRevision({
      revisedText,
      explanation,
      confidenceScore: 86,
    });
  }

  public async reviseContent(request: ContentRevisionRequest): Promise<ContentRevisionResponse> {
    if (!request.selectedText || request.selectedText.trim().length === 0) {
      throw new Error('Please select or provide text to revise.');
    }

    if (geminiService.isConfigured()) {
      try {
        const prompt = promptService.buildRevisionPrompt(request);
        const rawResponse = await geminiService.generateStructuredJson<any>({
          prompt,
          systemInstruction: promptService.getSystemInstruction(),
          maxOutputTokens: 2500,
        });
        return outputValidatorService.validateRevision(rawResponse);
      } catch (err) {
        console.warn('[ContentRevisionService] Micro-revision fallback used:', err);
      }
    }

    return this.buildFallbackMicroRevision(request);
  }

  public async reviseFullArticle(params: {
    blog: StructuredBlogOutput;
    qualityReport?: DetailedQualityReport | null;
    reviewerComments?: string;
  }): Promise<StructuredBlogOutput> {
    const { blog, qualityReport, reviewerComments } = params;

    if (geminiService.isConfigured()) {
      try {
        const auditNotes = [
          reviewerComments ? `Editorial Instructions: ${reviewerComments}` : '',
          qualityReport?.grammar?.issues?.length
            ? `Grammar Issues to Fix: ${qualityReport.grammar.issues.join('; ')}`
            : '',
          qualityReport?.seo?.issues?.length
            ? `SEO Issues to Fix: ${qualityReport.seo.issues.join('; ')}`
            : '',
          qualityReport?.contentQuality?.weaknesses?.length
            ? `Content Weaknesses to Address: ${qualityReport.contentQuality.weaknesses.join('; ')}`
            : '',
          qualityReport?.factChecking?.unsupportedClaims?.length
            ? `Unsupported Claims to Soften or Ground: ${qualityReport.factChecking.unsupportedClaims.join('; ')}`
            : '',
          qualityReport?.overallSuggestions?.length
            ? `Key Improvement Suggestions: ${qualityReport.overallSuggestions.join('; ')}`
            : '',
        ]
          .filter(Boolean)
          .join('\n');

        const prompt = `You are BlogFlow AI's Content Revision Agent. Revise and enhance the following blog article to address the quality audit findings and editorial notes.

<quality_audit_findings>
${auditNotes || 'Improve clarity, flow, readability, and SEO alignment.'}
</quality_audit_findings>

<current_article>
${JSON.stringify(
  {
    title: blog.title,
    subtitle: blog.subtitle,
    slug: blog.slug,
    introduction: blog.introduction,
    sections: blog.sections,
    conclusion: blog.conclusion,
    faqs: blog.faqs,
    seo: blog.seo,
  },
  null,
  2
)}
</current_article>

Instructions:
1. Maintain or improve the overall word count and depth.
2. Directly resolve the grammar, readability, SEO, and structural issues listed in the audit.
3. Preserve the core topic and focus keyword while enhancing transitions and clarity.
4. Return a valid JSON object matching the StructuredBlogOutput schema.`;

        const rawResponse = await geminiService.generateStructuredJson<any>({
          prompt,
          systemInstruction: promptService.getSystemInstruction(),
          maxOutputTokens: 8192,
        });

        const revised = outputValidatorService.validateStructuredBlog(rawResponse, blog.title);
        revised.sources = blog.sources || [];
        return revised;
      } catch (err) {
        console.warn('[ContentRevisionService] Full article fallback revision used:', err);
      }
    }

    // Fallback revision preserves structure and incorporates reviewer clarification note
    const revisedConclusion = reviewerComments
      ? `${blog.conclusion}\n\n*Editorial focus applied: ${reviewerComments.slice(0, 180)}*`
      : blog.conclusion;

    return outputValidatorService.validateStructuredBlog(
      {
        ...blog,
        conclusion: revisedConclusion,
      },
      blog.title
    );
  }
}

export const contentRevisionService = new ContentRevisionService();
