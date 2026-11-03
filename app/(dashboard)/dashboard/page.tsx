'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Globe,
  Clock,
  CheckCircle,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Send,
  CheckCircle2,
  Download,
  Search,
  X,
  ExternalLink,
  Stamp,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { DEMO_ANALYTICS } from '@/lib/mock-data';
import { getStatusLabel, timeAgo, truncate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { BlogStatus } from '@/types';
import EditorialOrrery3D from '@/components/dashboard/EditorialOrrery3D';
import GutenbergTypeBlock3D from '@/components/brand/GutenbergTypeBlock3D';

const TOPIC_PRESETS = [
  { label: 'Agentic RAG', topic: 'Agentic RAG Architectures in Production Systems' },
  { label: 'Zero-Trust Cloud', topic: 'Zero-Trust Cloud Security Posture in 2026' },
  { label: 'Edge Compute', topic: 'Edge Compute & Core Web Vitals Optimization Guide' },
];

const TELEMETRY_SERIES = [
  { month: 'Apr', generated: 6, published: 4, seoAvg: 81, readabilityAvg: 78, words: 9400 },
  { month: 'May', generated: 8, published: 6, seoAvg: 84, readabilityAvg: 80, words: 12800 },
  { month: 'Jun', generated: 10, published: 8, seoAvg: 86, readabilityAvg: 82, words: 16200 },
  { month: 'Jul', generated: 9, published: 7, seoAvg: 85, readabilityAvg: 84, words: 14500 },
  { month: 'Aug', generated: 13, published: 10, seoAvg: 89, readabilityAvg: 86, words: 21400 },
  { month: 'Sep', generated: 15, published: 12, seoAvg: 92, readabilityAvg: 88, words: 24800 },
];

/**
 * 3D Sculpted Metric Monolith with Multi-Layer Parallax, Counter-Moving Depth Plane,
 * Dynamic Brass Specular Glare & Edge Rim Glow, and Independent Z-Depth Elements
 */
function MetricMonolith3D({
  label,
  value,
  progressPct,
  accentColor,
  icon: Icon,
  active,
  onClick,
  href,
}: {
  label: string;
  value: number | string;
  progressPct: number;
  accentColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({
    rx: 0,
    ry: 0,
    dx: 0,
    dy: 0,
    gx: 50,
    gy: 50,
    hovered: false,
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const dx = px - 0.5; // [-0.5, 0.5]
    const dy = py - 0.5; // [-0.5, 0.5]

    setTilt({
      rx: -dy * 14,
      ry: dx * 14,
      dx,
      dy,
      gx: px * 100,
      gy: py * 100,
      hovered: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt({
      rx: 0,
      ry: 0,
      dx: 0,
      dy: 0,
      gx: 50,
      gy: 50,
      hovered: false,
    });
  };

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(8, Math.min(100, progressPct));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const layerTransition = tilt.hovered
    ? 'transform 65ms linear, text-shadow 200ms ease, filter 200ms ease'
    : 'transform 460ms cubic-bezier(0.16, 1, 0.3, 1), text-shadow 300ms ease, filter 300ms ease';

  const content = (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className={`card p-5 relative cursor-pointer select-none transition-colors ${
        active
          ? 'border-[#C8A15A] ring-1 ring-[#C8A15A]/45'
          : 'hover:border-[#C8A15A]/50'
      }`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) translateZ(${
          tilt.hovered ? '10px' : '0px'
        })`,
        transformStyle: 'preserve-3d',
        boxShadow: tilt.hovered
          ? `${(-tilt.dx * 16).toFixed(1)}px ${(-tilt.dy * 16 + 14).toFixed(
              1
            )}px 32px -8px rgba(0, 0, 0, 0.34), 0 0 22px -6px rgba(200, 161, 90, 0.22)`
          : undefined,
        transition: tilt.hovered
          ? 'transform 65ms linear, box-shadow 120ms linear, border-color 200ms ease'
          : 'transform 460ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 460ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms ease',
      }}
    >
      {/* Clipped Surface Backdrop for Counter-Moving Plane & Specular Glare */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden">
        {/* Layer 0: Counter-Moving Recessed Ambient Depth Plane (-dx, -dy) */}
        <div
          className="absolute -inset-6 transition-opacity duration-300"
          style={{
            opacity: tilt.hovered ? 1 : 0,
            transform: `translate3d(${(-tilt.dx * 22).toFixed(1)}px, ${(
              -tilt.dy * 22
            ).toFixed(1)}px, -12px)`,
            transition: layerTransition,
            background: `radial-gradient(180px circle at ${100 - tilt.gx}% ${
              100 - tilt.gy
            }%, ${accentColor}22, transparent 70%)`,
          }}
        />

        {/* Layer 1A: Cursor-Tracked Dynamic Brass Specular Glare */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: tilt.hovered ? 1 : 0,
            background: `radial-gradient(240px circle at ${tilt.gx}% ${tilt.gy}%, rgba(200, 161, 90, 0.24), ${accentColor}14 45%, transparent 72%)`,
          }}
        />
      </div>

      {/* Layer 1B: Dynamic Brass & Accent Edge Rim Glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: tilt.hovered ? 1 : 0,
          padding: '1.25px',
          background: `radial-gradient(170px circle at ${tilt.gx}% ${tilt.gy}%, #C8A15A, ${accentColor} 55%, transparent 80%)`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      <div
        className="relative flex items-center justify-between gap-4"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Left Column: Independent Z-Depth Label & Tabular Metric Number */}
        <div style={{ transformStyle: 'preserve-3d' }}>
          {/* Layer 2: 1-Word Label (Z: 20px) */}
          <span
            className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1"
            style={{
              transform: `translate3d(${(tilt.dx * 6).toFixed(1)}px, ${(
                tilt.dy * 6
              ).toFixed(1)}px, ${tilt.hovered ? '20px' : '0px'})`,
              transition: layerTransition,
            }}
          >
            {label}
          </span>

          {/* Layer 3: Tabular Metric Number (Z: 36px) */}
          <div
            className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[var(--color-text)] leading-none"
            style={{
              transform: `translate3d(${(tilt.dx * 13).toFixed(1)}px, ${(
                tilt.dy * 13
              ).toFixed(1)}px, ${tilt.hovered ? '36px' : '0px'})`,
              textShadow: tilt.hovered
                ? `${(-tilt.dx * 6).toFixed(1)}px ${(-tilt.dy * 6 + 4).toFixed(
                    1
                  )}px 14px rgba(0, 0, 0, 0.28)`
                : 'none',
              transition: layerTransition,
            }}
          >
            {value}
          </div>
        </div>

        {/* Right Column: Independent Z-Depth Radial Ring & Floating Center Icon */}
        <div
          className="relative w-16 h-16 flex items-center justify-center shrink-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Layer 4: 3D SVG Radial Progress Ring (Z: 28px) */}
          <svg
            className="w-16 h-16 -rotate-90"
            viewBox="0 0 68 68"
            style={{
              transform: `translate3d(${(tilt.dx * 9).toFixed(1)}px, ${(
                tilt.dy * 9
              ).toFixed(1)}px, ${tilt.hovered ? '28px' : '0px'})`,
              filter: tilt.hovered
                ? `drop-shadow(${(-tilt.dx * 5).toFixed(1)}px ${(
                    -tilt.dy * 5 +
                    4
                  ).toFixed(1)}px 6px rgba(0, 0, 0, 0.28))`
                : 'none',
              transition: layerTransition,
            }}
          >
            <circle
              cx="34"
              cy="34"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4.5"
              className="text-[var(--color-border)] opacity-45"
            />
            <motion.circle
              cx="34"
              cy="34"
              r={radius}
              fill="none"
              stroke={accentColor}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          {/* Layer 5: Highest-Depth Floating Center Icon (Z: 44px) */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              color: accentColor,
              transform: `translate3d(${(tilt.dx * 17).toFixed(1)}px, ${(
                tilt.dy * 17
              ).toFixed(1)}px, ${tilt.hovered ? '44px' : '0px'})`,
              filter: tilt.hovered
                ? `drop-shadow(0 4px 8px ${accentColor}55)`
                : 'none',
              transition: layerTransition,
            }}
          >
            <Icon size={18} />
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

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

  // 3D Orrery Reactive Impulses
  const [typingPulse, setTypingPulse] = useState(0);
  const [stampPulse, setStampPulse] = useState(0);
  const [stampingBlogId, setStampingBlogId] = useState<string | null>(null);

  // Interactive Telemetry Controls
  const [chartMetric, setChartMetric] = useState<'velocity' | 'seo' | 'words'>('velocity');
  const [timeframe, setTimeframe] = useState<'3M' | '6M'>('6M');

  // 3D Coverflow Carousel Controls
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [articleSearch, setArticleSearch] = useState('');
  const [coverflowIndex, setCoverflowIndex] = useState(0);
  const [inspectBlog, setInspectBlog] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pointer drag state for 3D Coverflow swipe
  const dragStartXRef = useRef<number | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // Merge DB blogs with store blogs
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

  const totalBlogsCount =
    isDbConnected && dbData?.stats ? dbData.stats.totalBlogs : storeBlogs.length;
  const pendingCount = storeBlogs.filter((b) => b.status === 'pending_approval').length;
  const approvedCount = storeBlogs.filter((b) => b.status === 'approved').length;
  const publishedCount =
    isDbConnected && dbData?.stats
      ? dbData.stats.publishedBlogs
      : storeBlogs.filter((b) => b.status === 'published').length;
  const websitesCount =
    isDbConnected && dbData?.stats ? dbData.stats.connectedWebsites : storeWebsites.length;

  const avgSeoScore = useMemo(() => {
    if (!storeQualityReports.length) return 88;
    return Math.round(
      storeQualityReports.reduce((acc, q) => acc + (q.seoScore || 88), 0) /
        storeQualityReports.length
    );
  }, [storeQualityReports]);

  // Map statusFilter <-> 3D Orrery stage index (0..3)
  const activeStageIndex = useMemo(() => {
    if (statusFilter === 'pending_approval' || statusFilter === 'draft') return 1;
    if (statusFilter === 'approved') return 2;
    if (statusFilter === 'published') return 3;
    return 0;
  }, [statusFilter]);

  const handleSelectOrreryStage = (stageIndex: number) => {
    const map: ('all' | BlogStatus)[] = ['all', 'pending_approval', 'approved', 'published'];
    setStatusFilter(map[stageIndex] || 'all');
  };

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

  // Reset coverflow index when filter changes
  useEffect(() => {
    setCoverflowIndex(0);
  }, [statusFilter, siteFilter, articleSearch]);

  const safeCoverflowIndex = useMemo(() => {
    if (filteredBlogs.length === 0) return 0;
    return Math.min(coverflowIndex, filteredBlogs.length - 1);
  }, [coverflowIndex, filteredBlogs.length]);

  const stepCoverflow = (dir: -1 | 1) => {
    if (filteredBlogs.length === 0) return;
    setCoverflowIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return filteredBlogs.length - 1;
      if (next >= filteredBlogs.length) return 0;
      return next;
    });
    setTypingPulse((c) => c + 1);
  };

  // Quick-Dispatch Handler
  const handleQuickDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setStampPulse((p) => p + 1);
    const params = new URLSearchParams();
    if (quickTopic.trim()) params.set('topic', quickTopic.trim());
    if (selectedSiteId) params.set('websiteId', selectedSiteId);
    router.push(`/generator?${params.toString()}`);
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = ['Month,Generated,Published,SEO,Readability,Words'];
    const rows = chartData.map(
      (r) => `${r.month},${r.generated},${r.published},${r.seoAvg},${r.readabilityAvg},${r.words}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `blogflow-telemetry-${timeframe.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${timeframe} CSV`);
  };

  // Inline Status Change Handler with 3D Stamp Animation
  const handleInlineStatusUpdate = (blog: any, nextStatus: BlogStatus) => {
    setStampingBlogId(blog.id);
    setStampPulse((p) => p + 1);

    setTimeout(() => {
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
      setStampingBlogId(null);
      triggerToast(
        `${nextStatus === 'approved' ? 'Approved' : 'Published'}: "${truncate(blog.title, 32)}"`
      );
    }, 340);
  };

  const firstName = ((session?.user as any)?.name || 'Creator').split(' ')[0];
  const primaryStroke = isDark ? '#B8D5C5' : '#163F32';
  const brassStroke = isDark ? '#D4AF67' : '#C8A15A';
  const gridStroke = isDark ? 'rgba(235, 242, 237, 0.08)' : '#E8E4DA';
  const tickColor = isDark ? '#8E9E95' : '#68736D';

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
          SECTION 1: CLEAN 3D COMMAND STAGE (ZERO INSTRUCTIONAL CLUTTER)
          ============================================================ */}
      <div className="card p-6 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left 7 Cols: Minimal Greeting + Single-Line Prompt Bar */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <GutenbergTypeBlock3D
                  size={38}
                  activeFace={
                    activeStageIndex === 0
                      ? 'loupe'
                      : activeStageIndex === 1
                      ? 'nib'
                      : activeStageIndex === 2
                      ? 'seal'
                      : 'monogram'
                  }
                  activityPulse={typingPulse + stampPulse}
                  interactiveStamp={true}
                />
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-editorial text-[var(--color-text)]">
                  Hello, {firstName}.
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/research" className="btn btn-secondary btn-sm">
                  <Search size={14} />
                  <span>Research</span>
                </Link>
                <Link href="/approvals" className="btn btn-secondary btn-sm">
                  <CheckCircle size={14} />
                  <span>Review ({pendingCount})</span>
                </Link>
              </div>
            </div>

            {/* Clean Single-Line Brief Launcher */}
            <form onSubmit={handleQuickDispatch} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <input
                    id="quick-dispatch-input"
                    type="text"
                    value={quickTopic}
                    onChange={(e) => {
                      setQuickTopic(e.target.value);
                      setTypingPulse((c) => c + 1);
                    }}
                    placeholder="New article topic or keyword…"
                    className="form-input h-11 text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={selectedSiteId}
                    onChange={(e) => {
                      setSelectedSiteId(e.target.value);
                      setTypingPulse((c) => c + 1);
                    }}
                    className="form-select h-11 text-sm"
                    aria-label="Target site"
                  >
                    {activeWebsites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-full h-11 px-4 justify-center whitespace-nowrap"
                  >
                    <span>Create</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Compact 2-Word Topic Presets */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {TOPIC_PRESETS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setQuickTopic(item.topic);
                      setTypingPulse((c) => c + 1);
                      setStampPulse((p) => p + 1);
                    }}
                    className="px-2.5 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#C8A15A] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Right 5 Cols: Interactive 3D WebGL Orrery & Press */}
          <div className="lg:col-span-5 flex items-center">
            <EditorialOrrery3D
              activeStageIndex={activeStageIndex}
              onSelectStage={handleSelectOrreryStage}
              typingPulse={typingPulse}
              stampPulse={stampPulse}
              isDark={isDark}
              stageCounts={[
                activeWebsites.length * 3,
                pendingCount,
                approvedCount,
                publishedCount,
              ]}
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 2: 3D METRIC MONOLITHS (RADIAL RINGS + 1-WORD LABELS)
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricMonolith3D
          label="Articles"
          value={totalBlogsCount}
          progressPct={Math.min(100, totalBlogsCount * 12)}
          accentColor={isDark ? '#B8D5C5' : '#163F32'}
          icon={FileText}
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />

        <MetricMonolith3D
          label="Review"
          value={pendingCount}
          progressPct={totalBlogsCount ? Math.round((pendingCount / totalBlogsCount) * 100) : 35}
          accentColor="#C8A15A"
          icon={Clock}
          active={statusFilter === 'pending_approval'}
          onClick={() => setStatusFilter('pending_approval')}
        />

        <MetricMonolith3D
          label="Published"
          value={publishedCount}
          progressPct={avgSeoScore}
          accentColor={isDark ? '#52B788' : '#163F32'}
          icon={CheckCircle}
          active={statusFilter === 'published'}
          onClick={() => setStatusFilter('published')}
        />

        <MetricMonolith3D
          label="Sites"
          value={websitesCount}
          progressPct={Math.min(100, websitesCount * 25)}
          accentColor="#C8A15A"
          icon={Globe}
          href="/websites"
        />
      </div>

      {/* ============================================================
          SECTION 3: 3D COVERFLOW MANUSCRIPT CAROUSEL
          ============================================================ */}
      <div className="card p-6 sm:p-7 overflow-hidden">
        {/* Minimalist Coverflow Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--color-border)]">
          {/* 1-Word Stage Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border)] overflow-x-auto">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'pending_approval', label: 'Review' },
                { key: 'approved', label: 'Approved' },
                { key: 'published', label: 'Published' },
                { key: 'draft', label: 'Drafts' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setTypingPulse((c) => c + 1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'bg-[#163F32] text-[#F3F0E8] dark:bg-[#B8D5C5] dark:text-[#101714] shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Carousel Prev/Next Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                value={articleSearch}
                onChange={(e) => {
                  setArticleSearch(e.target.value);
                  setTypingPulse((c) => c + 1);
                }}
                placeholder="Search…"
                className="form-input py-1.5 pl-8 pr-3 text-xs w-36 sm:w-44"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepCoverflow(-1)}
                aria-label="Previous manuscript"
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:border-[#C8A15A] transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-mono tabular-nums px-2 text-[var(--color-text-muted)]">
                {filteredBlogs.length > 0 ? `${safeCoverflowIndex + 1}/${filteredBlogs.length}` : '0/0'}
              </span>
              <button
                type="button"
                onClick={() => stepCoverflow(1)}
                aria-label="Next manuscript"
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:border-[#C8A15A] transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 3D Coverflow Stage */}
        {filteredBlogs.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-medium text-[var(--color-text)] mb-3">
              No articles in this view.
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
              Reset
            </button>
          </div>
        ) : (
          <div
            className="relative h-[300px] sm:h-[310px] w-full flex items-center justify-center select-none overflow-visible mt-2"
            style={{ perspective: '1400px' }}
            onPointerDown={(e) => {
              dragStartXRef.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (dragStartXRef.current === null) return;
              const delta = e.clientX - dragStartXRef.current;
              dragStartXRef.current = null;
              if (Math.abs(delta) > 40) {
                stepCoverflow(delta < 0 ? 1 : -1);
              }
            }}
          >
            {/* Subtle Ambient Brass Floor Reflection under Center Card */}
            <div
              className="pointer-events-none absolute bottom-2 w-72 h-12 rounded-full blur-2xl"
              style={{
                background: isDark
                  ? 'radial-gradient(circle, rgba(200, 161, 90, 0.25) 0%, transparent 75%)'
                  : 'radial-gradient(circle, rgba(22, 63, 50, 0.16) 0%, transparent 75%)',
              }}
            />

            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {filteredBlogs.map((blog: any, idx: number) => {
                const offset = idx - safeCoverflowIndex;
                if (Math.abs(offset) > 2) return null;

                const isCenter = offset === 0;
                const rawStatus = (blog.status || 'draft').toLowerCase() as BlogStatus;
                const seo = blog.seoScore || 88;
                const words = blog.wordCount || 1650;
                const isStamping = stampingBlogId === blog.id;

                const translateX = offset * 240;
                const translateZ = isCenter ? 55 : -95 - Math.abs(offset) * 45;
                const rotateY = offset * -36;
                const scale = isCenter ? 1 : 0.84;
                const opacity = isCenter ? 1 : Math.abs(offset) === 1 ? 0.68 : 0.35;

                const ringRadius = 20;
                const ringCirc = 2 * Math.PI * ringRadius;
                const ringOffset = ringCirc - (seo / 100) * ringCirc;

                return (
                  <motion.div
                    key={blog.id}
                    initial={false}
                    animate={{
                      x: translateX,
                      z: translateZ,
                      rotateY,
                      scale: isStamping ? 0.92 : scale,
                      opacity,
                    }}
                    transition={{
                      duration: 0.52,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => {
                      if (!isCenter) {
                        setCoverflowIndex(idx);
                        setTypingPulse((c) => c + 1);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      width: 'min(90vw, 410px)',
                      zIndex: 20 - Math.abs(offset),
                      transformStyle: 'preserve-3d',
                    }}
                    className={`rounded-2xl border p-6 transition-shadow ${
                      isCenter ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      isDark
                        ? isCenter
                          ? 'bg-[#121D18] border-[#C8A15A]/65 shadow-[0_26px_60px_-15px_rgba(0,0,0,0.85)]'
                          : 'bg-[#0E1713]/90 border-[var(--color-border)]'
                        : isCenter
                        ? 'bg-[#FCFBF7] border-[#163F32]/45 shadow-[0_24px_55px_-15px_rgba(22,63,50,0.22)]'
                        : 'bg-[#F5F2E9]/90 border-[var(--color-border)]'
                    }`}
                  >
                    {/* Top Row: Site + Status + 3D Circular SEO Gauge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <span className="font-semibold text-[var(--color-text)]">
                          {blog.websiteName || 'TechPulse'}
                        </span>
                        <span>·</span>
                        <span>{getStatusLabel(rawStatus)}</span>
                      </div>

                      {/* Circular SVG SEO Gauge */}
                      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 50 50">
                          <circle
                            cx="25"
                            cy="25"
                            r={ringRadius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            className="text-[var(--color-border)] opacity-40"
                          />
                          <circle
                            cx="25"
                            cy="25"
                            r={ringRadius}
                            fill="none"
                            stroke="#C8A15A"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray={ringCirc}
                            strokeDashoffset={ringOffset}
                          />
                        </svg>
                        <span className="absolute text-[11px] font-mono font-bold tabular-nums text-[var(--color-text)]">
                          {seo}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-base sm:text-lg font-bold font-editorial text-[var(--color-text)] line-clamp-2 leading-snug mb-3">
                      {blog.title}
                    </h4>

                    {/* Concise Meta */}
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-mono tabular-nums mb-5">
                      <span>{words.toLocaleString()}w</span>
                      <span>·</span>
                      <span>{timeAgo(blog.updatedAt)}</span>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--color-border)]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectBlog(blog);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {(rawStatus === 'pending_approval' || rawStatus === 'draft') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInlineStatusUpdate(blog, 'approved');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#163F32] text-[#F3F0E8] dark:bg-[#B8D5C5] dark:text-[#101714] hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            <Stamp size={13} />
                            <span>Approve</span>
                          </button>
                        )}

                        {rawStatus === 'approved' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInlineStatusUpdate(blog, 'published');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C8A15A] text-[#101714] hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            <Send size={13} />
                            <span>Publish</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Coverflow Dots Indicator */}
        {filteredBlogs.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {filteredBlogs.slice(0, 10).map((b: any, idx: number) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Select manuscript ${idx + 1}`}
                onClick={() => setCoverflowIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === safeCoverflowIndex
                    ? 'w-6 bg-[#C8A15A]'
                    : 'w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 4: MINIMALIST VISUAL TELEMETRY (OUTPUT & CADENCE)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Output Trajectory */}
        <div className="lg:col-span-7 card flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--color-border)]">
            <h3 className="card-title flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--color-primary)]" />
              <span>Output</span>
            </h3>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center p-0.5 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
                {(
                  [
                    { id: 'velocity', label: 'Articles' },
                    { id: 'seo', label: 'SEO' },
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

              <button
                type="button"
                onClick={handleExportCsv}
                className="btn btn-secondary btn-sm py-1.5 px-2.5 text-xs"
                title="Export CSV"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 220 }}>
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
                      name="Drafted"
                      stroke={brassStroke}
                      strokeWidth={2}
                      fill="url(#editorialBrassFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="published"
                      name="Published"
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
                      name="SEO"
                      stroke={primaryStroke}
                      strokeWidth={2.2}
                      fill="url(#editorialPrimaryFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="readabilityAvg"
                      name="Readability"
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
                    name="Words"
                    stroke={primaryStroke}
                    strokeWidth={2.2}
                    fill="url(#editorialPrimaryFill)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Cols: Weekly Cadence & Interactive Site Nodes */}
        <div className="lg:col-span-5 card flex flex-col justify-between">
          <div className="pb-4 mb-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="card-title flex items-center gap-2">
              <BarChart3 size={16} className="text-[var(--color-accent)]" />
              <span>Cadence</span>
            </h3>
            <Link
              href="/automation"
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline whitespace-nowrap"
            >
              Schedule →
            </Link>
          </div>

          <div style={{ width: '100%', height: 165 }}>
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
                  name="Drafted"
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

          {/* Clickable Site Nodes */}
          <div className="pt-3 mt-3 border-t border-[var(--color-border-light)] flex flex-wrap items-center gap-2">
            {activeWebsites.slice(0, 4).map((site) => {
              const isSelected = siteFilter === site.name;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setSiteFilter(isSelected ? 'all' : site.name)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#163F32] text-[#F3F0E8] border-[#C8A15A]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#C8A15A]'
                  }`}
                >
                  {site.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================
          3D UNFOLDING MANUSCRIPT PREVIEW MODAL
          ============================================================ */}
      <AnimatePresence>
        {inspectBlog && (
          <div
            className="modal-overlay perspective-stage"
            onClick={() => setInspectBlog(null)}
          >
            <motion.div
              initial={{ opacity: 0, rotateX: 22, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
              exit={{ opacity: 0, rotateX: -16, scale: 0.94, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="modal modal-lg border border-[var(--color-border)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {inspectBlog.websiteName || 'TechPulse'} ·{' '}
                    {getStatusLabel((inspectBlog.status || 'draft').toLowerCase())}
                  </div>
                  <h3 className="modal-title font-editorial mt-0.5">{inspectBlog.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectBlog(null)}
                  className="btn-ghost p-1.5 rounded-lg cursor-pointer"
                  aria-label="Close preview"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="folio-card-3d p-3.5">
                    <div className="text-xs text-[var(--color-text-muted)]">Words</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text)] mt-0.5">
                      {(inspectBlog.wordCount || 1650).toLocaleString()}
                    </div>
                  </div>
                  <div className="folio-card-3d p-3.5">
                    <div className="text-xs text-[var(--color-text-muted)]">SEO</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-primary)] mt-0.5">
                      {inspectBlog.seoScore || 88}/100
                    </div>
                  </div>
                  <div className="folio-card-3d p-3.5">
                    <div className="text-xs text-[var(--color-text-muted)]">Readability</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text)] mt-0.5">
                      {inspectBlog.readabilityScore || 84}/100
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] leading-relaxed max-h-56 overflow-y-auto">
                  {inspectBlog.excerpt ||
                    'Citation-grounded manuscript structured with H2/H3 sections and ready for WordPress publication.'}
                </div>
              </div>

              <div className="modal-footer justify-between">
                <Link
                  href="/content"
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Library</span>
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
                      <Stamp size={14} />
                      <span>Approve</span>
                    </button>
                  )}
                  {(inspectBlog.status || '').toLowerCase() === 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleInlineStatusUpdate(inspectBlog, 'published')}
                      className="btn btn-primary btn-sm"
                    >
                      <Send size={14} />
                      <span>Publish</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
