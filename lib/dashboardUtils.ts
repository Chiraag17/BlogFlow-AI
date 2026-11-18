import { BlogStatus } from '@/types';

export interface DashboardBlogItem {
  id: string;
  title: string;
  status?: string;
  websiteId?: string;
  websiteName?: string;
  category?: string;
  wordCount?: number;
  readingTime?: number;
  seoScore?: number;
  readabilityScore?: number;
  updatedAt?: string;
  excerpt?: string;
}

export interface TelemetryPoint {
  month: string;
  generated: number;
  published: number;
  seoAvg: number;
  readabilityAvg: number;
  words: number;
}

export const TELEMETRY_SERIES: TelemetryPoint[] = [
  { month: 'Apr', generated: 6, published: 4, seoAvg: 81, readabilityAvg: 78, words: 9400 },
  { month: 'May', generated: 8, published: 6, seoAvg: 84, readabilityAvg: 80, words: 12800 },
  { month: 'Jun', generated: 10, published: 8, seoAvg: 86, readabilityAvg: 82, words: 16200 },
  { month: 'Jul', generated: 9, published: 7, seoAvg: 85, readabilityAvg: 84, words: 14500 },
  { month: 'Aug', generated: 13, published: 10, seoAvg: 89, readabilityAvg: 86, words: 21400 },
  { month: 'Sep', generated: 15, published: 12, seoAvg: 92, readabilityAvg: 88, words: 24800 },
];

export function filterDashboardBlogs<T extends DashboardBlogItem>(
  blogs: T[],
  options: {
    statusFilter: 'all' | BlogStatus;
    siteFilter: string;
    articleSearch: string;
  }
): T[] {
  const { statusFilter, siteFilter, articleSearch } = options;
  const query = articleSearch.trim().toLowerCase();

  return blogs.filter((blog) => {
    const normalizedStatus = (blog.status || '').toLowerCase();
    if (statusFilter !== 'all' && normalizedStatus !== statusFilter) return false;

    if (siteFilter !== 'all') {
      const bSite = blog.websiteId || blog.websiteName;
      if (bSite !== siteFilter && blog.websiteName !== siteFilter) return false;
    }

    if (query) {
      const matchTitle = (blog.title || '').toLowerCase().includes(query);
      const matchSite = (blog.websiteName || '').toLowerCase().includes(query);
      const matchCat = (blog.category || '').toLowerCase().includes(query);
      if (!matchTitle && !matchSite && !matchCat) return false;
    }

    return true;
  });
}

export function mapStatusToOrreryStage(statusFilter: 'all' | BlogStatus): number {
  if (statusFilter === 'pending_approval' || statusFilter === 'draft') return 1;
  if (statusFilter === 'approved') return 2;
  if (statusFilter === 'published') return 3;
  return 0;
}

export function mapOrreryStageToStatus(stageIndex: number): 'all' | BlogStatus {
  const map: ('all' | BlogStatus)[] = ['all', 'pending_approval', 'approved', 'published'];
  return map[stageIndex] ?? 'all';
}

export function getTelemetrySeries(
  timeframe: '3M' | '6M',
  series: TelemetryPoint[] = TELEMETRY_SERIES
): TelemetryPoint[] {
  if (timeframe === '3M') return series.slice(-3);
  return series;
}

export function buildTelemetryCsv(rows: TelemetryPoint[]): string {
  const header = 'Month,Generated,Published,SEO,Readability,Words';
  const body = rows.map(
    (r) => `${r.month},${r.generated},${r.published},${r.seoAvg},${r.readabilityAvg},${r.words}`
  );
  return [header, ...body].join('\n');
}
