'use client';

import React from 'react';

import './landing.css';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  Globe, Search, Lightbulb, CheckCircle, Send,
  ArrowRight, Play, ChevronRight, BookOpen,
  FileText, BarChart2, UserCheck, Layers, Rss,
  Sun, Moon
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { AvatarCircles } from '@/components/ui/avatar-circles';
import { KineticText } from '@/components/ui/kinetic-text';

const CREATOR_AVATARS = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    profileUrl: '#',
    name: 'Sarah Chen · Content Lead',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    profileUrl: '#',
    name: 'Alex Rivera · Tech Editor',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    profileUrl: '#',
    name: 'Elena Rostova · SEO Strategist',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    profileUrl: '#',
    name: 'Marcus Vance · Publisher',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    profileUrl: '#',
    name: 'Chloe Kim · Editorial Director',
  },
];


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
        <li><a href="#creators">For creators</a></li>
      </ul>

      <div className="lp-nav-actions">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="lp-theme-toggle"
          aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
          id="theme-toggle-btn"
        >
          <span className="lp-theme-toggle-icon" aria-hidden="true">
            {mounted && isDark ? (
              <Moon size={16} />
            ) : (
              <Sun size={16} />
            )}
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
   HERO SECTION
   ============================================================ */
function HeroSection() {
  const [seoCount, setSeoCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = 87;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setSeoCount(start);
      if (start >= target) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="lp-hero" aria-labelledby="hero-headline">
      <div className="lp-hero-bg" aria-hidden="true" />
      <div className="lp-container">
        <div className="lp-hero-inner">

          {/* Left: Copy */}
          <div className="lp-hero-left">
            <div className="lp-hero-badge" aria-label="Editorial automation platform">
              <span className="lp-hero-badge-dot" />
              AI-Powered Editorial Automation
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
              SEO-optimised articles — so you can focus on what matters most: your ideas.
            </p>

            <div className="lp-hero-ctas">
              <Link href="/generator" className="lp-btn-primary" id="hero-cta-primary">
                Start creating
                <span className="btn-arrow" aria-hidden="true"><ArrowRight size={16} /></span>
              </Link>
              <a href="#workflow" className="lp-btn-secondary" id="hero-cta-secondary">
                <Play size={14} />
                Watch how it works
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

          {/* Right: Workspace visual */}
          <div className="lp-hero-right" aria-hidden="true">
            <div className="lp-workspace">

              {/* Laptop mockup */}
              <div className="lp-laptop">
                <div className="lp-laptop-body">
                  <div className="lp-laptop-screen">
                    <div className="lp-laptop-screen-inner">
                      <div className="lp-screen-topbar">
                        <div className="lp-screen-dot" />
                        <div className="lp-screen-dot" />
                        <div className="lp-screen-dot" />
                      </div>
                      <div className="lp-screen-content">
                        <div className="lp-screen-article-title">
                          The Future of AI-Powered Search
                        </div>
                        <div className="lp-screen-article-meta">
                          <span>Draft</span>
                          <span>·</span>
                          <span>1,240 words</span>
                          <span>·</span>
                          <span>SEO 87</span>
                        </div>
                        <div className="lp-screen-img" />
                        <div className="lp-screen-lines">
                          <div className="lp-screen-line" />
                          <div className="lp-screen-line" />
                          <div className="lp-screen-line" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lp-laptop-base" />
                </div>
              </div>

              {/* Notebook */}
              <div className="lp-notebook">
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
              <div className="lp-books">
                <div className="lp-book" data-label="Research" style={{ width: 30, height: 90, background: 'linear-gradient(135deg,#244737,#163F32)' }} />
                <div className="lp-book" data-label="Ideas" style={{ width: 26, height: 80, background: 'linear-gradient(135deg,#315B4B,#244737)' }} />
                <div className="lp-book" data-label="Publish" style={{ width: 22, height: 70, background: 'linear-gradient(135deg,#C8A15A,#b08945)' }} />
              </div>

              {/* Glass card: Researching sources */}
              <div className="glass-card gc-research">
                <div className="glass-card-inner">
                  <div className="gc-title">Researching Sources…</div>
                  <div className="gc-item">
                    <div className="gc-dot gc-dot-success">✓</div>
                    Websites
                  </div>
                  <div className="gc-item">
                    <div className="gc-dot gc-dot-success">✓</div>
                    Academic papers
                  </div>
                  <div className="gc-item">
                    <div className="gc-dot gc-dot-success">✓</div>
                    News &amp; blogs
                  </div>
                  <div className="gc-item">
                    <div className="gc-dot gc-dot-progress">◉</div>
                    Analysing insights…
                  </div>
                </div>
              </div>

              {/* Glass card: Top Sources */}
              <div className="glass-card gc-sources">
                <div className="glass-card-inner">
                  <div className="gc-title">Top Sources</div>
                  {[
                    { label: 'MIT Technology Review', color: '#c41e3a', initial: 'M' },
                    { label: 'Nature', color: '#1a6b2f', initial: 'N' },
                    { label: 'TechCrunch', color: '#006747', initial: 'T' },
                    { label: 'Wikipedia', color: '#333', initial: 'W' },
                  ].map((s) => (
                    <div className="gc-source-item" key={s.label}>
                      <div className="gc-source-icon" style={{ background: s.color }}>{s.initial}</div>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Glass card: Article draft */}
              <div className="glass-card gc-article">
                <div className="glass-card-inner">
                  <div className="gc-title">Article Draft</div>
                  {[
                    { label: 'Research', done: true },
                    { label: 'Outline', done: true },
                    { label: 'Writing', done: true },
                    { label: 'Review', done: false },
                    { label: 'Publish', done: false },
                  ].map((r) => (
                    <div className="gc-status-row" key={r.label}>
                      {r.label}
                      <div className={`gc-status-check ${r.done ? 'gc-check-done' : 'gc-check-pending'}`}>
                        {r.done ? '✓' : '○'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glass card: SEO score */}
              <div className="glass-card gc-seo">
                <div className="glass-card-inner">
                  <div className="gc-title">SEO Score</div>
                  <div className="gc-seo-score">{seoCount}</div>
                  <div className="gc-seo-label">Excellent</div>
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
   WORKFLOW SECTION
   ============================================================ */
function WorkflowSection() {
  const stages = [
    {
      n: '01',
      icon: <Globe size={22} />,
      title: 'Discover',
      desc: 'Find relevant topics and opportunities from any source URL.',
      tag: 'Web search + AI',
    },
    {
      n: '02',
      icon: <Search size={22} />,
      title: 'Research',
      desc: 'Analyse multiple sources and extract key insights and facts.',
      tag: 'Multi-source analysis',
    },
    {
      n: '03',
      icon: <Lightbulb size={22} />,
      title: 'Think',
      desc: 'AI synthesises information into a structured outline and draft.',
      tag: 'Smart AI synthesis',
    },
    {
      n: '04',
      icon: <UserCheck size={22} />,
      title: 'Review',
      desc: 'Human approval for quality, accuracy and brand voice.',
      tag: 'Editorial review',
    },
    {
      n: '05',
      icon: <Send size={22} />,
      title: 'Publish',
      desc: 'Auto-publish to your CMS (WordPress) or save as draft.',
      tag: 'CMS integration',
    },
  ];

  return (
    <section id="workflow" className="lp-workflow" aria-labelledby="workflow-heading">
      <div className="lp-container">
        <div className="lp-workflow-header">
          <div>
            <div className="lp-section-label">The complete workflow</div>
            <h2 className="lp-section-heading" id="workflow-heading">
              From idea to published article —{' '}
              <KineticText
                text="automatically."
                as="em"
                className="italic text-[var(--lp-primary)] inline-flex cursor-default font-serif"
              />
            </h2>
            <a href="#features" className="lp-workflow-explore">
              Explore the workflow <ChevronRight size={14} />
            </a>
          </div>
          <div>
            <p className="lp-section-desc">
              Our AI handles the heavy lifting, so you can focus on creativity, strategy
              and your unique perspective. Every article goes through a structured pipeline
              that ensures quality before it ever reaches publishing.
            </p>
          </div>
        </div>

        <div className="lp-pipeline" role="list">
          {stages.map((s, i) => (
            <React.Fragment key={s.title}>
              <div className="lp-stage" role="listitem">
                <div className="lp-stage-card">
                  <span className="lp-stage-number">{s.n}</span>
                  <div className="lp-stage-icon" aria-hidden="true">{s.icon}</div>
                  <h3 className="lp-stage-title">{s.title}</h3>
                  <p className="lp-stage-desc">{s.desc}</p>
                  <span className="lp-stage-tag">{s.tag}</span>
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className="lp-pipeline-arrow" aria-hidden="true">
                  <ChevronRight />
                  <div className="lp-pipeline-signal" style={{ animationDelay: `${i * 0.8}s` }} />
                </div>
              )}
            </React.Fragment>
          ))}
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
          <div className="lp-section-label">Thy BlogFlow AI</div>
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
   AUTOMATION vs HUMAN SECTION
   ============================================================ */
function AutomationSection() {
  const automated = [
    'Topic discovery',
    'Research aggregation',
    'Draft generation',
    'Quality checks',
  ];
  const human = [
    'Review draft',
    'Edit content',
    'Approve publication',
    'Choose destination',
  ];

  return (
    <section id="creators" className="lp-automation" aria-labelledby="automation-heading">
      <div className="lp-container">
        <div style={{ maxWidth: 600, margin: '0 auto 64px' }}>
          <div className="lp-section-label">Philosophy</div>
          <h2 className="lp-section-heading" id="automation-heading">
            Automation should move the work forward,<br />
            not take the <em>editor</em> out of it.
          </h2>
          <p className="lp-section-desc">
            Let automation handle repetitive steps while you retain control over what gets
            approved and published.
          </p>
        </div>

        <div className="lp-automation-inner">
          {/* Automated */}
          <div className="lp-automation-col">
            <div className="lp-auto-title lp-auto-title-light">Automation</div>
            <div className="lp-auto-rule lp-auto-rule-light" />
            {automated.map((item) => (
              <div className="lp-auto-item lp-auto-item-light" key={item}>
                <div className="lp-auto-bullet lp-auto-bullet-light" />
                <span className="lp-auto-text lp-auto-text-light">{item}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="lp-automation-divider" aria-hidden="true">
            <div className="lp-automation-divider-line" />
            <span className="lp-automation-divider-label">prepares → decides</span>
            <div className="lp-automation-divider-line" />
          </div>

          {/* Human */}
          <div className="lp-automation-col lp-automation-col-dark">
            <div className="lp-auto-title lp-auto-title-dark">Human decisions</div>
            <div className="lp-auto-rule lp-auto-rule-dark" />
            {human.map((item) => (
              <div className="lp-auto-item lp-auto-item-dark" key={item}>
                <div className="lp-auto-bullet lp-auto-bullet-dark" />
                <span className="lp-auto-text lp-auto-text-dark">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   EDITORIAL PREVIEW SECTION
   ============================================================ */
function EditorialPreviewSection() {
  return (
    <section className="lp-preview-section" aria-labelledby="preview-heading">
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
                  Direct CMS integration
                </div>
                <div className="lp-publish-status">
                  <span>●</span> Published
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
              <a href="#workflow" className="lp-btn-cta-secondary">
                See how it works
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
              <li><a href="https://github.com" target="_blank" rel="noreferrer">Documentation</a></li>
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
  return (
    <div className="lp-root">
      <LandingNavbar />
      <main>
        <HeroSection />
        <WorkflowSection />
        <FeatureSection />
        <AutomationSection />
        <EditorialPreviewSection />
        <CMSSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
