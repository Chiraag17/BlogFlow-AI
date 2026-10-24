'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FileText, Globe, Clock, CheckCircle, BarChart3,
  TrendingUp, ArrowRight, Sparkles, Send, Eye,
  CheckCircle2, Download, Search, Filter, Plus,
  BookOpen, X, ExternalLink, Layers, PenTool,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { DEMO_ANALYTICS } from '@/lib/mock-data';
import { getStatusLabel, timeAgo, truncate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { BlogStatus } from '@/types';

const TOPIC_SUGGESTIONS = [
  {
    topic: 'Agentic RAG Architectures in Production Systems',
    category: 'Artificial Intelligence',
  },
  {
    topic: 'Zero-Trust Cloud Security Posture in 2026',
    category: 'Cloud & Security',
  },
  {
    topic: 'Edge Compute & Core Web Vitals Optimization Guide',
    category: 'Web Engineering',
  },
];

const TELEMETRY_SERIES = [
  { month: 'Apr', generated: 6, published: 4, seoAvg: 81, readabilityAvg: 78, words: 9400 },
  { month: 'May', generated: 8, published: 6, seoAvg: 84, readabilityAvg: 80, words: 12800 },
  { month: 'Jun', generated: 10, published: 8, seoAvg: 86, readabilityAvg: 82, words: 16200 },
  { month: 'Jul', generated: 9, published: 7, seoAvg: 85, readabilityAvg: 84, words: 14500 },
  { month: 'Aug', generated: 13, published: 10, seoAvg: 89, readabilityAvg: 86, words: 21400 },
  { month: 'Sep', generated: 15, published: 12, seoAvg: 92, readabilityAvg: 88, words: 24800 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isDark } = useTheme();

  const storeBlogs = useAppStore((s) => s.blogs);
  const storeWebsites = useAppStore((s) => s.websites);
  const storeQualityReports = useAppStore((s) => s.qualityReports);
  const updateBlogStatus = useAppStore((s) => s.updateBlogStatus);

  const [dbData, setDbData] = useState<any>(null);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Quick-Dispatch Brief Launcher state
  const [quickTopic, setQuickTopic] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');

  // Interactive Telemetry Controls
  const [chartMetric, setChartMetric] = useState<'velocity' | 'seo' | 'words'>('velocity');
  const [timeframe, setTimeframe] = useState<'3M' | '6M'>('6M');

  // Interactive Pipeline Table Controls
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [articleSearch, setArticleSearch] = useState('');
  const [inspectBlog, setInspectBlog] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setDbData(json.data);
          setIsDbConnected(Boolean(json.data.isDatabaseConnected));
        }
      })
      .catch(() => {
        setIsDbConnected(false);
      });
  }, []);

  // Merge DB blogs with store blogs so interactive triage works seamlessly
  const allBlogs = useMemo(() => {
    if (isDbConnected && dbData?.recentBlogs?.length > 0) {
      return dbData.recentBlogs.map((b: any) => ({
        ...b,
        websiteName: b.websiteName || b.website?.name || 'TechPulse',
        wordCount: b.wordCount || 1650,
        readingTime: b.readingTime || 7,
        seoScore: b.seoScore || 88,
        readabilityScore: b.readabilityScore || 84,
        updatedAt: b.updatedAt || b.date || new Date().toISOString(),
      }));
    }
    return [...storeBlogs].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [isDbConnected, dbData, storeBlogs]);

  const activeWebsites = storeWebsites;

  useEffect(() => {
    if (!selectedSiteId && activeWebsites.length > 0) {
      setSelectedSiteId(activeWebsites[0].id);
    }
  }, [activeWebsites, selectedSiteId]);

  const totalBlogsCount = isDbConnected && dbData?.stats ? dbData.stats.totalBlogs : storeBlogs.length;
  const pendingCount = storeBlogs.filter((b) => b.status === 'pending_approval').length;
  const approvedCount = storeBlogs.filter((b) => b.status === 'approved').length;
  const publishedCount = isDbConnected && dbData?.stats ? dbData.stats.publishedBlogs : storeBlogs.filter((b) => b.status === 'published').length;
  const draftCount = storeBlogs.filter((b) => b.status === 'draft').length;
  const websitesCount = isDbConnected && dbData?.stats ? dbData.stats.connectedWebsites : storeWebsites.length;

  const avgSeoScore = useMemo(() => {
    if (!storeQualityReports.length) return 88;
    return Math.round(
      storeQualityReports.reduce((acc, q) => acc + (q.seoScore || 88), 0) /
        storeQualityReports.length
    );
  }, [storeQualityReports]);

  const totalWordsGenerated = useMemo(() => {
    return storeBlogs.reduce((acc, b) => acc + (b.wordCount || 1500), 0);
  }, [storeBlogs]);

  // Filtered Telemetry Data
  const chartData = useMemo(() => {
    if (timeframe === '3M') return TELEMETRY_SERIES.slice(-3);
    return TELEMETRY_SERIES;
  }, [timeframe]);

  // Filtered Pipeline Articles
  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((blog: any) => {
      const normalizedStatus = (blog.status || '').toLowerCase();
      if (statusFilter !== 'all' && normalizedStatus !== statusFilter) return false;
      if (siteFilter !== 'all') {
        const bSite = blog.websiteId || blog.websiteName;
        if (bSite !== siteFilter && blog.websiteName !== siteFilter) return false;
      }
      if (articleSearch.trim()) {
        const q = articleSearch.toLowerCase();
        const matchTitle = (blog.title || '').toLowerCase().includes(q);
        const matchSite = (blog.websiteName || '').toLowerCase().includes(q);
        const matchCat = (blog.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSite && !matchCat) return false;
      }
      return true;
    });
  }, [allBlogs, statusFilter, siteFilter, articleSearch]);

  // Quick-Dispatch Handler
  const handleQuickDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickTopic.trim()) params.set('topic', quickTopic.trim());
    if (selectedSiteId) params.set('websiteId', selectedSiteId);
    router.push(`/generator?${params.toString()}`);
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = ['Month,Generated Articles,Published Articles,Avg SEO Score,Avg Readability,Total Words'];
    const rows = chartData.map(
      (r) => `${r.month},${r.generated},${r.published},${r.seoAvg},${r.readabilityAvg},${r.words}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `blogflow-editorial-telemetry-${timeframe.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${timeframe} editorial telemetry report to CSV.`);
  };

  // Inline Status Change Handler (Approve / Publish)
  const handleInlineStatusUpdate = (blog: any, nextStatus: BlogStatus) => {
    updateBlogStatus(blog.id, nextStatus);
    if (dbData?.recentBlogs) {
      setDbData((prev: any) => ({
        ...prev,
        recentBlogs: prev.recentBlogs.map((item: any) =>
          item.id === blog.id ? { ...item, status: nextStatus } : item
        ),
      }));
    }
    if (inspectBlog?.id === blog.id) {
      setInspectBlog((prev: any) => (prev ? { ...prev, status: nextStatus } : null));
    }
    const actionLabel = nextStatus === 'approved' ? 'Approved manuscript' : 'Published manuscript live';
    triggerToast(`${actionLabel}: "${truncate(blog.title, 38)}"`);
  };

  const firstName = ((session?.user as any)?.name || 'Editor').split(' ')[0];
  const primaryStroke = isDark ? '#B8D5C5' : '#163F32';
  const brassStroke = isDark ? '#D4AF67' : '#C8A15A';
  const gridStroke = isDark ? 'rgba(235, 242, 237, 0.08)' : '#E8E4DA';
  const tickColor = isDark ? '#8E9E95' : '#68736D';

  const pipelineChapters = [
    { num: '01', label: 'Research & Briefs', count: activeWebsites.length * 3, filter: 'all' as const },
    { num: '02', label: 'Drafts & Pending', count: draftCount + pendingCount, filter: 'pending_approval' as const },
    { num: '03', label: 'Approved Gate', count: approvedCount, filter: 'approved' as const },
    { num: '04', label: 'Published Live', count: publishedCount, filter: 'published' as const },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#163F32] text-[#F3F0E8] border border-[#C8A15A]/40 shadow-xl text-xs font-medium animate-slide-up">
          <CheckCircle2 size={15} className="text-[#C8A15A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================
          SECTION 1: EXECUTIVE MASTHEAD & QUICK-DISPATCH BRIEF LAUNCHER
          ============================================================ */}
      <div className="card p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1.5">
              <span>Editorial Command Desk</span>
              <span>·</span>
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>·</span>
              <span className="text-[var(--color-primary)] font-medium">
                {isDbConnected ? 'PostgreSQL Persistent Mode' : 'Live Studio Workspace'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight font-editorial text-[var(--color-text)]">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName}.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/research" className="btn btn-secondary btn-sm">
              <Search size={14} />
              <span>Discover Topics</span>
            </Link>
            <Link href="/approvals" className="btn btn-secondary btn-sm">
              <CheckCircle size={14} />
              <span>Approval Queue ({pendingCount})</span>
            </Link>
            <Link href="/websites" className="btn btn-secondary btn-sm">
              <Globe size={14} />
              <span>Manage Sites ({websitesCount})</span>
            </Link>
          </div>
        </div>

        {/* Inline Quick-Dispatch Topic Bar */}
        <form onSubmit={handleQuickDispatch} className="pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <label
              htmlFor="quick-dispatch-input"
              className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-2"
            >
              <PenTool size={13} className="text-[var(--color-accent)]" />
              <span>Quick-Dispatch Article Brief</span>
            </label>
            <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">
              Pre-fills the multi-agent Blog Generator with your topic and target publication
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <input
                id="quick-dispatch-input"
                type="text"
                value={quickTopic}
                onChange={(e) => setQuickTopic(e.target.value)}
                placeholder="Enter a headline, keyword, or research thesis to draft…"
                className="form-input h-10 text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="form-select h-10 text-sm"
                aria-label="Target publication"
              >
                {activeWebsites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.niche})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <select
                value={selectedLength}
                onChange={(e) => setSelectedLength(e.target.value as any)}
                className="form-select h-10 text-sm flex-1"
                aria-label="Target length"
              >
                <option value="short">Short (~800w)</option>
                <option value="medium">Medium (~1,500w)</option>
                <option value="long">Deep (~2,500w)</option>
              </select>

              <button
                type="submit"
                className="btn btn-primary h-10 px-4 whitespace-nowrap shrink-0"
              >
                <span>Draft</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Clickable Trending Brief Suggestions */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text-secondary)]">Suggested briefs:</span>
            {TOPIC_SUGGESTIONS.map((item, idx) => (
              <button
                key={item.topic}
                type="button"
                onClick={() => setQuickTopic(item.topic)}
                className="text-left hover:text-[var(--color-primary)] transition-colors cursor-pointer underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-primary)]"
              >
                0{idx + 1}. {item.topic}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* ============================================================
          SECTION 2: 4-COLUMN ARCHITECTURAL KPI LEDGER
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Manuscripts */}
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className="card p-5 text-left hover:border-[var(--color-primary)] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              01 · Total Manuscripts
            </span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#163F32]/10 dark:bg-[#B8D5C5]/15 text-[#163F32] dark:text-[#B8D5C5]">
              <FileText size={17} />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[var(--color-text)]">
            {totalBlogsCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="tabular-nums">{totalWordsGenerated.toLocaleString()} total words</span>
            <span className="text-[var(--color-primary)] font-medium group-hover:translate-x-0.5 transition-transform">
              Filter all →
            </span>
          </div>
        </button>

        {/* Card 2: Pending Approval */}
        <button
          type="button"
          onClick={() => setStatusFilter('pending_approval')}
          className="card p-5 text-left hover:border-[var(--color-primary)] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              02 · Pending Editorial Review
            </span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#C8A15A]/15 text-[#9A7332] dark:text-[#D4AF67]">
              <Clock size={17} />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[var(--color-text)]">
            {pendingCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="tabular-nums">{approvedCount} approved & ready</span>
            <span className="text-[var(--color-primary)] font-medium group-hover:translate-x-0.5 transition-transform">
              Triage queue →
            </span>
          </div>
        </button>

        {/* Card 3: Published Live */}
        <button
          type="button"
          onClick={() => setStatusFilter('published')}
          className="card p-5 text-left hover:border-[var(--color-primary)] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              03 · Published Articles
            </span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#163F32] text-[#F3F0E8] dark:bg-[#B8D5C5] dark:text-[#101714]">
              <CheckCircle size={17} />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[var(--color-text)]">
            {publishedCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="tabular-nums">Avg SEO {avgSeoScore}/100</span>
            <span className="text-[var(--color-primary)] font-medium group-hover:translate-x-0.5 transition-transform">
              View live →
            </span>
          </div>
        </button>

        {/* Card 4: Connected Publications */}
        <Link
          href="/websites"
          className="card p-5 text-left hover:border-[var(--color-primary)] transition-colors group block"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              04 · Connected Publications
            </span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#C8A15A]/20 text-[#8A6421] dark:text-[#D4AF67]">
              <Globe size={17} />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[var(--color-text)]">
            {websitesCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>WordPress REST & Webhooks</span>
            <span className="text-[var(--color-primary)] font-medium group-hover:translate-x-0.5 transition-transform">
              Configure →
            </span>
          </div>
        </Link>
      </div>

      {/* ============================================================
          SECTION 3: INTERACTIVE TELEMETRY & WEEKLY CADENCE STUDIO
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Interactive Telemetry Studio */}
        <div className="lg:col-span-7 card flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--color-border)]">
            <div>
              <h3 className="card-title flex items-center gap-2">
                <TrendingUp size={16} className="text-[var(--color-primary)]" />
                <span>Editorial Output & Quality Telemetry</span>
              </h3>
              <p className="card-subtitle">
                Switch between manuscript velocity, SEO quality trajectory, and word volume
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Switcher */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
                {(
                  [
                    { id: 'velocity', label: 'Velocity' },
                    { id: 'seo', label: 'SEO Score' },
                    { id: 'words', label: 'Words' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setChartMetric(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      chartMetric === tab.id
                        ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Timeframe Switcher */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
                {(['3M', '6M'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                      timeframe === tf
                        ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="btn btn-secondary btn-sm py-1.5 px-2.5 text-xs"
                title="Export telemetry CSV"
              >
                <Download size={13} />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="editorialPrimaryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryStroke} stopOpacity={0.24} />
                    <stop offset="95%" stopColor={primaryStroke} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="editorialBrassFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brassStroke} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={brassStroke} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#151E1A' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(235,242,237,0.15)' : '#E2DDD2'}`,
                    borderRadius: '8px',
                    color: isDark ? '#F3F0E8' : '#18211D',
                    fontSize: '12px',
                  }}
                />
                {chartMetric === 'velocity' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="generated"
                      name="Generated Drafts"
                      stroke={brassStroke}
                      strokeWidth={2}
                      fill="url(#editorialBrassFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="published"
                      name="Published Live"
                      stroke={primaryStroke}
                      strokeWidth={2.2}
                      fill="url(#editorialPrimaryFill)"
                    />
                  </>
                )}
                {chartMetric === 'seo' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="seoAvg"
                      name="Avg SEO Score"
                      stroke={primaryStroke}
                      strokeWidth={2.2}
                      fill="url(#editorialPrimaryFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="readabilityAvg"
                      name="Readability Index"
                      stroke={brassStroke}
                      strokeWidth={2}
                      fill="url(#editorialBrassFill)"
                    />
                  </>
                )}
                {chartMetric === 'words' && (
                  <Area
                    type="monotone"
                    dataKey="words"
                    name="Words Drafted"
                    stroke={primaryStroke}
                    strokeWidth={2.2}
                    fill="url(#editorialPrimaryFill)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 mt-2 border-t border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 inline-block" style={{ background: primaryStroke }} />
                <span>{chartMetric === 'velocity' ? 'Published Live' : chartMetric === 'seo' ? 'Avg SEO Score' : 'Total Words'}</span>
              </span>
              {chartMetric !== 'words' && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 inline-block" style={{ background: brassStroke }} />
                  <span>{chartMetric === 'velocity' ? 'Generated Drafts' : 'Readability Index'}</span>
                </span>
              )}
            </div>
            <span className="font-mono tabular-nums">
              Peak output: 24,800 words / month
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Weekly Publishing Cadence & 7-Day Schedule Strip */}
        <div className="lg:col-span-5 card flex flex-col justify-between">
          <div className="pb-4 mb-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h3 className="card-title flex items-center gap-2">
                <BarChart3 size={16} className="text-[var(--color-accent)]" />
                <span>Weekly Publishing Cadence</span>
              </h3>
              <p className="card-subtitle">
                Daily generation vs. WordPress publication throughput
              </p>
            </div>
            <Link
              href="/automation"
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline whitespace-nowrap"
            >
              Automation →
            </Link>
          </div>

          <div style={{ width: '100%', height: 195 }}>
            <ResponsiveContainer>
              <BarChart data={DEMO_ANALYTICS.publishingActivity} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#151E1A' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(235,242,237,0.15)' : '#E2DDD2'}`,
                    borderRadius: '8px',
                    color: isDark ? '#F3F0E8' : '#18211D',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="generated"
                  fill={isDark ? 'rgba(212, 175, 103, 0.45)' : '#E5DEC9'}
                  radius={[4, 4, 0, 0]}
                  name="Generated"
                />
                <Bar
                  dataKey="published"
                  fill={primaryStroke}
                  radius={[4, 4, 0, 0]}
                  name="Published"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 7-Day Cadence Strip */}
          <div className="pt-3 mt-2 border-t border-[var(--color-border-light)]">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-2">
              <span>7-Day Editorial Slot Matrix</span>
              <Link href="/generator" className="text-[var(--color-primary)] font-medium hover:underline">
                + Fill open slot
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DEMO_ANALYTICS.publishingActivity.map((day) => {
                const active = day.published > 0;
                return (
                  <div
                    key={day.date}
                    className={`rounded-md p-1.5 text-center border ${
                      active
                        ? 'border-[var(--color-border)] bg-[var(--color-bg-muted)]'
                        : 'border-dashed border-[var(--color-border)] opacity-60'
                    }`}
                  >
                    <div className="text-[10px] text-[var(--color-text-muted)]">{day.date}</div>
                    <div className="text-xs font-mono font-semibold tabular-nums text-[var(--color-text)] mt-0.5">
                      {day.published}/{day.generated}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 4: 4-STAGE PIPELINE BOARD & CONTENT HEALTH LEDGER
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Cols: Interactive 4-Stage Pipeline Board + Inline Approval Triage */}
        <div className="lg:col-span-8 card">
          {/* Hairline Chapter Index Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 mb-5 border-b border-[var(--color-border)]">
            {pipelineChapters.map((ch) => {
              const isSelected = statusFilter === ch.filter;
              return (
                <button
                  key={ch.num}
                  type="button"
                  onClick={() => setStatusFilter(ch.filter)}
                  className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                      : 'border-[var(--color-border-light)] hover:border-[var(--color-border)] bg-[var(--color-bg)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
                    <span>{ch.num}</span>
                    <span className="tabular-nums font-semibold text-[var(--color-text)]">
                      {ch.count}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[var(--color-text)] mt-1 truncate">
                    {ch.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border)] overflow-x-auto">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'pending_approval', label: 'Pending Review' },
                  { key: 'approved', label: 'Approved' },
                  { key: 'published', label: 'Published' },
                  { key: 'draft', label: 'Drafts' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === tab.key
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  type="text"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Filter manuscripts…"
                  className="form-input py-1.5 pl-8 pr-3 text-xs w-44 sm:w-52"
                />
              </div>

              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="form-select py-1.5 px-2.5 text-xs w-36"
                aria-label="Filter by website"
              >
                <option value="all">All Publications</option>
                {activeWebsites.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pipeline Manuscript Table */}
          {filteredBlogs.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[var(--color-border)] rounded-lg">
              <p className="text-sm font-medium text-[var(--color-text)]">
                No manuscripts match the active filter.
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-4">
                Try clearing the filter or dispatch a new article brief above.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSiteFilter('all');
                  setArticleSearch('');
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-light)]">
              {filteredBlogs.slice(0, 6).map((blog: any) => {
                const rawStatus = (blog.status || 'draft').toLowerCase() as BlogStatus;
                const seo = blog.seoScore || 88;
                const words = blog.wordCount || 1650;
                return (
                  <div
                    key={blog.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--color-bg)]/50 px-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setInspectBlog(blog)}
                        className="text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] text-left truncate block max-w-full cursor-pointer"
                      >
                        {blog.title}
                      </button>
                      {/* Zero-Pill Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-1">
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          {blog.websiteName || 'TechPulse'}
                        </span>
                        <span>·</span>
                        <span>{blog.category || 'Editorial'}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{words.toLocaleString()}w</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">SEO {seo}/100</span>
                        <span>·</span>
                        <span>{timeAgo(blog.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Right: Status & One-Click Inline Triage Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)] mr-1">
                        {getStatusLabel(rawStatus)}
                      </span>

                      {(rawStatus === 'pending_approval' || rawStatus === 'draft') && (
                        <button
                          type="button"
                          onClick={() => handleInlineStatusUpdate(blog, 'approved')}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#163F32]/10 dark:bg-[#B8D5C5]/15 text-[#163F32] dark:text-[#B8D5C5] hover:bg-[#163F32] hover:text-white dark:hover:bg-[#B8D5C5] dark:hover:text-[#101714] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Approve
                        </button>
                      )}

                      {rawStatus === 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleInlineStatusUpdate(blog, 'published')}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#163F32] text-white dark:bg-[#B8D5C5] dark:text-[#101714] hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                        >
                          Publish
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setInspectBlog(blog)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 mt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-muted)] tabular-nums">
              Showing {Math.min(6, filteredBlogs.length)} of {filteredBlogs.length} manuscripts
            </span>
            <Link
              href="/content"
              className="font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              <span>Open Full Content Library</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Content Health Audit + Connected Publications Ledger */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card A: Editorial Pipeline Distribution & Quality Audit */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Pipeline Health & SEO Audit</h3>
                <p className="card-subtitle">Stage allocation & quality guardrails</p>
              </div>
              <span className="text-xs font-mono tabular-nums font-semibold text-[var(--color-primary)]">
                {avgSeoScore}/100 Avg
              </span>
            </div>

            {/* Stacked Horizontal Progress Bar (Replacing Rainbow Donut) */}
            <div className="h-2.5 w-full rounded-full bg-[var(--color-bg-muted)] overflow-hidden flex mb-4">
              <div
                style={{ width: '52%', background: isDark ? '#B8D5C5' : '#163F32' }}
                title="Published (52%)"
              />
              <div
                style={{ width: '24%', background: isDark ? '#D4AF67' : '#C8A15A' }}
                title="Approved & Scheduled (24%)"
              />
              <div
                style={{ width: '24%', background: isDark ? '#4B6358' : '#94A69C' }}
                title="Drafts & Pending Review (24%)"
              />
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Published Manuscripts', count: publishedCount, pct: '52%', color: isDark ? '#B8D5C5' : '#163F32' },
                { label: 'Approved & Ready', count: approvedCount, pct: '24%', color: isDark ? '#D4AF67' : '#C8A15A' },
                { label: 'Pending Editorial Gate', count: pendingCount, pct: '14%', color: isDark ? '#76877E' : '#76827C' },
                { label: 'Working Drafts', count: draftCount, pct: '10%', color: isDark ? '#4B6358' : '#A5B2AA' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1 border-b border-[var(--color-border-light)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs inline-block" style={{ background: row.color }} />
                    <span className="text-[var(--color-text-secondary)]">{row.label}</span>
                  </div>
                  <div className="font-mono tabular-nums text-[var(--color-text)] font-semibold">
                    {row.count} <span className="text-[var(--color-text-muted)] font-normal">({row.pct})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quality Benchmarks */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-light)]">
                <div className="text-[11px] text-[var(--color-text-muted)]">SEO Threshold</div>
                <div className="text-base font-bold font-mono tabular-nums text-[var(--color-text)] mt-0.5">
                  {avgSeoScore}% <span className="text-xs font-normal text-[var(--color-primary)]">Pass</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-light)]">
                <div className="text-[11px] text-[var(--color-text-muted)]">Primary Citations</div>
                <div className="text-base font-bold font-mono tabular-nums text-[var(--color-text)] mt-0.5">
                  100% <span className="text-xs font-normal text-[var(--color-primary)]">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Connected Publications Ledger */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Connected Publications</h3>
                <p className="card-subtitle">Click a site to launch a targeted draft</p>
              </div>
              <Link
                href="/websites"
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                + Add Site
              </Link>
            </div>

            <div className="divide-y divide-[var(--color-border-light)]">
              {activeWebsites.slice(0, 4).map((site) => (
                <div
                  key={site.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[var(--color-text)] truncate">
                      {site.name}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] truncate">
                      {site.url} · {site.niche}
                    </div>
                  </div>
                  <Link
                    href={`/generator?websiteId=${encodeURIComponent(site.id)}`}
                    className="px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap shrink-0"
                  >
                    Draft →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          INLINE MANUSCRIPT & SEO INSPECTOR MODAL
          ============================================================ */}
      {inspectBlog && (
        <div
          className="modal-overlay"
          onClick={() => setInspectBlog(null)}
        >
          <div
            className="modal modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {inspectBlog.websiteName || 'TechPulse'} · {inspectBlog.category || 'Editorial'} ·{' '}
                  {getStatusLabel((inspectBlog.status || 'draft').toLowerCase())}
                </div>
                <h3 className="modal-title mt-0.5">{inspectBlog.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectBlog(null)}
                className="btn-ghost p-1.5 rounded-lg cursor-pointer"
                aria-label="Close inspector"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body space-y-4">
              {/* Telemetry Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text-muted)]">Word Count</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text)]">
                    {(inspectBlog.wordCount || 1650).toLocaleString()} words
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text-muted)]">SEO Score</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-primary)]">
                    {inspectBlog.seoScore || 88}/100
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text-muted)]">Readability</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text)]">
                    {inspectBlog.readabilityScore || 84}/100
                  </div>
                </div>
              </div>

              {/* Meta Description */}
              {inspectBlog.metaDescription && (
                <div className="p-3.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    SEO Meta Description
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {inspectBlog.metaDescription}
                  </p>
                </div>
              )}

              {/* Excerpt / Content Preview */}
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                  Manuscript Excerpt
                </div>
                <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] leading-relaxed max-h-56 overflow-y-auto">
                  {inspectBlog.excerpt ||
                    'This long-form editorial manuscript is structured with primary-source citations, H2/H3 hierarchy, and automated FAQ schema ready for WordPress REST publication.'}
                </div>
              </div>
            </div>

            <div className="modal-footer justify-between">
              <Link
                href="/content"
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
              >
                <span>Open in Content Library</span>
                <ExternalLink size={13} />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectBlog(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                {((inspectBlog.status || '').toLowerCase() === 'pending_approval' ||
                  (inspectBlog.status || '').toLowerCase() === 'draft') && (
                  <button
                    type="button"
                    onClick={() => handleInlineStatusUpdate(inspectBlog, 'approved')}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle size={14} />
                    <span>Approve Manuscript</span>
                  </button>
                )}
                {(inspectBlog.status || '').toLowerCase() === 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleInlineStatusUpdate(inspectBlog, 'published')}
                    className="btn btn-primary btn-sm"
                  >
                    <Send size={14} />
                    <span>Publish to WordPress</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
