'use client';

import { Eye, Send, Stamp } from 'lucide-react';
import { getStatusLabel, timeAgo } from '@/lib/utils';
import { BlogStatus } from '@/types';
import { DashboardBlogItem } from '@/lib/dashboardUtils';

interface ManuscriptListViewProps {
  blogs: DashboardBlogItem[];
  stampingBlogId: string | null;
  onPreview: (blog: DashboardBlogItem) => void;
  onStatusUpdate: (blog: DashboardBlogItem, nextStatus: BlogStatus) => void;
}

function getStatusTextClass(status: string): string {
  switch (status) {
    case 'published':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'approved':
      return 'text-[#163F32] dark:text-[#B8D5C5]';
    case 'pending_approval':
      return 'text-amber-700 dark:text-amber-400';
    case 'rejected':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-[var(--color-text-muted)]';
  }
}

export default function ManuscriptListView({
  blogs,
  stampingBlogId,
  onPreview,
  onStatusUpdate,
}: ManuscriptListViewProps) {
  return (
    <div
      data-testid="manuscript-list-view"
      className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 dark:bg-[#151E1A]/90"
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            <th className="py-2.5 px-4">Manuscript</th>
            <th className="py-2.5 px-3 text-right hidden sm:table-cell">Words</th>
            <th className="py-2.5 px-3 text-right">SEO</th>
            <th className="py-2.5 px-3 text-right hidden md:table-cell">Updated</th>
            <th className="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-light)]">
          {blogs.map((blog) => {
            const rawStatus = (blog.status || 'draft').toLowerCase() as BlogStatus;
            const seo = blog.seoScore || 88;
            const words = blog.wordCount || 1650;
            const isStamping = stampingBlogId === blog.id;

            return (
              <tr
                key={blog.id}
                className={`group transition-colors hover:bg-[var(--color-bg-muted)]/60 ${
                  isStamping ? 'opacity-65' : ''
                }`}
              >
                <td className="py-3 px-4 max-w-[380px]">
                  <button
                    type="button"
                    onClick={() => onPreview(blog)}
                    className="text-left group-hover:text-[var(--color-primary)] transition-colors cursor-pointer block w-full"
                  >
                    <div className="font-editorial font-semibold text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary)] line-clamp-1">
                      {blog.title}
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-0.5">
                    <span className="font-medium text-[var(--color-text-secondary)]">
                      {blog.websiteName || 'TechPulse'}
                    </span>
                    <span>·</span>
                    <span className={`font-medium ${getStatusTextClass(rawStatus)}`}>
                      {getStatusLabel(rawStatus)}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-[var(--color-text-secondary)] hidden sm:table-cell whitespace-nowrap">
                  {words.toLocaleString()}w
                </td>

                <td className="py-3 px-3 text-right font-mono text-xs font-bold tabular-nums whitespace-nowrap">
                  <span className="text-[#9A732E] dark:text-[#D4AF67]">{seo}</span>
                  <span className="text-[var(--color-text-muted)] font-normal">/100</span>
                </td>

                <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-[var(--color-text-muted)] hidden md:table-cell whitespace-nowrap">
                  {blog.updatedAt ? timeAgo(blog.updatedAt) : 'Recently'}
                </td>

                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPreview(blog)}
                      aria-label={`Preview ${blog.title}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Preview</span>
                    </button>

                    {(rawStatus === 'pending_approval' || rawStatus === 'draft') && (
                      <button
                        type="button"
                        onClick={() => onStatusUpdate(blog, 'approved')}
                        aria-label={`Approve ${blog.title}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#163F32] text-[#F3F0E8] dark:bg-[#B8D5C5] dark:text-[#101714] hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <Stamp size={13} />
                        <span>Approve</span>
                      </button>
                    )}

                    {rawStatus === 'approved' && (
                      <button
                        type="button"
                        onClick={() => onStatusUpdate(blog, 'published')}
                        aria-label={`Publish ${blog.title}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#C8A15A] text-[#101714] hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <Send size={13} />
                        <span>Publish</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
