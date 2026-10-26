'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import './landing.css';
import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  Globe, Search, Lightbulb, Send,
  ArrowRight, Play, ChevronRight, BookOpen,
  FileText, BarChart2, UserCheck, Layers, Rss,
  Sun, Moon, Sparkles, CheckCircle2, ShieldCheck,
  RotateCcw, XCircle, Lock, Check, RefreshCw
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { AvatarCircles } from '@/components/ui/avatar-circles';
import { KineticText } from '@/components/ui/kinetic-text';
import GutenbergTypeBlock3D, { type TypeBlockFace } from '@/components/brand/GutenbergTypeBlock3D';
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
    ],
  },
];

/* ============================================================
   NAVBAR — Streamlined 3D Gutenberg Logo + Clean Links + 2px Brass Scroll Line
   ============================================================ */
const NAV_LINKS: { id: string; label: string; href: string; face: TypeBlockFace }[] = [
  { id: 'product', label: 'Product', href: '#product', face: 'loupe' },
  { id: 'workflow', label: 'Workflow', href: '#workflow', face: 'nib' },
  { id: 'features', label: 'Features', href: '#features', face: 'seal' },
];

function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeNavId, setActiveNavId] = useState<string>('hero');
  const [hoveredFace, setHoveredFace] = useState<TypeBlockFace | null>(null);
  const { isDark, toggleTheme, mounted } = useTheme();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 32);

      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const pct = Math.min(100, Math.max(0, Math.round((y / docHeight) * 100)));
      setScrollPct(pct);

      if (pct < 20) {
        setActiveNavId('hero');
      } else if (pct < 48) {
        setActiveNavId('product');
      } else if (pct < 76) {
        setActiveNavId('workflow');
      } else {
        setActiveNavId('features');
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeNavFace: TypeBlockFace =
    hoveredFace ||
    NAV_LINKS.find((item) => item.id === activeNavId)?.face ||
    'monogram';

  return (
    <header
      id="lp-navbar"
      className={`lp-nav${scrolled ? ' scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
      onMouseLeave={() => setHoveredFace(null)}
    >
      <div className="lp-nav-main-row">
        <div className="lp-nav-brand-cluster">
          <Link href="/" className="lp-nav-logo">
            <GutenbergTypeBlock3D
              size={32}
              activeFace={activeNavFace}
              scrollPct={scrollPct}
              interactiveStamp={true}
            />
            <span>BlogFlow AI</span>
          </Link>
        </div>

        <ul className="lp-nav-links">
          {NAV_LINKS.map((item) => {
            const isActive = activeNavId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={isActive ? 'active' : ''}
                  onMouseEnter={() => setHoveredFace(item.face)}
                  onFocus={() => setHoveredFace(item.face)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
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
              {mounted && isDark ? <Moon size={15} /> : <Sun size={15} />}
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
      </div>

      {/* Subtle 2px Brushed-Brass Scroll Progress Line */}
      <div className="lp-nav-vernier-track" aria-hidden="true">
        <div
          className="lp-nav-vernier-fill"
          style={{ width: `${scrollPct}%` }}
        />
      </div>
    </header>
  );
}

/* ============================================================
   1. HERO SECTION (Uncluttered Editorial Copy + 3D Studio Desk)
   ============================================================ */
interface ChapterStageSpec {
  id: DeskStage;
  num: string;
  label: string;
  hudMetric: string;
}

const HERO_CHAPTER_INDEX: ChapterStageSpec[] = [
  {
    id: 'research',
    num: '01',
    label: 'Research',
    hudMetric: '14 Verified Sources · 0% Hallucination',
  },
  {
    id: 'draft',
    num: '02',
    label: 'Draft',
    hudMetric: '1,840 Words · 6 H2 Sections · 5 FAQs',
  },
  {
    id: 'review',
    num: '03',
    label: 'Review',
    hudMetric: 'SEO 94/100 · Grade 8.4 · Approved',
  },
  {
    id: 'publish',
    num: '04',
    label: 'Publish',
    hudMetric: 'WP Post #4892 · Draft Synced (1.2s)',
  },
];

const HERO_REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const HERO_MORPH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function HeroSection({
  activeDeskStage,
  onSelectDeskStage,
}: {
  activeDeskStage: DeskStage;
  onSelectDeskStage: (stage: DeskStage) => void;
}) {
  const [heroStage, setHeroStage] = useState<'center' | 'split'>('center');
  const heroSectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothHeroScroll = useSpring(heroScrollProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.35,
  });

  // Apple-style 3D spatial recession as user scrolls down toward #product
  const heroStageScale = useTransform(smoothHeroScroll, [0, 0.85], [1, 0.93]);
  const heroStageRotateX = useTransform(smoothHeroScroll, [0, 0.85], [0, 9]);
  const heroStageY = useTransform(smoothHeroScroll, [0, 0.85], [0, 54]);
  const heroStageOpacity = useTransform(smoothHeroScroll, [0, 0.88], [1, 0.68]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setHeroStage('split');
      return;
    }

    const timer = setTimeout(() => {
      setHeroStage('split');
    }, 850);

    return () => clearTimeout(timer);
  }, []);

  const isSplit = heroStage === 'split';
  const activeChapter =
    HERO_CHAPTER_INDEX.find((c) => c.id === activeDeskStage) || HERO_CHAPTER_INDEX[0];

  return (
    <section
      ref={heroSectionRef}
      id="hero"
      className="lp-hero lp-perspective-stage"
      aria-labelledby="hero-headline"
    >
      <div className="lp-hero-bg" aria-hidden="true" />

      {/* ACT I: Center-Stage Keynote Reveal Overlay (0.0s -> 0.85s) */}
      <AnimatePresence>
        {!isSplit && (
          <motion.div
            key="hero-center-keynote"
            className="lp-hero-center-stage"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: HERO_REVEAL_EASE }}
            aria-hidden="true"
          >
            <div className="lp-hero-center-inner">
              <motion.div
                layoutId="hero-kicker-morph"
                transition={{ duration: 0.82, ease: HERO_MORPH_EASE }}
                className="lp-hero-kicker lp-hero-kicker-center"
              >
                AI-Powered Editorial Automation · Interactive 3D Studio
              </motion.div>

              <motion.div
                layoutId="hero-headline-morph"
                transition={{ duration: 0.88, ease: HERO_MORPH_EASE }}
                className="lp-hero-headline lp-hero-headline-center"
              >
                <span className="lp-hero-headline-row">
                  <span className="lp-hero-word-mask">
                    <motion.span
                      className="lp-hero-word-inner"
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{ duration: 0.52, delay: 0.04, ease: HERO_REVEAL_EASE }}
                    >
                      Research.
                    </motion.span>
                  </span>{' '}
                  <span className="lp-hero-word-mask">
                    <motion.span
                      className="lp-hero-word-inner"
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{ duration: 0.52, delay: 0.18, ease: HERO_REVEAL_EASE }}
                    >
                      Think.
                    </motion.span>
                  </span>
                </span>
                <span className="lp-hero-word-mask">
                  <motion.em
                    className="lp-hero-word-inner italic text-[var(--lp-primary)]"
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.56, delay: 0.32, ease: HERO_REVEAL_EASE }}
                  >
                    Publish.
                  </motion.em>
                </span>
              </motion.div>

              <motion.div
                className="lp-hero-center-seam"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.58, delay: 0.24, ease: HERO_REVEAL_EASE }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACT II: Split-Column Studio Layout (Clean Editorial Copy Left, 3D Desk Right) */}
      <motion.div
        className="lp-container lp-hero-dive-stage"
        style={{
          scale: heroStageScale,
          rotateX: heroStageRotateX,
          y: heroStageY,
          opacity: heroStageOpacity,
          transformPerspective: 1400,
        }}
      >
        <div className="lp-hero-inner">

          {/* Left: Uncluttered Editorial Copy + CTAs + Social Proof */}
          <div className="lp-hero-left">
            {isSplit ? (
              <motion.div
                layoutId="hero-kicker-morph"
                transition={{ duration: 0.82, ease: HERO_MORPH_EASE }}
                className="lp-hero-kicker"
              >
                AI-Powered Editorial Automation · Interactive 3D Studio
              </motion.div>
            ) : (
              <div className="lp-hero-kicker opacity-0 pointer-events-none">
                AI-Powered Editorial Automation · Interactive 3D Studio
              </div>
            )}

            {isSplit ? (
              <motion.h1
                layoutId="hero-headline-morph"
                transition={{ duration: 0.88, ease: HERO_MORPH_EASE }}
                className="lp-hero-headline"
                id="hero-headline"
              >
                <span className="lp-hero-headline-row">
                  <KineticText text="Research." as="span" className="inline-flex cursor-default font-serif" />{' '}
                  <KineticText text="Think." as="span" className="inline-flex cursor-default font-serif" />
                </span>
                <KineticText
                  text="Publish."
                  as="em"
                  className="italic text-[var(--lp-primary)] inline-flex cursor-default font-serif"
                />
              </motion.h1>
            ) : (
              <h1 className="lp-hero-headline opacity-0 pointer-events-none" id="hero-headline">
                <span className="lp-hero-headline-row">
                  <span>Research.</span> <span>Think.</span>
                </span>
                <em>Publish.</em>
              </h1>
            )}

            <motion.p
              className="lp-hero-desc"
              initial={false}
              animate={
                isSplit
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 18 }
              }
              transition={{ duration: 0.62, delay: isSplit ? 0.22 : 0, ease: HERO_REVEAL_EASE }}
            >
              BlogFlow AI transforms any website, topic, or brief into citation-grounded,
              SEO-optimized articles — orchestrating live web research, long-form drafting,
              human editorial sign-off, and WordPress publishing in one quiet studio.
            </motion.p>

            {/* Primary & Secondary CTAs */}
            <motion.div
              className="lp-hero-ctas"
              initial={false}
              animate={isSplit ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.58, delay: isSplit ? 0.34 : 0, ease: HERO_REVEAL_EASE }}
            >
              <Link
                href="/generator"
                className="lp-btn-primary"
                id="hero-cta-primary"
              >
                Start creating
                <span className="btn-arrow" aria-hidden="true"><ArrowRight size={16} /></span>
              </Link>
              <a href="#product" className="lp-btn-secondary" id="hero-cta-secondary">
                <Search size={14} />
                Inspect Live Galley Proof
              </a>
            </motion.div>

            {/* Social Proof Reveal */}
            <motion.div
              className="lp-hero-social"
              initial={false}
              animate={isSplit ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.58, delay: isSplit ? 0.44 : 0, ease: HERO_REVEAL_EASE }}
            >
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
            </motion.div>
          </div>

          {/* Right: 3D FloatingEditorialDesk */}
          <motion.div
            className="lp-hero-right-3d"
            initial={false}
            animate={
              isSplit
                ? { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }
                : { opacity: 0, x: 56, scale: 0.94, filter: 'blur(12px)' }
            }
            transition={{ duration: 0.92, delay: isSplit ? 0.08 : 0, ease: HERO_MORPH_EASE }}
          >
            <FloatingEditorialDesk
              currentStage={activeDeskStage}
              onStageChange={onSelectDeskStage}
              interactive={true}
              activeTopicTitle={`${activeChapter.num}. ${activeChapter.label}`}
              activeTopicMetric={activeChapter.hudMetric}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Quiet Editorial Principles Strip */}
      <motion.div
        className="lp-trust"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        initial={false}
        animate={isSplit ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.65, delay: isSplit ? 0.56 : 0, ease: HERO_REVEAL_EASE }}
      >
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
      </motion.div>
    </section>
  );
}

/* ============================================================
   2. PRODUCT SHOWCASE (#product — 3D Manuscript Unfold & Scroll-Driven X-Ray Loupe)
   ============================================================ */
function ProductXRaySection() {
  const [activePresetId, setActivePresetId] = useState<string>(HERO_TOPIC_PRESETS[0].id);
  const [loupeState, setLoupeState] = useState<{ x: number; y: number; active: boolean }>({
    x: 240,
    y: 120,
    active: false,
  });
  const [autoLoupe, setAutoLoupe] = useState<{ x: number; y: number; active: boolean }>({
    x: 160,
    y: 110,
    active: false,
  });
  const [xrayPinned, setXrayPinned] = useState(false);

  const productSectionRef = useRef<HTMLElement | null>(null);
  const proofCardRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress: productScrollProgress } = useScroll({
    target: productSectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProductScroll = useSpring(productScrollProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.35,
  });

  // 1. Hero-to-Product 3D Manuscript Dive & Unfold transforms
  const manuscriptRotateX = useTransform(smoothProductScroll, [0.06, 0.36], [22, 0]);
  const manuscriptScale = useTransform(smoothProductScroll, [0.06, 0.36], [0.9, 1]);
  const manuscriptY = useTransform(smoothProductScroll, [0.06, 0.36], [48, 0]);
  const copyBlurPx = useTransform(smoothProductScroll, [0.05, 0.28], [5, 0]);
  const copyFilter = useTransform(copyBlurPx, (v) => `blur(${v.toFixed(2)}px)`);
  const copyOpacity = useTransform(smoothProductScroll, [0.05, 0.26], [0.35, 1]);
  const copyY = useTransform(smoothProductScroll, [0.05, 0.28], [28, 0]);

  // Specular Brass Light Sweep across the Galley Proof
  const brassSheenX = useTransform(smoothProductScroll, [0.12, 0.65], ['-120%', '220%']);

  // 2. Scroll-Driven Automated X-Ray Loupe S-Curve Sweep
  useMotionValueEvent(smoothProductScroll, 'change', (v) => {
    if (v >= 0.20 && v <= 0.82) {
      const t = (v - 0.20) / 0.62; // normalized 0 -> 1 across active viewport window
      const cardEl = proofCardRef.current;
      const width = cardEl ? cardEl.clientWidth : 540;
      const height = cardEl ? cardEl.clientHeight : 270;

      // Smooth S-curve across H2 heading, inline citations [1] & [2], and source chips
      const x = Math.round(width * (0.18 + 0.64 * t));
      const y = Math.round(height * (0.52 + 0.24 * Math.sin(t * Math.PI * 2)));

      setAutoLoupe({ x, y, active: true });
    } else {
      setAutoLoupe((prev) => (prev.active ? { ...prev, active: false } : prev));
    }
  });

  const activePreset =
    HERO_TOPIC_PRESETS.find((p) => p.id === activePresetId) || HERO_TOPIC_PRESETS[0];

  const handleProofMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLoupeState({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
      active: true,
    });
  };

  const handleProofMouseLeave = () => {
    setLoupeState((prev) => ({ ...prev, active: false }));
  };

  // Manual pointer hover takes immediate priority over scroll-driven auto-loupe
  const effectiveLoupeX = loupeState.active ? loupeState.x : autoLoupe.x;
  const effectiveLoupeY = loupeState.active ? loupeState.y : autoLoupe.y;
  const isLoupeActive = loupeState.active || autoLoupe.active;
  const showXrayLens = isLoupeActive || xrayPinned;

  const loupeModeLabel = xrayPinned
    ? 'X-RAY LOCKED ON'
    : loupeState.active
      ? 'MANUAL CURSOR · 2.4×'
      : autoLoupe.active
        ? 'SCROLL AUTO-SWEEP · 2.4×'
        : 'OPTICAL STANDBY';

  return (
    <section
      ref={productSectionRef}
      id="product"
      className="lp-preview-section lp-perspective-stage"
      aria-labelledby="preview-heading"
    >
      <div className="lp-container">
        <div className="lp-preview-inner">
          {/* Left Column: Optical Camera Rack-Focus + 3 Clickable Topic Briefs */}
          <motion.div
            style={{
              filter: copyFilter,
              opacity: copyOpacity,
              y: copyY,
            }}
          >
            <div className="lp-section-label">Interactive Galley Proof · X-Ray Loupe</div>
            <h2 className="lp-section-heading" id="preview-heading">
              From live citations to a considered <em>first draft.</em>
            </h2>
            <p className="lp-section-desc">
              Scroll to watch the <strong>2.4× Brass Optical Loupe</strong> automatically sweep
              across the galley proof — or move your cursor over the manuscript to take manual
              control and inspect verified primary sources underneath every paragraph.
            </p>

            {/* 3 Clickable Topic Briefs */}
            <div style={{ marginTop: 24 }}>
              <div className="lp-xray-kicker" style={{ marginBottom: 10 }}>
                SELECT EDITORIAL BRIEF TO INSPECT
              </div>
              <div className="lp-brief-switcher" role="tablist" aria-label="Sample Editorial Briefs">
                {HERO_TOPIC_PRESETS.map((preset, idx) => {
                  const isSelected = preset.id === activePreset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActivePresetId(preset.id)}
                      className={`lp-brief-tab${isSelected ? ' active' : ''}`}
                    >
                      <span className="lp-brief-idx">0{idx + 1}</span>
                      <span>{preset.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link
                href={`/generator?topic=${encodeURIComponent(activePreset.articleTitle)}`}
                className="lp-btn-primary"
              >
                Generate &ldquo;{activePreset.shortLabel}&rdquo;
                <span className="btn-arrow" aria-hidden="true"><ArrowRight size={14} /></span>
              </Link>
              <button
                type="button"
                onClick={() => setXrayPinned((v) => !v)}
                className="lp-btn-secondary"
              >
                <Search size={14} />
                {xrayPinned ? 'Unlock X-Ray Layer' : 'Lock Full X-Ray View'}
              </button>
            </div>
          </motion.div>

          {/* Right Column: 3D Unfolding Manuscript Surface with Scroll + Cursor X-Ray Optical Loupe */}
          <motion.div
            className="lp-manuscript-unfold-wrap"
            style={{
              rotateX: manuscriptRotateX,
              scale: manuscriptScale,
              y: manuscriptY,
              transformPerspective: 1400,
            }}
          >
            <div className="lp-xray-workbench lp-brass-rim-card" style={{ margin: 0 }}>
              {/* Diagonal Brushed-Brass Specular Light Sweep */}
              <motion.div
                className="lp-specular-brass-sweep"
                style={{ x: brassSheenX }}
                aria-hidden="true"
              />

              <div className="lp-xray-header">
                <div className="lp-xray-title-cluster">
                  <span className="lp-xray-kicker">
                    GALLEY PROOF · {activePreset.category.toUpperCase()}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="lp-xray-mode-pill" aria-hidden="true">
                      <span className={`lp-xray-mode-dot${showXrayLens ? ' is-live' : ''}`} />
                      {loupeModeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setXrayPinned((v) => !v)}
                      className={`lp-xray-pin-btn${xrayPinned ? ' active' : ''}`}
                    >
                      <Search size={11} />
                      {xrayPinned ? 'X-Ray Locked On' : 'Lock Full X-Ray'}
                    </button>
                  </div>
                </div>
              </div>

              <div
                ref={proofCardRef}
                className={`lp-xray-proof-card${showXrayLens ? ' loupe-engaged' : ''}`}
                onMouseMove={handleProofMouseMove}
                onMouseLeave={handleProofMouseLeave}
                style={{ padding: '24px 26px', minHeight: 260 }}
              >
                {/* Layer A: Finished Editorial Galley Prose */}
                <div className="lp-xray-layer-prose" style={{ gap: 10 }}>
                  <div className="lp-xray-proof-meta-row">
                    <span className="lp-xray-proof-cat">{activePreset.category}</span>
                    <span className="lp-xray-proof-stats">
                      {activePreset.wordCount} · {activePreset.readTime} · SEO {activePreset.seoScore}/100 ({activePreset.seoRating})
                    </span>
                  </div>
                  <h3 className="lp-xray-proof-title" style={{ fontSize: '1.35rem' }}>
                    {activePreset.articleTitle}
                  </h3>
                  <div className="lp-xray-proof-h2" style={{ fontSize: '0.78rem', marginTop: 4 }}>
                    {activePreset.h2Heading}
                  </div>
                  <p className="lp-xray-proof-p" style={{ fontSize: '0.88rem', lineHeight: 1.65 }}>
                    {activePreset.excerptParagraphs[0]}
                  </p>
                  <p className="lp-xray-proof-p" style={{ fontSize: '0.88rem', lineHeight: 1.65 }}>
                    {activePreset.excerptParagraphs[1]}
                  </p>
                </div>

                {/* Layer B: Sub-Surface X-Ray Citation & Telemetry Blueprint */}
                <div
                  className="lp-xray-layer-blueprint"
                  style={{
                    padding: '22px 26px',
                    clipPath: xrayPinned
                      ? 'circle(140% at 50% 50%)'
                      : isLoupeActive
                        ? `circle(112px at ${effectiveLoupeX}px ${effectiveLoupeY}px)`
                        : 'circle(0px at 50% 50%)',
                  }}
                  aria-hidden={!showXrayLens}
                >
                  <div className="lp-xray-blueprint-top">
                    <span className="lp-xray-blueprint-badge">
                      X-RAY TELEMETRY · VERIFIED SOURCE GROUNDING
                    </span>
                    <span className="lp-xray-blueprint-score">
                      SEMANTIC SCORE {activePreset.seoScore}/100 · 0 HALLUCINATIONS
                    </span>
                  </div>
                  <div className="lp-xray-blueprint-prompt">
                    PROMPT BRIEF: &ldquo;{activePreset.topicPrompt}&rdquo;
                  </div>
                  <div className="lp-xray-sources-grid">
                    {activePreset.sources.map((src, sIdx) => (
                      <div key={src.label} className="lp-xray-source-chip">
                        <span className="lp-xray-source-cite">[{sIdx + 1}]</span>
                        <div className="lp-xray-source-body">
                          <span className="lp-xray-source-name">{src.label}</span>
                          <span className="lp-xray-source-stat">{src.stat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brass Optical Loupe Ring (Active during Scroll Sweep OR Cursor Hover) */}
                {isLoupeActive && !xrayPinned && (
                  <div
                    className={`lp-xray-loupe-ring${loupeState.active ? ' is-manual' : ' is-auto'}`}
                    style={{
                      width: 224,
                      height: 224,
                      transform: `translate(${effectiveLoupeX - 112}px, ${effectiveLoupeY - 112}px)`,
                    }}
                    aria-hidden="true"
                  >
                    <span className="lp-xray-loupe-label">
                      {loupeState.active ? 'OPTICAL LOUPE · 2.4×' : 'AUTO-SWEEP LOUPE · 2.4×'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
  const [manualOverride, setManualOverride] = useState<boolean>(false);
  const workflowRef = useRef<HTMLElement | null>(null);

  // Interactive states inside Stage 04 (Review) and Stage 05 (Publish)
  const [reviewDecision, setReviewDecision] = useState<'pending' | 'approved' | 'revision' | 'rejected'>('pending');
  const [reviewerNote, setReviewerNote] = useState<string>('Strong primary citations in Section 02. Approved for WordPress staging.');
  const [wpPublishMode, setWpPublishMode] = useState<'draft' | 'schedule'>('draft');
  const [wpPushSimulated, setWpPushSimulated] = useState<boolean>(false);

  const { scrollYProgress: wfScrollProgress } = useScroll({
    target: workflowRef,
    offset: ['start end', 'end start'],
  });

  const smoothWfScroll = useSpring(wfScrollProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.35,
  });

  // Optical Camera Rack-Focus & Aperture Scale on entry
  const wfScale = useTransform(smoothWfScroll, [0.04, 0.26], [0.94, 1]);
  const wfY = useTransform(smoothWfScroll, [0.04, 0.26], [36, 0]);
  const wfBlurPx = useTransform(smoothWfScroll, [0.04, 0.24], [4.5, 0]);
  const wfFilter = useTransform(wfBlurPx, (v) => `blur(${v.toFixed(2)}px)`);
  const wfBeamWidth = useTransform(smoothWfScroll, [0.18, 0.78], ['12%', '100%']);

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

  // Scroll-scrubbed stage progression (yields immediately when user clicks a stage)
  useMotionValueEvent(smoothWfScroll, 'change', (v) => {
    if (manualOverride) return;
    if (v < 0.28) {
      setSelectedStage('discover');
    } else if (v < 0.41) {
      setSelectedStage('research');
    } else if (v < 0.54) {
      setSelectedStage('think');
    } else if (v < 0.67) {
      setSelectedStage('review');
    } else if (v <= 0.85) {
      setSelectedStage('publish');
    }
  });

  const handleStageClick = (stage: (typeof stages)[number]) => {
    setManualOverride(true);
    setSelectedStage(stage.id);
    onSyncDeskStage(stage.deskStage);
  };

  return (
    <section
      ref={workflowRef}
      id="workflow"
      className="lp-workflow"
      aria-labelledby="workflow-heading"
    >
      <motion.div
        className="lp-container"
        style={{
          scale: wfScale,
          y: wfY,
          filter: wfFilter,
        }}
      >
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
            <a href="#hero" className="lp-workflow-explore">
              View in 3D Hero Studio <ChevronRight size={14} />
            </a>
          </div>
          <div>
            <p className="lp-section-desc">
              Scroll to scrub through the 5-agent pipeline or click any stage below to lock focus —
              from live competitor gap discovery and Tavily citation extraction to human editorial
              sign-off and encrypted WordPress REST publishing.
            </p>
          </div>
        </div>

        {/* Scroll-Scrubbed Brushed-Brass Optical Pipeline Rail */}
        <div className="lp-wf-scroll-rail" aria-hidden="true">
          <motion.div className="lp-wf-scroll-rail-fill" style={{ width: wfBeamWidth }} />
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
      </motion.div>
    </section>
  );
}

/* ============================================================
   4. FEATURES SECTION (Architectural Aperture Scale & Midnight Forest Studio Shift)
   ============================================================ */
function FeatureSection() {
  const featuresRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress: featScrollProgress } = useScroll({
    target: featuresRef,
    offset: ['start end', 'end start'],
  });

  const smoothFeatScroll = useSpring(featScrollProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.35,
  });

  // Apple Pro-Style Architectural Aperture Expansion + Optical Rack-Focus
  const apertureScale = useTransform(smoothFeatScroll, [0.04, 0.32, 0.78, 0.96], [0.91, 1, 1, 0.95]);
  const apertureRadius = useTransform(smoothFeatScroll, [0.04, 0.32, 0.78, 0.96], [40, 22, 22, 36]);
  const apertureBlurPx = useTransform(smoothFeatScroll, [0.03, 0.22], [5, 0]);
  const apertureFilter = useTransform(apertureBlurPx, (v) => `blur(${v.toFixed(2)}px)`);
  const studioSheenX = useTransform(smoothFeatScroll, [0.12, 0.74], ['-110%', '210%']);

  return (
    <section
      ref={featuresRef}
      id="features"
      className="lp-features lp-features-aperture-outer"
      aria-labelledby="features-heading"
    >
      <motion.div
        className="lp-features-midnight-vault"
        style={{
          scale: apertureScale,
          borderRadius: apertureRadius,
          filter: apertureFilter,
        }}
      >
        {/* Scroll-Scrubbed Specular Brass Light Sweep across the Midnight Vault */}
        <motion.div
          className="lp-vault-specular-sweep"
          style={{ x: studioSheenX }}
          aria-hidden="true"
        />

        <div className="lp-container">
          <div className="lp-features-header">
            <div className="lp-section-label lp-vault-kicker">
              Why BlogFlow AI · Midnight Studio Vault
            </div>
            <h2 className="lp-section-heading lp-vault-heading" id="features-heading">
              Built for creators, marketers and <em>editorial teams.</em>
            </h2>
            <p className="lp-section-desc lp-vault-desc">
              Everything you need to create high-quality, citation-backed content — engineered
              with precision typography, SEO telemetry, and human governance.
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
                <div className="lp-feat-score-big">94</div>
                <div className="lp-feat-score-label">Optimal</div>
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
      </motion.div>
    </section>
  );
}

/* ============================================================
   FINAL CTA (3D Aperture Unfold)
   ============================================================ */
function FinalCTA() {
  const ctaRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: ctaScrollProgress } = useScroll({
    target: ctaRef,
    offset: ['start end', 'center center'],
  });
  const smoothCtaScroll = useSpring(ctaScrollProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.35,
  });

  const ctaScale = useTransform(smoothCtaScroll, [0, 1], [0.92, 1]);
  const ctaRotateX = useTransform(smoothCtaScroll, [0, 1], [12, 0]);
  const ctaY = useTransform(smoothCtaScroll, [0, 1], [36, 0]);

  return (
    <section ref={ctaRef} className="lp-final-cta lp-perspective-stage" aria-labelledby="cta-heading">
      <div className="lp-container">
        <motion.div
          className="lp-cta-panel"
          style={{
            scale: ctaScale,
            rotateX: ctaRotateX,
            y: ctaY,
            transformPerspective: 1400,
          }}
        >
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
              <a href="#hero" className="lp-btn-cta-secondary">
                Explore 3D Hero Desk
              </a>
            </div>
          </div>
        </motion.div>
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
        <HeroSection
          activeDeskStage={activeDeskStage}
          onSelectDeskStage={setActiveDeskStage}
        />
        <ProductXRaySection />
        <WorkflowSection onSyncDeskStage={setActiveDeskStage} />
        <FeatureSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
