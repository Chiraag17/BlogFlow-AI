'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import './landing.css';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Globe, Search, Lightbulb, Send,
  ArrowRight, Play, ChevronRight, BookOpen,
  FileText, BarChart2, UserCheck, Layers, Rss,
  Sun, Moon, Sparkles, CheckCircle2, ShieldCheck,
  RotateCcw, XCircle, ExternalLink, Lock, Check, RefreshCw
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { AvatarCircles } from '@/components/ui/avatar-circles';
import { KineticText } from '@/components/ui/kinetic-text';
import type { DeskStage } from '@/components/3d/FloatingEditorialDesk';

const FloatingEditorialDesk = dynamic(
  () => import('@/components/3d/FloatingEditorialDesk'),
  {
    ssr: false,
    loading: () => (
      <div className="lp-desk-loading">
        <div className="lp-desk-loading-inner">
          <span className="lp-desk-loading-kicker">INITIALIZING 3D STUDIO</span>
          <p className="lp-desk-loading-text">Preparing spatial editorial desk &amp; PBR materials…</p>
        </div>
      </div>
    ),
  }
);

const CREATOR_AVATARS = [
  {
    imageUrl: '/fallback_floating_desk.jpg',
    profileUrl: '#',
    name: 'Sarah Chen · Content Lead',
  },
  {
    imageUrl: '/window.svg',
    profileUrl: '#',
    name: 'Alex Rivera · Tech Editor',
  },
  {
    imageUrl: '/globe.svg',
    profileUrl: '#',
    name: 'Elena Rostova · SEO Strategist',
  },
  {
    imageUrl: '/file.svg',
    profileUrl: '#',
    name: 'Marcus Vance · Publisher',
  },
];

/* ============================================================
   HERO INTERACTIVE TOPIC PRESETS
   ============================================================ */
interface HeroTopicPreset {
  id: string;
  shortLabel: string;
  topicPrompt: string;
  category: string;
  articleTitle: string;
  wordCount: string;
  readTime: string;
  seoScore: number;
  seoRating: string;
  h2Heading: string;
  excerptParagraphs: string[];
  sources: { label: string; color: string; initial: string; stat: string }[];
  researchChecks: { label: string; count: string }[];
}

const HERO_TOPIC_PRESETS: HeroTopicPreset[] = [
  {
    id: 'ai-search',
    shortLabel: 'AI Search Architecture',
    topicPrompt: 'How RAG & Semantic Indexing Are Replacing Traditional Keyword Search',
    category: 'AI & Engineering',
    articleTitle: 'The Architecture of AI-Native Search Engines',
    wordCount: '1,680 words',
    readTime: '6 min read',
    seoScore: 94,
    seoRating: 'Optimal',
    h2Heading: '01. Retrieval-Augmented Generation vs. Lexical Matching',
    excerptParagraphs: [
      'Modern search pipelines combine dense vector embeddings with real-time citation verification to eliminate hallucinated synthesis [1].',
      'Enterprise benchmarks indicate hybrid semantic retrieval improves answer precision by 41% across technical documentation [2].',
    ],
    sources: [
      { label: 'MIT Technology Review', color: '#991b1b', initial: 'M', stat: '41% precision lift' },
      { label: 'Stanford HAI Index', color: '#163F32', initial: 'S', stat: '2026 RAG Benchmark' },
      { label: 'Nature Machine Intel', color: '#1e40af', initial: 'N', stat: 'Citation grounding' },
      { label: 'ArXiv Preprint', color: '#92400e', initial: 'A', stat: 'Dense retrieval latency' },
    ],
    researchChecks: [
      { label: 'Technical whitepapers', count: '6 indexed' },
      { label: 'Academic benchmarks', count: '4 verified' },
      { label: 'SERP competitor gaps', count: '3 angles' },
    ],
  },
  {
    id: 'saas-pricing',
    shortLabel: 'Usage-Based SaaS Pricing',
    topicPrompt: 'Why Hybrid Seat + Consumption Pricing Wins Enterprise Retention in 2026',
    category: 'SaaS & Growth',
    articleTitle: 'The Shift to Hybrid Usage-Based SaaS Pricing',
    wordCount: '1,920 words',
    readTime: '7 min read',
    seoScore: 91,
    seoRating: 'Excellent',
    h2Heading: '01. Aligning Revenue Expansion with Customer Value Metrics',
    excerptParagraphs: [
      'Pure seat-based subscriptions face contraction as autonomous workflows compress headcount per department [1].',
      'Software leaders adopting committed base tiers paired with elastic usage credits report 118% net dollar retention [2].',
    ],
    sources: [
      { label: 'OpenView SaaS Report', color: '#163F32', initial: 'O', stat: '118% NDR median' },
      { label: 'Harvard Business Review', color: '#991b1b', initial: 'H', stat: 'Pricing elasticity' },
      { label: 'Stripe Economy Index', color: '#3730a3', initial: 'S', stat: 'Billing telemetry' },
      { label: 'Bessemer Cloud Index', color: '#854d0e', initial: 'B', stat: 'AI margin analysis' },
    ],
    researchChecks: [
      { label: 'Public S-1 filings', count: '8 analyzed' },
      { label: 'Pricing page teardowns', count: '12 audited' },
      { label: 'CFO survey insights', count: '5 cited' },
    ],
  },
  {
    id: 'zero-trust',
    shortLabel: 'Zero-Trust Cloud Security',
    topicPrompt: 'Implementing Identity-First Microsegmentation for Multi-Cloud Kubernetes',
    category: 'Cybersecurity',
    articleTitle: 'Zero-Trust Microsegmentation in Multi-Cloud Environments',
    wordCount: '2,150 words',
    readTime: '8 min read',
    seoScore: 96,
    seoRating: 'Exceptional',
    h2Heading: '01. Ephemeral Workload Identities & eBPF Policy Enforcement',
    excerptParagraphs: [
      'Static perimeter firewalls fail when containerized workloads spin up and terminate across distributed clusters in seconds [1].',
      'Cryptographic SPIFFE identities paired with kernel-level eBPF observability block lateral movement before packet routing [2].',
    ],
    sources: [
      { label: 'NIST SP 800-207', color: '#1e3a8a', initial: 'N', stat: 'Zero-Trust Standard' },
      { label: 'CNCF Security Audit', color: '#163F32', initial: 'C', stat: 'SPIFFE/SPIRE spec' },
      { label: 'IEEE Security & Privacy', color: '#991b1b', initial: 'I', stat: 'eBPF latency <1.2%' },
      { label: 'Cloudflare Radar', color: '#9a3412', initial: 'R', stat: 'Threat telemetry' },
    ],
    researchChecks: [
      { label: 'NIST & CISA advisories', count: '5 verified' },
      { label: 'Kernel eBPF benchmarks', count: '7 extracted' },
      { label: 'Architecture diagrams', count: '3 mapped' },
    ],
  },
];

/* ============================================================
   3D STUDIO STAGE DETAILS
   ============================================================ */
const STAGE_DETAILS: Record<
  DeskStage,
  {
    stepNum: string;
    title: string;
    subtitle: string;
    automatedTasks: string[];
    humanDecisions: string[];
    artifactLabel: string;
    artifactPreview: string;
    deliverables: string[];
  }
> = {
  research: {
    stepNum: '01',
    title: 'Multi-Source Web Research & Citation Discovery',
    subtitle: 'Brushed brass optical loupe & indexed citation dossiers on the studio desk',
    automatedTasks: [
      'Live web & academic query expansion via Tavily',
      'Competitor SERP structure & content gap extraction',
    ],
    humanDecisions: [
      'Select primary angle & target reader persona',
      'Curate or exclude specific domain sources',
    ],
    artifactLabel: 'Research Dossier #01',
    artifactPreview: '14 verified citations indexed across MIT Tech Review, Nature, and industry benchmarks.',
    deliverables: ['Source URL verification', 'Key factual claims', 'Search intent mapping'],
  },
  draft: {
    stepNum: '02',
    title: 'Structured Long-Form Synthesis & Drafting',
    subtitle: 'Archival manuscript stack & fountain pen actively composing structured prose',
    automatedTasks: [
      'Gemini synthesizes outline into H2/H3 long-form prose',
      'Inline footnote citations & FAQ schema generation',
    ],
    humanDecisions: [
      'Refine narrative voice & executive thesis',
      'Adjust section depth or trigger targeted AI revisions',
    ],
    artifactLabel: 'Editorial Manuscript #02',
    artifactPreview: '1,840 words drafted with semantic heading hierarchy and embedded source attributions.',
    deliverables: ['Full Markdown manuscript', 'FAQ structured block', 'Meta title & slug'],
  },
  review: {
    stepNum: '03',
    title: 'Quality Gatekeeper & Human Editorial Sign-Off',
    subtitle: 'Translucent emerald telemetry slab & brass approval seal descending on the draft',
    automatedTasks: [
      'Automated SEO score, keyword density & readability audit',
      'Hallucination & duplicate-content verification',
    ],
    humanDecisions: [
      'Inspect quality scorecard & approve manuscript',
      'Request granular section rewrites with reviewer notes',
    ],
    artifactLabel: 'Quality Audit #03',
    artifactPreview: 'SEO Score 94/100 · Readability Grade 8.4 · 100% citation alignment verified.',
    deliverables: ['SEO & Readability report', 'Editorial approval log', 'Revision audit trail'],
  },
  publish: {
    stepNum: '04',
    title: 'Encrypted CMS Dispatch & WordPress Sync',
    subtitle: 'Hardcover monograph folio sealed with brass clasps ready for WordPress REST dispatch',
    automatedTasks: [
      'AES-256-GCM authenticated WordPress REST API push',
      'Automatic category, tag, and SEO metadata mapping',
    ],
    humanDecisions: [
      'Choose initial Draft mode or scheduled live release',
      'Confirm destination website & final publication slot',
    ],
    artifactLabel: 'CMS Dispatch #04',
    artifactPreview: 'Synced directly to WordPress as a formatted draft with categories, tags, and schema.',
    deliverables: ['WordPress Draft Post ID', 'Live preview link', 'Publishing history record'],
  },
};

/* ============================================================
   NAVBAR
   ============================================================ */
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme, mounted } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav id="lp-navbar" className={`lp-nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <Link href="/" className="lp-nav-logo">
        <span className="lp-nav-logo-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <line x1="5.5" y1="7" x2="10.5" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="5.5" y1="9.5" x2="10.5" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="5.5" y1="12" x2="8.5" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </span>
        BlogFlow AI
      </Link>

      <ul className="lp-nav-links">
        <li><a href="#product">Product</a></li>
        <li><a href="#workflow">Workflow</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#creators">3D Studio</a></li>
      </ul>

      <div className="lp-nav-actions">
        <button
          type="button"
          onClick={toggleTheme}
          className="lp-theme-toggle"
          aria-label={mounted && isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={mounted && isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          id="theme-toggle-btn"
        >
          <span className="lp-theme-toggle-icon" aria-hidden="true">
            {mounted && isDark ? <Moon size={16} /> : <Sun size={16} />}
          </span>
          <span className="lp-theme-toggle-label">
            {mounted && isDark ? 'Dark' : 'Light'}
          </span>
        </button>

        <Link href="/login" className="lp-nav-signin">Sign in</Link>
        <Link href="/generator" className="lp-btn-primary" id="nav-cta">
          Start creating
          <span className="btn-arrow" aria-hidden="true"><ArrowRight size={14} /></span>
        </Link>
      </div>
    </nav>
  );
}

/* ============================================================
   1. INTERACTIVE "TOPIC-TO-ARTICLE" HERO STUDIO
   ============================================================ */
function HeroSection() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(HERO_TOPIC_PRESETS[0].id);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [customSynthesized, setCustomSynthesized] = useState<HeroTopicPreset | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [streamedChars, setStreamedChars] = useState<number>(999);
  const [seoCount, setSeoCount] = useState<number>(HERO_TOPIC_PRESETS[0].seoScore);
  const [completedStepCount, setCompletedStepCount] = useState<number>(4);

  const activeData: HeroTopicPreset =
    customSynthesized ||
    HERO_TOPIC_PRESETS.find((p) => p.id === selectedPresetId) ||
    HERO_TOPIC_PRESETS[0];

  const fullParagraphText = `${activeData.excerptParagraphs[0]} ${activeData.excerptParagraphs[1]}`;

  // Trigger live streaming & animated SEO counter whenever topic changes
  const triggerLiveSimulation = (targetScore: number) => {
    setIsSynthesizing(true);
    setStreamedChars(0);
    setSeoCount(45);
    setCompletedStepCount(1);

    const stepTimer1 = setTimeout(() => setCompletedStepCount(2), 260);
    const stepTimer2 = setTimeout(() => setCompletedStepCount(3), 520);
    const stepTimer3 = setTimeout(() => {
      setCompletedStepCount(4);
      setIsSynthesizing(false);
    }, 850);

    // Animate SEO score counter
    let currentSeo = 45;
    const seoInterval = setInterval(() => {
      currentSeo = Math.min(currentSeo + 3, targetScore);
      setSeoCount(currentSeo);
      if (currentSeo >= targetScore) clearInterval(seoInterval);
    }, 30);

    // Stream characters into laptop manuscript
    let chars = 0;
    const streamInterval = setInterval(() => {
      chars += 9;
      setStreamedChars(chars);
      if (chars >= 360) clearInterval(streamInterval);
    }, 22);

    return () => {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearInterval(seoInterval);
      clearInterval(streamInterval);
    };
  };

  useEffect(() => {
    const cleanup = triggerLiveSimulation(activeData.seoScore);
    return cleanup;
  }, [selectedPresetId, customSynthesized]);

  const handleSelectPreset = (id: string) => {
    setCustomSynthesized(null);
    setSelectedPresetId(id);
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;

    const cleanTopic = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    const customPreset: HeroTopicPreset = {
      id: 'custom',
      shortLabel: cleanTopic.slice(0, 26),
      topicPrompt: cleanTopic,
      category: 'Custom Editorial Brief',
      articleTitle: `${cleanTopic}: A Research-Backed Executive Analysis`,
      wordCount: '1,790 words',
      readTime: '7 min read',
      seoScore: 93,
      seoRating: 'Optimal',
      h2Heading: `01. Core Mechanisms & Strategic Implications of ${cleanTopic.slice(0, 32)}`,
      excerptParagraphs: [
        `Synthesizing live multi-source research reveals how ${cleanTopic.toLowerCase()} is reshaping modern operational benchmarks with measurable ROI [1].`,
        `Teams pairing structured domain citations with editorial verification outperform generic ungrounded content across organic SERP rankings [2].`,
      ],
      sources: [
        { label: 'MIT Technology Review', color: '#991b1b', initial: 'M', stat: 'Primary benchmark' },
        { label: 'Gartner Research Brief', color: '#163F32', initial: 'G', stat: '2026 Market Guide' },
        { label: 'Harvard Business Review', color: '#1e40af', initial: 'H', stat: 'Executive framework' },
        { label: 'Industry SERP Consensus', color: '#92400e', initial: 'I', stat: 'Top 5 gap analysis' },
      ],
      researchChecks: [
        { label: 'Live Tavily web sources', count: '9 indexed' },
        { label: 'Primary statistics', count: '5 extracted' },
        { label: 'SERP intent alignment', count: '98% match' },
      ],
    };
    setCustomSynthesized(customPreset);
  };

  const visibleProse = fullParagraphText.slice(0, streamedChars);

  return (
    <section id="hero" className="lp-hero" aria-labelledby="hero-headline">
      <div className="lp-hero-bg" aria-hidden="true" />
      <div className="lp-container">
        <div className="lp-hero-inner">

          {/* Left: Copy + Interactive Topic Playground */}
          <div className="lp-hero-left">
            <div className="lp-hero-kicker">
              AI-Powered Editorial Automation · Multi-Agent Studio
            </div>

            <h1 className="lp-hero-headline" id="hero-headline">
              <span className="block">
                <KineticText text="Research." as="span" className="inline-flex cursor-default font-serif" />{' '}
                <KineticText text="Think." as="span" className="inline-flex cursor-default font-serif" />
              </span>
              <KineticText
                text="Publish."
                as="em"
                className="italic text-[var(--lp-primary)] inline-flex cursor-default font-serif"
              />
            </h1>

            <p className="lp-hero-desc">
              BlogFlow AI transforms any website, topic or idea into well-researched,
              SEO-optimised articles — test a live editorial prompt below and watch the studio synthesize it.
            </p>

            {/* Interactive Topic-to-Article Controller */}
            <div className="lp-hero-playground" aria-label="Interactive Topic-to-Article Studio">
              <div className="lp-playground-header">
                <span className="lp-playground-label">
                  <Sparkles size={13} /> Live Topic-to-Article Simulator
                </span>
                <span className="lp-playground-status">
                  {isSynthesizing ? 'Synthesizing sources & draft…' : 'Ready · Click a prompt or type your own'}
                </span>
              </div>

              {/* 3 Curated Editorial Prompts */}
              <div className="lp-playground-presets" role="tablist" aria-label="Curated editorial prompts">
                {HERO_TOPIC_PRESETS.map((preset) => {
                  const isActive = !customSynthesized && selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`lp-preset-btn${isActive ? ' active' : ''}`}
                    >
                      {preset.shortLabel}
                    </button>
                  );
                })}
              </div>

              {/* Custom Topic Input Form */}
              <form onSubmit={handleCustomTopicSubmit} className="lp-playground-form">
                <input
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  placeholder="Or type any topic (e.g., Sustainable Aviation Fuels in 2026)…"
                  className="lp-playground-input"
                  aria-label="Custom article topic"
                />
                <button type="submit" className="lp-playground-submit">
                  Synthesize
                </button>
              </form>
            </div>

            <div className="lp-hero-ctas">
              <Link
                href={`/generator?topic=${encodeURIComponent(activeData.topicPrompt)}`}
                className="lp-btn-primary"
                id="hero-cta-primary"
              >
                Open in Full Generator
                <span className="btn-arrow" aria-hidden="true"><ArrowRight size={16} /></span>
              </Link>
              <a href="#workflow" className="lp-btn-secondary" id="hero-cta-secondary">
                <Play size={14} />
                Inspect 5-Agent Pipeline
              </a>
            </div>

            <div className="lp-hero-social">
              <AvatarCircles
                avatarUrls={CREATOR_AVATARS}
                numPeople={2400}
                avatarSize={36}
              />
              <div className="lp-hero-social-info">
                <div className="lp-hero-stars">
                  <span className="lp-hero-stars-icon" aria-hidden="true">★★★★★</span>
                  <span>4.9 / 5 rating</span>
                </div>
                <span className="lp-hero-social-text">
                  Loved by <strong>2,400+</strong> creators &amp; editorial teams
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Workspace Visual */}
          <div className="lp-hero-right">
            <div className="lp-workspace">

              {/* Laptop mockup with REAL live-streamed manuscript */}
              <div className="lp-laptop">
                <div className="lp-laptop-body">
                  <div className="lp-laptop-screen">
                    <div className="lp-laptop-screen-inner">
                      <div className="lp-screen-topbar">
                        <div className="lp-screen-dot" />
                        <div className="lp-screen-dot" />
                        <div className="lp-screen-dot" />
                        <span className="lp-screen-category-tag">
                          {activeData.category}
                        </span>
                      </div>

                      <div className="lp-screen-content lp-screen-live-manuscript">
                        <div className="lp-screen-article-title">
                          {activeData.articleTitle}
                        </div>
                        <div className="lp-screen-article-meta">
                          <span>Draft</span>
                          <span aria-hidden="true">·</span>
                          <span>{activeData.wordCount}</span>
                          <span aria-hidden="true">·</span>
                          <span>{activeData.readTime}</span>
                          <span aria-hidden="true">·</span>
                          <span className="lp-screen-meta-seo">SEO {seoCount}</span>
                        </div>

                        <div className="lp-screen-h2">
                          {activeData.h2Heading}
                        </div>

                        <p className="lp-screen-prose">
                          {visibleProse}
                          {streamedChars < fullParagraphText.length && (
                            <span className="lp-typing-caret" aria-hidden="true">|</span>
                          )}
                        </p>

                        <div className="lp-screen-footer-bar">
                          <span>Citations: [1] {activeData.sources[0]?.label} · [2] {activeData.sources[1]?.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lp-laptop-base" />
                </div>
              </div>

              {/* Notebook */}
              <div className="lp-notebook" aria-hidden="true">
                <div className="lp-notebook-body">
                  <div className="lp-notebook-spine" />
                  <div className="lp-notebook-title">Ideas</div>
                  <div className="lp-notebook-line" />
                  <div className="lp-notebook-line" />
                  <div className="lp-notebook-line" />
                  <div className="lp-notebook-line" />
                  <div className="lp-notebook-line" />
                </div>
              </div>

              {/* Book stack */}
              <div className="lp-books" aria-hidden="true">
                <div className="lp-book" data-label="Research" style={{ width: 30, height: 90, background: 'linear-gradient(135deg,#244737,#163F32)' }} />
                <div className="lp-book" data-label="Ideas" style={{ width: 26, height: 80, background: 'linear-gradient(135deg,#315B4B,#244737)' }} />
                <div className="lp-book" data-label="Publish" style={{ width: 22, height: 70, background: 'linear-gradient(135deg,#C8A15A,#b08945)' }} />
              </div>

              {/* Glass card 1: Researching Sources */}
              <div className="glass-card gc-research">
                <div className="glass-card-inner">
                  <div className="gc-title">
                    {isSynthesizing ? 'Scanning Sources…' : 'Research Verified'}
                  </div>
                  {activeData.researchChecks.map((chk, idx) => {
                    const isDone = completedStepCount > idx + 1;
                    return (
                      <div className="gc-item" key={chk.label}>
                        <div className={`gc-dot ${isDone ? 'gc-dot-success' : 'gc-dot-progress'}`}>
                          {isDone ? '✓' : '◉'}
                        </div>
                        <div className="gc-item-text-wrap">
                          <span>{chk.label}</span>
                          <span className="gc-item-sub">{chk.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Glass card 2: Top Sources (Dynamic per Topic) */}
              <div className="glass-card gc-sources">
                <div className="glass-card-inner">
                  <div className="gc-title">Top Cited Sources</div>
                  {activeData.sources.map((s) => (
                    <div className="gc-source-item" key={s.label}>
                      <div className="gc-source-icon" style={{ background: s.color }}>{s.initial}</div>
                      <div className="gc-source-meta">
                        <span className="gc-source-name-line">{s.label}</span>
                        <span className="gc-source-stat-line">{s.stat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glass card 3: Article Draft Pipeline Status */}
              <div className="glass-card gc-article">
                <div className="glass-card-inner">
                  <div className="gc-title">Agent Pipeline</div>
                  {[
                    { label: 'Tavily Research', step: 1 },
                    { label: 'Outline Synthesis', step: 2 },
                    { label: 'Gemini Drafting', step: 3 },
                    { label: 'SEO Verification', step: 4 },
                  ].map((r) => {
                    const done = completedStepCount >= r.step;
                    return (
                      <div className="gc-status-row" key={r.label}>
                        <span>{r.label}</span>
                        <div className={`gc-status-check ${done ? 'gc-check-done' : 'gc-check-pending'}`}>
                          {done ? '✓' : '○'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Glass card 4: Animated SEO Score */}
              <div className="glass-card gc-seo">
                <div className="glass-card-inner">
                  <div className="gc-title">SEO Score</div>
                  <div className="gc-seo-score tabular-nums">{seoCount}</div>
                  <div className="gc-seo-label">{activeData.seoRating}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="lp-trust" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div className="lp-trust-inner">
          {[
            'Research before writing.',
            'Structure before polish.',
            'Review before publishing.',
            'Your content, your final approval.',
          ].map((t) => (
            <div className="lp-trust-item" key={t}>
              <span className="lp-trust-dot" aria-hidden="true" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   2. INTERACTIVE 5-STAGE AGENT PIPELINE (#workflow)
   ============================================================ */
type PipelineStageId = 'discover' | 'research' | 'think' | 'review' | 'publish';

function WorkflowSection({
  onSyncDeskStage,
}: {
  onSyncDeskStage: (stage: DeskStage) => void;
}) {
  const [selectedStage, setSelectedStage] = useState<PipelineStageId>('discover');

  // Interactive states inside Stage 04 (Review) and Stage 05 (Publish)
  const [reviewDecision, setReviewDecision] = useState<'pending' | 'approved' | 'revision' | 'rejected'>('pending');
  const [reviewerNote, setReviewerNote] = useState<string>('Strong primary citations in Section 02. Approved for WordPress staging.');
  const [wpPublishMode, setWpPublishMode] = useState<'draft' | 'schedule'>('draft');
  const [wpPushSimulated, setWpPushSimulated] = useState<boolean>(false);

  const stages: {
    id: PipelineStageId;
    n: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
    tag: string;
    deskStage: DeskStage;
  }[] = [
    {
      id: 'discover',
      n: '01',
      icon: <Globe size={22} />,
      title: 'Discover',
      desc: 'Niche analysis & competitor content gap detection from any URL.',
      tag: 'Web search + AI',
      deskStage: 'research',
    },
    {
      id: 'research',
      n: '02',
      icon: <Search size={22} />,
      title: 'Research',
      desc: 'Live Tavily citation extraction with verified domain statistics.',
      tag: 'Multi-source analysis',
      deskStage: 'research',
    },
    {
      id: 'think',
      n: '03',
      icon: <Lightbulb size={22} />,
      title: 'Think',
      desc: 'Gemini outline synthesis, H2/H3 hierarchy & thesis structuring.',
      tag: 'Smart AI synthesis',
      deskStage: 'draft',
    },
    {
      id: 'review',
      n: '04',
      icon: <UserCheck size={22} />,
      title: 'Review',
      desc: 'Human-in-the-loop approval bar for quality, tone, and accuracy.',
      tag: 'Editorial review',
      deskStage: 'review',
    },
    {
      id: 'publish',
      n: '05',
      icon: <Send size={22} />,
      title: 'Publish',
      desc: 'Encrypted WordPress REST API draft push or scheduled release.',
      tag: 'CMS integration',
      deskStage: 'publish',
    },
  ];

  const handleStageClick = (stage: (typeof stages)[number]) => {
    setSelectedStage(stage.id);
    onSyncDeskStage(stage.deskStage);
  };

  return (
    <section id="workflow" className="lp-workflow" aria-labelledby="workflow-heading">
      <div className="lp-container">
        <div className="lp-workflow-header">
          <div>
            <div className="lp-section-label">The complete 5-agent workflow</div>
            <h2 className="lp-section-heading" id="workflow-heading">
              From idea to published article —{' '}
              <KineticText
                text="automatically."
                as="em"
                className="italic text-[var(--lp-primary)] inline-flex cursor-default font-serif"
              />
            </h2>
            <a href="#creators" className="lp-workflow-explore">
              Inspect in 3D Editorial Studio <ChevronRight size={14} />
            </a>
          </div>
          <div>
            <p className="lp-section-desc">
              Click any of the 5 pipeline stages below to inspect what happens under the hood —
              from live competitor gap discovery and Tavily citation extraction to human editorial
              sign-off and encrypted WordPress REST publishing.
            </p>
          </div>
        </div>

        {/* 5 Interactive Pipeline Cards */}
        <div className="lp-pipeline" role="tablist" aria-label="5-stage editorial workflow">
          {stages.map((s, i) => {
            const isSelected = selectedStage === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="lp-stage">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleStageClick(s)}
                    className={`lp-stage-card lp-stage-card-btn${isSelected ? ' is-active-stage' : ''}`}
                  >
                    <span className="lp-stage-number">STAGE {s.n}</span>
                    <div className="lp-stage-icon" aria-hidden="true">{s.icon}</div>
                    <h3 className="lp-stage-title">{s.title}</h3>
                    <p className="lp-stage-desc">{s.desc}</p>
                    <span className="lp-stage-meta-line">{s.tag}</span>
                  </button>
                </div>
                {i < stages.length - 1 && (
                  <div className="lp-pipeline-arrow" aria-hidden="true">
                    <ChevronRight />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Animated Stage Inspector Panel Below Pipeline */}
        <div className="lp-workflow-inspector-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lp-wf-panel"
              role="tabpanel"
            >
              {/* STAGE 01: DISCOVER */}
              {selectedStage === 'discover' && (
                <div className="lp-wf-grid">
                  <div className="lp-wf-info">
                    <div className="lp-wf-kicker">01. DISCOVER · NICHE &amp; COMPETITOR GAP DETECTION</div>
                    <h3 className="lp-wf-title">Crawl target domains to uncover high-intent topic gaps.</h3>
                    <p className="lp-wf-desc">
                      Agent 01 scans your connected website URL, extracts existing topic clusters,
                      and cross-references competitor SERPs to identify high-value articles your audience
                      is actively searching for.
                    </p>
                    <div className="lp-wf-metrics-row">
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">92/100</span>
                        <span className="lp-wf-metric-lbl">Opportunity Score</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">3.4x</span>
                        <span className="lp-wf-metric-lbl">Organic Traffic Potential</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">12</span>
                        <span className="lp-wf-metric-lbl">Content Gaps Found</span>
                      </div>
                    </div>
                  </div>

                  <div className="lp-wf-demo-box">
                    <div className="lp-wf-demo-header">
                      <span>Target Domain Scan: acmecloud.io</span>
                      <span className="lp-wf-demo-meta">3 High-Opportunity Gaps</span>
                    </div>
                    <div className="lp-wf-gap-list">
                      {[
                        {
                          topic: 'Zero-Trust Microsegmentation for Multi-Cloud Kubernetes',
                          intent: 'Technical Decision-Makers',
                          gap: 'Missing from site · High SERP demand · Opportunity 96%',
                        },
                        {
                          topic: 'eBPF vs. Sidecar Proxies: Service Mesh Latency Benchmarks',
                          intent: 'Platform Engineers',
                          gap: 'Competitors lack 2026 benchmarks · Opportunity 91%',
                        },
                        {
                          topic: 'Automating SOC2 Compliance Audits in Ephemeral Clusters',
                          intent: 'CISOs & VP Engineering',
                          gap: 'High commercial intent · Opportunity 88%',
                        },
                      ].map((item) => (
                        <div key={item.topic} className="lp-wf-gap-item">
                          <div className="lp-wf-gap-main">
                            <div className="lp-wf-gap-title">{item.topic}</div>
                            <div className="lp-wf-gap-sub">
                              <span>Audience: {item.intent}</span>
                              <span aria-hidden="true">·</span>
                              <span>{item.gap}</span>
                            </div>
                          </div>
                          <Link
                            href={`/generator?topic=${encodeURIComponent(item.topic)}`}
                            className="lp-wf-gap-action"
                          >
                            Draft Topic <ArrowRight size={12} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 02: RESEARCH */}
              {selectedStage === 'research' && (
                <div className="lp-wf-grid">
                  <div className="lp-wf-info">
                    <div className="lp-wf-kicker">02. RESEARCH · LIVE TAVILY CITATION EXTRACTION</div>
                    <h3 className="lp-wf-title">Every claim grounded in verified sources and statistics.</h3>
                    <p className="lp-wf-desc">
                      Before a single paragraph is written, the Research Agent dispatches targeted Tavily
                      search queries across academic journals, standards bodies, and primary industry reports
                      to build a factual dossier.
                    </p>
                    <div className="lp-wf-metrics-row">
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">14</span>
                        <span className="lp-wf-metric-lbl">Verified URLs Indexed</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">100%</span>
                        <span className="lp-wf-metric-lbl">Inline Citation Mapping</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">0</span>
                        <span className="lp-wf-metric-lbl">Fabricated Citations</span>
                      </div>
                    </div>
                  </div>

                  <div className="lp-wf-demo-box">
                    <div className="lp-wf-demo-header">
                      <span>Tavily Live Citation Dossier</span>
                      <span className="lp-wf-demo-meta">Extracted Statistics &amp; Proofs</span>
                    </div>
                    <div className="lp-wf-citation-grid">
                      {[
                        {
                          source: 'MIT Technology Review (2026)',
                          url: 'technologyreview.com/rag-enterprise',
                          stat: '41% Precision Gain',
                          quote: 'Hybrid semantic + lexical retrieval reduces factual errors by 41% compared to dense-only vector lookup.',
                        },
                        {
                          source: 'NIST Special Publication 800-207',
                          url: 'csrc.nist.gov/pubs/sp/800/207/final',
                          stat: 'Zero-Trust Architecture',
                          quote: 'Continuous per-request cryptographic verification replaces implicit network-location trust zones.',
                        },
                        {
                          source: 'CNCF Annual Cloud Native Survey',
                          url: 'cncf.io/reports/cloud-native-2026',
                          stat: '78% Production Adoption',
                          quote: '78% of enterprise platform teams now run multi-cluster workloads requiring automated policy sync.',
                        },
                      ].map((cit, idx) => (
                        <div key={cit.source} className="lp-wf-citation-card">
                          <div className="lp-wf-citation-top">
                            <span className="lp-wf-citation-ref">[{idx + 1}] {cit.source}</span>
                            <span className="lp-wf-citation-stat">{cit.stat}</span>
                          </div>
                          <p className="lp-wf-citation-quote">“{cit.quote}”</p>
                          <span className="lp-wf-citation-url">{cit.url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 03: THINK (GEMINI OUTLINE SYNTHESIS) */}
              {selectedStage === 'think' && (
                <div className="lp-wf-grid">
                  <div className="lp-wf-info">
                    <div className="lp-wf-kicker">03. THINK · GEMINI OUTLINE SYNTHESIS &amp; H2/H3 STRUCTURE</div>
                    <h3 className="lp-wf-title">Architectural outlines engineered for depth and search intent.</h3>
                    <p className="lp-wf-desc">
                      Google Gemini synthesizes the research dossier into a logical H2/H3 narrative tree,
                      allocating target word counts, primary/secondary keywords, and specific source citations
                      to each section before drafting full prose.
                    </p>
                    <div className="lp-wf-metrics-row">
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">6 H2s</span>
                        <span className="lp-wf-metric-lbl">Structured Sections</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">1,950</span>
                        <span className="lp-wf-metric-lbl">Target Word Budget</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">5 FAQs</span>
                        <span className="lp-wf-metric-lbl">Schema.org Ready</span>
                      </div>
                    </div>
                  </div>

                  <div className="lp-wf-demo-box">
                    <div className="lp-wf-demo-header">
                      <span>Synthesized Semantic Outline Tree</span>
                      <span className="lp-wf-demo-meta">Gemini 2.5 Pro Architect</span>
                    </div>
                    <div className="lp-wf-outline-tree">
                      {[
                        {
                          tag: 'H1',
                          heading: 'The Architecture of Autonomous Enterprise Search Systems',
                          meta: 'Thesis & Executive Hook · 220 words',
                          indent: false,
                        },
                        {
                          tag: 'H2',
                          heading: '01. Why Lexical Keyword Matching Fails Complex Queries',
                          meta: 'Cites [1] MIT Tech Review · Focus KW included · 380 words',
                          indent: false,
                        },
                        {
                          tag: 'H3',
                          heading: '1.1 Dense Vector Embeddings vs. BM25 Hybrid Reranking',
                          meta: 'Technical latency breakdown table · 290 words',
                          indent: true,
                        },
                        {
                          tag: 'H2',
                          heading: '02. Verifiable Citation Grounding & Hallucination Guardrails',
                          meta: 'Cites [2] Stanford HAI · Actionable framework · 440 words',
                          indent: false,
                        },
                        {
                          tag: 'H2',
                          heading: '03. Frequently Asked Questions (Structured FAQ Schema)',
                          meta: '4 direct-answer blocks for Featured Snippets · 320 words',
                          indent: false,
                        },
                      ].map((node) => (
                        <div
                          key={node.heading}
                          className={`lp-wf-outline-node${node.indent ? ' is-indented' : ''}`}
                        >
                          <span className="lp-wf-outline-tag">{node.tag}</span>
                          <div className="lp-wf-outline-body">
                            <div className="lp-wf-outline-heading">{node.heading}</div>
                            <div className="lp-wf-outline-meta">{node.meta}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 04: REVIEW (HUMAN-IN-THE-LOOP APPROVAL BAR) */}
              {selectedStage === 'review' && (
                <div className="lp-wf-grid">
                  <div className="lp-wf-info">
                    <div className="lp-wf-kicker">04. REVIEW · HUMAN-IN-THE-LOOP EDITORIAL GATEKEEPER</div>
                    <h3 className="lp-wf-title">Nothing goes live without your explicit editorial sign-off.</h3>
                    <p className="lp-wf-desc">
                      The Quality Evaluator scores readability, SEO structure, and factual grounding,
                      then pauses the LangGraph workflow at a human checkpoint. Test the live approval
                      controls on the right to see how editors govern every draft.
                    </p>
                    <div className="lp-wf-metrics-row">
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">94%</span>
                        <span className="lp-wf-metric-lbl">SEO Readiness</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">Grade 8.4</span>
                        <span className="lp-wf-metric-lbl">Flesch-Kincaid</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">1.6%</span>
                        <span className="lp-wf-metric-lbl">Keyword Density</span>
                      </div>
                    </div>
                  </div>

                  <div className="lp-wf-demo-box">
                    <div className="lp-wf-demo-header">
                      <span>Interactive Human Approval Console</span>
                      <span className="lp-wf-demo-meta">
                        Status:{' '}
                        {reviewDecision === 'pending'
                          ? 'Awaiting Editor Action'
                          : reviewDecision === 'approved'
                          ? 'Approved for WordPress'
                          : reviewDecision === 'revision'
                          ? 'Revision Queued'
                          : 'Rejected'}
                      </span>
                    </div>

                    <div className="lp-wf-review-console">
                      <div className="lp-wf-review-scores">
                        <span>Grammar: 98/100</span>
                        <span aria-hidden="true">·</span>
                        <span>Readability: 91/100</span>
                        <span aria-hidden="true">·</span>
                        <span>SEO: 94/100</span>
                        <span aria-hidden="true">·</span>
                        <span>Citations: 4/4 Verified</span>
                      </div>

                      <label htmlFor="wf-reviewer-note" className="lp-wf-review-label">
                        Editorial Reviewer Note / Revision Instructions
                      </label>
                      <input
                        id="wf-reviewer-note"
                        type="text"
                        value={reviewerNote}
                        onChange={(e) => setReviewerNote(e.target.value)}
                        className="lp-wf-review-input"
                      />

                      <div className="lp-wf-review-actions">
                        <button
                          type="button"
                          onClick={() => setReviewDecision('approved')}
                          className={`lp-wf-btn lp-wf-btn-approve${reviewDecision === 'approved' ? ' active' : ''}`}
                        >
                          <CheckCircle2 size={15} /> Approve Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewDecision('revision')}
                          className={`lp-wf-btn lp-wf-btn-revise${reviewDecision === 'revision' ? ' active' : ''}`}
                        >
                          <RotateCcw size={15} /> Request Revision
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewDecision('rejected')}
                          className={`lp-wf-btn lp-wf-btn-reject${reviewDecision === 'rejected' ? ' active' : ''}`}
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </div>

                      {reviewDecision !== 'pending' && (
                        <div className={`lp-wf-review-feedback is-${reviewDecision}`}>
                          {reviewDecision === 'approved' && (
                            <>
                              <Check size={15} />
                              <span>
                                <strong>Approved!</strong> Manuscript unlocked for Stage 05 WordPress REST API dispatch.
                              </span>
                            </>
                          )}
                          {reviewDecision === 'revision' && (
                            <>
                              <RefreshCw size={15} />
                              <span>
                                <strong>Revision Triggered:</strong> Sent back to Gemini Writer with note: “{reviewerNote}”
                              </span>
                            </>
                          )}
                          {reviewDecision === 'rejected' && (
                            <>
                              <XCircle size={15} />
                              <span>
                                <strong>Rejected:</strong> Article archived in audit log; pipeline halted safely.
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 05: PUBLISH (ENCRYPTED WORDPRESS REST API PUSH) */}
              {selectedStage === 'publish' && (
                <div className="lp-wf-grid">
                  <div className="lp-wf-info">
                    <div className="lp-wf-kicker">05. PUBLISH · ENCRYPTED WORDPRESS REST API DISPATCH</div>
                    <h3 className="lp-wf-title">Push formatted drafts directly to WordPress with zero copy-pasting.</h3>
                    <p className="lp-wf-desc">
                      Application Passwords are encrypted at rest with AES-256-GCM. Once approved, the
                      Publishing Agent formats Gutenberg/HTML blocks, maps categories and tags, and
                      pushes the post via `/wp-json/wp/v2/posts`.
                    </p>
                    <div className="lp-wf-metrics-row">
                      <div>
                        <span className="lp-wf-metric-val">AES-256</span>
                        <span className="lp-wf-metric-lbl">Credential Encryption</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val">Draft First</span>
                        <span className="lp-wf-metric-lbl">Safe Publishing Policy</span>
                      </div>
                      <div>
                        <span className="lp-wf-metric-val tabular-nums">1.2s</span>
                        <span className="lp-wf-metric-lbl">REST Sync Latency</span>
                      </div>
                    </div>
                  </div>

                  <div className="lp-wf-demo-box">
                    <div className="lp-wf-demo-header">
                      <span>WordPress REST API Dispatch Console</span>
                      <span className="lp-wf-demo-meta">
                        <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
                        POST /wp-json/wp/v2/posts
                      </span>
                    </div>

                    <div className="lp-wf-publish-console">
                      <div className="lp-wf-publish-modes" role="radiogroup" aria-label="WordPress publish mode">
                        <button
                          type="button"
                          onClick={() => { setWpPublishMode('draft'); setWpPushSimulated(false); }}
                          className={`lp-wf-mode-btn${wpPublishMode === 'draft' ? ' active' : ''}`}
                        >
                          Save as WordPress Draft (Recommended)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setWpPublishMode('schedule'); setWpPushSimulated(false); }}
                          className={`lp-wf-mode-btn${wpPublishMode === 'schedule' ? ' active' : ''}`}
                        >
                          Schedule Live Release (Thu 09:00 UTC)
                        </button>
                      </div>

                      <pre className="lp-wf-code-preview">
{`{
  "title": "The Architecture of AI-Native Search Engines",
  "slug": "architecture-ai-native-search-engines",
  "status": "${wpPublishMode === 'draft' ? 'draft' : 'future'}",
  "categories": [14, 28],
  "meta": { "yoast_wpseo_metadesc": "Enterprise RAG & citation..." }
}`}
                      </pre>

                      <div className="lp-wf-publish-footer">
                        <button
                          type="button"
                          onClick={() => setWpPushSimulated(true)}
                          className="lp-btn-primary"
                        >
                          <Send size={14} />
                          {wpPushSimulated ? 'Synced to WordPress!' : 'Simulate WordPress REST Push'}
                        </button>

                        {wpPushSimulated && (
                          <span className="lp-wf-publish-confirm">
                            ✓ 201 Created · WP Post ID #4892 ({wpPublishMode === 'draft' ? 'Draft' : 'Scheduled'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   INTERACTIVE 3D EDITORIAL STUDIO & PHILOSOPHY SECTION
   ============================================================ */
function AutomationSection({
  activeDeskStage,
  onSelectDeskStage,
}: {
  activeDeskStage: DeskStage;
  onSelectDeskStage: (stage: DeskStage) => void;
}) {
  const detail = STAGE_DETAILS[activeDeskStage];

  const stageOrder: { id: DeskStage; num: string; name: string; role: string }[] = [
    { id: 'research', num: '01', name: 'Research', role: 'Sources & Loupe' },
    { id: 'draft', num: '02', name: 'Draft', role: 'Manuscript & Pen' },
    { id: 'review', num: '03', name: 'Review', role: 'Telemetry & Seal' },
    { id: 'publish', num: '04', name: 'Publish', role: 'Hardcover Folio' },
  ];

  return (
    <section id="creators" className="lp-automation" aria-labelledby="automation-heading">
      <div className="lp-container">
        {/* Header Row */}
        <div className="lp-studio-header">
          <div>
            <div className="lp-section-label">Interactive 3D Editorial Studio · Philosophy</div>
            <h2 className="lp-section-heading" id="automation-heading">
              Automation should move the work forward,{' '}
              not take the <em>editor</em> out of it.
            </h2>
          </div>
          <div>
            <p className="lp-section-desc">
              Interact with the 3D Editorial Desk below — switch between <strong>Research</strong>,{' '}
              <strong>Draft</strong>, <strong>Review</strong>, and <strong>Publish</strong>, drag to orbit,
              or slide the layer explosion control to inspect how AI agents and human editors collaborate.
            </p>
          </div>
        </div>

        {/* Interactive Stage Switcher Bar */}
        <div className="lp-studio-stage-bar" role="tablist" aria-label="3D Desk Workflow Stage">
          {stageOrder.map((st) => {
            const active = activeDeskStage === st.id;
            return (
              <button
                key={st.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectDeskStage(st.id)}
                className={`lp-studio-stage-tab${active ? ' active' : ''}`}
              >
                <span className="lp-studio-tab-num">{st.num}.</span>
                <div className="lp-studio-tab-text">
                  <span className="lp-studio-tab-name">{st.name}</span>
                  <span className="lp-studio-tab-role">{st.role}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Interactive 3D Showcase Grid */}
        <div className="lp-studio-grid">
          {/* Left: Upgraded Three.js 3D FloatingEditorialDesk */}
          <div className="lp-studio-viewport-col">
            <FloatingEditorialDesk
              currentStage={activeDeskStage}
              onStageChange={onSelectDeskStage}
              interactive={true}
            />
          </div>

          {/* Right: Live Stage Inspector & Automation vs. Human Breakdown */}
          <div className="lp-studio-inspector-col">
            <div className="lp-inspector-card">
              <div className="lp-inspector-kicker">
                <span>STAGE {detail.stepNum} ACTIVE</span>
                <span aria-hidden="true">·</span>
                <span>{detail.artifactLabel}</span>
              </div>

              <h3 className="lp-inspector-title">{detail.title}</h3>
              <p className="lp-inspector-subtitle">{detail.subtitle}</p>

              {/* Artifact Output Callout */}
              <div className="lp-inspector-artifact">
                <div className="lp-inspector-artifact-header">
                  <Sparkles size={15} />
                  <span>Live Stage Output</span>
                </div>
                <p className="lp-inspector-artifact-body">{detail.artifactPreview}</p>
                <div className="lp-inspector-deliverables">
                  {detail.deliverables.map((d, idx) => (
                    <React.Fragment key={d}>
                      <span>{d}</span>
                      {idx < detail.deliverables.length - 1 && <span aria-hidden="true">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Dual-Column Automation vs Human Decisions */}
              <div className="lp-inspector-split">
                <div className="lp-inspector-panel lp-inspector-panel-auto">
                  <div className="lp-inspector-panel-heading">AI Agent Prepares</div>
                  <ul className="lp-inspector-list">
                    {detail.automatedTasks.map((task) => (
                      <li key={task}>
                        <CheckCircle2 size={14} className="lp-inspector-icon-auto" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lp-inspector-panel lp-inspector-panel-human">
                  <div className="lp-inspector-panel-heading">Human Editor Decides</div>
                  <ul className="lp-inspector-list">
                    {detail.humanDecisions.map((dec) => (
                      <li key={dec}>
                        <ShieldCheck size={14} className="lp-inspector-icon-human" />
                        <span>{dec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stage Quick-Advance Footer */}
              <div className="lp-inspector-footer">
                <span className="lp-inspector-hint">
                  Tip: Drag the 3D desk to orbit or press <kbd>H</kbd> to toggle studio HUD
                </span>
                <Link href="/generator" className="lp-inspector-cta">
                  Run this pipeline <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FEATURES SECTION
   ============================================================ */
function FeatureSection() {
  return (
    <section id="features" className="lp-features" aria-labelledby="features-heading">
      <div className="lp-container">
        <div className="lp-features-header">
          <div className="lp-section-label">Why BlogFlow AI</div>
          <h2 className="lp-section-heading" id="features-heading">
            Built for creators, marketers and teams.
          </h2>
          <p className="lp-section-desc">
            Everything you need to create high-quality, SEO-friendly content — without the manual work.
          </p>
        </div>

        <div className="lp-feature-grid">

          {/* Large: AI Research */}
          <div className="lp-feat-card lp-feat-card-large">
            <div className="lp-feat-icon"><BookOpen size={22} /></div>
            <div className="lp-feat-label">AI-Powered Research</div>
            <h3 className="lp-feat-title">Find the most relevant and credible sources, automatically.</h3>
            <p className="lp-feat-desc">
              BlogFlow searches across websites, academic papers, and news to surface the most
              meaningful insights for your topic. Every article begins with real research —
              not hallucinations.
            </p>
            <div className="lp-feat-preview">
              <div className="gc-title" style={{ marginBottom: 10 }}>Analysing Sources</div>
              {[
                { label: 'MIT Technology Review', color: '#c41e3a', initial: 'M' },
                { label: 'Nature', color: '#1a6b2f', initial: 'N' },
                { label: 'TechCrunch', color: '#006747', initial: 'T' },
              ].map((s) => (
                <div className="lp-feat-source" key={s.label}>
                  <div className="lp-feat-source-icon" style={{ background: s.color }}>{s.initial}</div>
                  <div className="lp-feat-source-name">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Optimised */}
          <div className="lp-feat-card">
            <div className="lp-feat-icon"><BarChart2 size={22} /></div>
            <div className="lp-feat-label">SEO Optimised</div>
            <h3 className="lp-feat-title">Built-in SEO checks before publishing.</h3>
            <div className="lp-feat-preview" style={{ textAlign: 'center' }}>
              <div className="lp-feat-score-big">87</div>
              <div className="lp-feat-score-label">Excellent</div>
            </div>
          </div>

          {/* CMS Integration */}
          <div className="lp-feat-card">
            <div className="lp-feat-icon"><Rss size={22} /></div>
            <div className="lp-feat-label">CMS Integration</div>
            <h3 className="lp-feat-title">Publish directly to WordPress or save as draft.</h3>
          </div>

          {/* Human in the Loop */}
          <div className="lp-feat-card">
            <div className="lp-feat-icon"><UserCheck size={22} /></div>
            <div className="lp-feat-label">Human in the Loop</div>
            <h3 className="lp-feat-title">Get approval before publishing. Stay in control.</h3>
            <div className="lp-feat-preview">
              <div className="lp-check-list">
                {['Structure', 'Readability', 'SEO', 'Sources'].map((c) => (
                  <div className="lp-check-item" key={c}>
                    <div className="lp-check-icon">✓</div>
                    {c} reviewed
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customisable Workflow */}
          <div className="lp-feat-card">
            <div className="lp-feat-icon"><Layers size={22} /></div>
            <div className="lp-feat-label">Customisable Workflow</div>
            <h3 className="lp-feat-title">Adapt the process to your content strategy and brand voice.</h3>
          </div>

          {/* Analytics */}
          <div className="lp-feat-card">
            <div className="lp-feat-icon"><FileText size={22} /></div>
            <div className="lp-feat-label">Analytics &amp; Insights</div>
            <h3 className="lp-feat-title">Track performance, engagement and what works best.</h3>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ============================================================
   EDITORIAL PREVIEW SECTION (#product)
   ============================================================ */
function EditorialPreviewSection() {
  return (
    <section id="product" className="lp-preview-section" aria-labelledby="preview-heading">
      <div className="lp-container">
        <div className="lp-preview-inner">

          {/* Doc */}
          <div style={{ position: 'relative' }}>
            <div className="lp-article-doc">
              <div className="lp-article-doc-topbar">
                <div className="lp-screen-dot" />
                <div className="lp-screen-dot" />
                <div className="lp-screen-dot" />
              </div>
              <h3 className="lp-article-doc-title">
                How AI is reshaping the developer toolkit
              </h3>
              <div className="lp-article-doc-meta">
                <span>Draft · 1,240 words</span>
                <span>·</span>
                <span>SEO 87 · Excellent</span>
              </div>
              <div className="lp-article-doc-h2">Introduction</div>
              <div className="lp-article-doc-lines">
                <div className="lp-article-doc-line" />
                <div className="lp-article-doc-line" />
                <div className="lp-article-doc-line" />
              </div>
              <div className="lp-article-doc-h2">Key Insights</div>
              <div className="lp-article-doc-lines">
                <div className="lp-article-doc-line" />
                <div className="lp-article-doc-line" />
              </div>
            </div>

            {/* Content health glass card */}
            <div className="lp-article-health" aria-label="Content health check">
              <div className="lp-health-title">Content Health</div>
              {['Structure', 'Readability', 'SEO', 'Sources'].map((h) => (
                <div className="lp-health-item" key={h}>
                  <div className="lp-health-check" aria-hidden="true">✓</div>
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Copy */}
          <div>
            <div className="lp-section-label">Editorial Preview</div>
            <h2 className="lp-section-heading" id="preview-heading">
              From research to a considered <em>first draft.</em>
            </h2>
            <p className="lp-section-desc">
              The editor shows the article title, heading hierarchy, excerpt, and a quick review
              panel — all within a clean, paper-like interface that feels like a real document,
              not a form.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link href="/generator" className="lp-btn-primary">
                Start your first draft
                <span className="btn-arrow" aria-hidden="true"><ArrowRight size={14} /></span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CMS SECTION
   ============================================================ */
function CMSSection() {
  const steps = [
    { label: 'BlogFlow AI', title: 'Article researched & drafted', primary: true, icon: <FileText size={20} /> },
    { label: 'Human review', title: 'Approved by editor', primary: false, icon: <UserCheck size={20} /> },
    { label: 'WordPress', title: 'Published or saved as draft', primary: false, icon: <Rss size={20} /> },
  ];

  return (
    <section className="lp-cms" aria-labelledby="cms-heading">
      <div className="lp-container">
        <div className="lp-cms-inner">

          {/* Copy */}
          <div>
            <div className="lp-section-label">Publishing</div>
            <h2 className="lp-section-heading" id="cms-heading">
              Finish the work where your audience reads it.
            </h2>
            <p className="lp-section-desc" style={{ marginBottom: 32 }}>
              Approved articles can be sent directly to your CMS.
              Currently supported: WordPress. Save as draft or publish immediately.
            </p>

            {/* Flow */}
            <div className="lp-cms-flow" aria-label="Publishing workflow">
              {steps.map((s, i) => (
                <div key={s.title}>
                  <div className="lp-cms-step">
                    <div className={`lp-cms-step-icon ${s.primary ? 'lp-cms-step-icon-primary' : 'lp-cms-step-icon-light'}`} aria-hidden="true">
                      {s.icon}
                    </div>
                    <div className="lp-cms-step-content">
                      <div className="lp-cms-step-label">{s.label}</div>
                      <div className="lp-cms-step-title">{s.title}</div>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="lp-cms-connector" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visual card */}
          <div>
            <div className="lp-publish-card">
              <div className="lp-wp-icon" aria-hidden="true">W</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--lp-text)' }}>WordPress</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--lp-text-muted)', marginTop: 2 }}>
                  Direct CMS integration · Encrypted REST API
                </div>
                <div className="lp-publish-status-text">
                  Draft &amp; Live Publishing Ready
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL CTA
   ============================================================ */
function FinalCTA() {
  return (
    <section className="lp-final-cta" aria-labelledby="cta-heading">
      <div className="lp-container">
        <div className="lp-cta-panel">
          <div className="lp-cta-highlight" aria-hidden="true" />
          <div className="lp-cta-grain" aria-hidden="true" />
          <div className="lp-cta-inner">
            <div className="lp-cta-pretitle">Get started today</div>
            <h2 className="lp-cta-heading" id="cta-heading">
              Your next article starts<br />
              with <KineticText text="an idea." as="em" className="italic inline-flex cursor-default font-serif" />
            </h2>
            <p className="lp-cta-desc">
              Bring research, drafting, review and publishing together in BlogFlow AI.
              One studio for the entire editorial workflow.
            </p>

            {/* Social proof avatar stack */}
            <div className="lp-cta-social-proof">
              <AvatarCircles
                avatarUrls={CREATOR_AVATARS}
                numPeople={2400}
                avatarSize={34}
                className="justify-center"
              />
              <span className="lp-cta-social-text">
                Join <strong>2,400+</strong> writers and marketing teams publishing with BlogFlow AI
              </span>
            </div>

            <div className="lp-cta-actions">
              <Link href="/generator" className="lp-btn-cta-primary" id="final-cta-btn">
                Start creating
                <span className="btn-arrow" aria-hidden="true"><ArrowRight size={16} /></span>
              </Link>
              <a href="#creators" className="lp-btn-cta-secondary">
                Inspect 3D Studio
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function LandingFooter() {
  return (
    <footer className="lp-footer" role="contentinfo">
      <div className="lp-container">
        <div className="lp-footer-inner">

          <div className="lp-footer-brand">
            <Link href="/" className="lp-footer-logo">
              BlogFlow AI
            </Link>
            <p className="lp-footer-tagline">
              AI-assisted research, drafting and publishing in one editorial studio.
            </p>
          </div>

          <div>
            <div className="lp-footer-col-title">Product</div>
            <ul className="lp-footer-links">
              <li><a href="#product">Product</a></li>
              <li><a href="#workflow">Workflow</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#creators">3D Studio</a></li>
            </ul>
          </div>

          <div>
            <div className="lp-footer-col-title">Account</div>
            <ul className="lp-footer-links">
              <li><Link href="/login">Sign in</Link></li>
              <li><Link href="/register">Create account</Link></li>
            </ul>
          </div>

          <div>
            <div className="lp-footer-col-title">Resources</div>
            <ul className="lp-footer-links">
              <li><Link href="/generator">Generator</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

        </div>

        <div className="lp-footer-bottom">
          <span className="lp-footer-copy">
            © {new Date().getFullYear()} BlogFlow AI. All rights reserved.
          </span>
          <span className="lp-footer-editorial">
            Research. Think. Publish.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   PAGE ROOT
   ============================================================ */
export default function LandingPage() {
  const [activeDeskStage, setActiveDeskStage] = useState<DeskStage>('research');

  return (
    <div className="lp-root">
      <LandingNavbar />
      <main>
        <HeroSection />
        <WorkflowSection onSyncDeskStage={setActiveDeskStage} />
        <AutomationSection
          activeDeskStage={activeDeskStage}
          onSelectDeskStage={setActiveDeskStage}
        />
        <FeatureSection />
        <EditorialPreviewSection />
        <CMSSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
