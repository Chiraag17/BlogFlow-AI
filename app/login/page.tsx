// app/login/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const EDITORIAL_STAGES = [
  { num: '01', label: 'Research', desc: 'Live Tavily primary-source indexing' },
  { num: '02', label: 'Draft', desc: 'Gemini long-form H2/H3 manuscript synthesis' },
  { num: '03', label: 'Review', desc: 'SEO, readability & human editorial gate' },
  { num: '04', label: 'Publish', desc: 'AES-256 encrypted WordPress REST sync' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { isDark, toggleTheme, mounted } = useTheme();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  const rawCallbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const callbackUrl = rawCallbackUrl.startsWith('/')
    ? rawCallbackUrl
    : (() => {
        try {
          const parsed = new URL(rawCallbackUrl);
          return (parsed.pathname || '/dashboard') + parsed.search;
        } catch {
          return '/dashboard';
        }
      })();

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else if (result?.ok) {
      router.push(callbackUrl);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F4EC] dark:bg-[#101714]">
        <Loader2 className="animate-spin text-[#163F32] dark:text-[#B8D5C5]" size={28} />
      </div>
    );
  }

  if (status === 'authenticated') return null;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F7F4EC] dark:bg-[#101714] text-[#18211D] dark:text-[#F3F0E8] transition-colors duration-300">
      {/* ============================================================
          LEFT COLUMN: WARM ARCHIVAL PAPER FORM CANVAS (7 cols on lg)
          ============================================================ */}
      <div className="lg:col-span-7 flex flex-col justify-between px-6 sm:px-12 lg:px-16 xl:px-24 py-8 sm:py-10">
        {/* Top Bar: Back to Studio + Brand Mark + Theme Toggle */}
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#68736D] dark:text-[#8E9E95] hover:text-[#18211D] dark:hover:text-[#F3F0E8] transition-colors whitespace-nowrap"
          >
            <ArrowLeft size={14} />
            Back to Studio
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#163F32]/15 dark:border-[#F3F0E8]/15 text-xs font-medium text-[#18211D] dark:text-[#F3F0E8] hover:border-[#163F32] dark:hover:border-[#B8D5C5] transition-colors whitespace-nowrap cursor-pointer"
              aria-label="Toggle color theme"
            >
              <span className="text-[#C8A15A] dark:text-[#D4AF67]">
                {mounted && isDark ? <Moon size={13} /> : <Sun size={13} />}
              </span>
              <span>{mounted && isDark ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </header>

        {/* Center: Editorial Form Block */}
        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="w-full max-w-[420px] mx-auto my-12"
        >
          {/* Editorial Wordmark Lockup */}
          <Link
            href="/landing"
            className="inline-flex items-center gap-2.5 text-[#18211D] dark:text-[#F3F0E8] mb-8 group"
          >
            <span className="w-7 h-7 rounded-lg bg-[#163F32] dark:bg-[#B8D5C5]/15 dark:border dark:border-[#B8D5C5]/35 text-[#F7F4EC] dark:text-[#B8D5C5] flex items-center justify-center">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path
                  d="M3 2h7l3 3v9H3V2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 2v3h3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <line
                  x1="5.5"
                  y1="7"
                  x2="10.5"
                  y2="7"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="5.5"
                  y1="9.5"
                  x2="10.5"
                  y2="9.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="5.5"
                  y1="12"
                  x2="8.5"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span
              className="text-xl tracking-tight font-semibold"
              style={{ fontFamily: "'Instrument Serif', 'Newsreader', Georgia, serif" }}
            >
              BlogFlow AI
            </span>
          </Link>

          {/* Serif Display Heading */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A15A] dark:text-[#D4AF67] mb-2">
              Editorial Studio Access
            </p>
            <h1
              className="text-4xl sm:text-[44px] leading-[1.08] tracking-tight text-[#18211D] dark:text-[#F3F0E8] font-normal"
              style={{ fontFamily: "'Instrument Serif', 'Newsreader', Georgia, serif" }}
            >
              Welcome <em className="italic text-[#163F32] dark:text-[#B8D5C5]">back.</em>
            </h1>
            <p className="text-sm text-[#68736D] dark:text-[#8E9E95] mt-2.5 leading-relaxed">
              Sign in to manage your connected websites, research dossiers, and WordPress publishing pipelines.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 p-3.5 mb-6 bg-[#F5E4E1] dark:bg-red-950/40 border border-red-300/60 dark:border-red-800/50 rounded-lg text-red-900 dark:text-red-200 text-xs font-medium">
              <AlertCircle size={15} className="shrink-0 text-red-700 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Registered Success Banner */}
          {searchParams?.get('registered') === '1' && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 bg-[#E5EFE5] dark:bg-emerald-950/40 border border-[#163F32]/20 dark:border-emerald-800/40 rounded-lg text-[#163F32] dark:text-[#B8D5C5] text-xs font-medium">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>Account created. Please sign in with your credentials below.</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#18211D] dark:text-[#F3F0E8] mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="editor@publication.com"
                value={form.email}
                onFocus={() => setActiveStageIdx(0)}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#17211D] border border-[#163F32]/15 dark:border-[#F3F0E8]/15 text-sm text-[#18211D] dark:text-[#F3F0E8] placeholder:text-[#68736D]/60 dark:placeholder:text-[#8E9E95]/60 focus:outline-none focus:border-[#163F32] dark:focus:border-[#B8D5C5] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#18211D] dark:text-[#F3F0E8]"
                >
                  Password
                </label>
                <span className="text-[11px] text-[#68736D] dark:text-[#8E9E95]">
                  AES-256 session protected
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onFocus={() => setActiveStageIdx(2)}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-lg bg-white dark:bg-[#17211D] border border-[#163F32]/15 dark:border-[#F3F0E8]/15 text-sm text-[#18211D] dark:text-[#F3F0E8] placeholder:text-[#68736D]/60 dark:placeholder:text-[#8E9E95]/60 focus:outline-none focus:border-[#163F32] dark:focus:border-[#B8D5C5] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#68736D] dark:text-[#8E9E95] hover:text-[#18211D] dark:hover:text-[#F3F0E8] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              onMouseEnter={() => setActiveStageIdx(3)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 mt-2 rounded-lg bg-[#163F32] hover:bg-[#1e5040] dark:bg-[#B8D5C5] dark:hover:bg-[#CCE5D7] text-[#F7F4EC] dark:text-[#102019] text-sm font-semibold transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in to Studio…
                </>
              ) : (
                <>
                  <span>Enter Editorial Studio</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Hairline Divider + Create Account Link */}
          <div className="mt-8 pt-6 border-t border-[#163F32]/12 dark:border-[#F3F0E8]/12 flex items-center justify-between text-xs text-[#68736D] dark:text-[#8E9E95]">
            <span>New to BlogFlow AI?</span>
            <Link
              href="/register"
              className="font-semibold text-[#163F32] dark:text-[#B8D5C5] hover:underline inline-flex items-center gap-1"
            >
              Create studio account
              <ArrowRight size={12} />
            </Link>
          </div>
        </motion.main>

        {/* Bottom Quiet Footer */}
        <footer className="flex items-center justify-between text-[11px] text-[#68736D] dark:text-[#8E9E95] pt-4 border-t border-[#163F32]/10 dark:border-[#F3F0E8]/10">
          <span>BlogFlow AI · Autonomous Editorial Studio</span>
          <span>Research · Think · Publish</span>
        </footer>
      </div>

      {/* ============================================================
          RIGHT COLUMN: MIDNIGHT FOREST MONOGRAPH SHOWCASE (5 cols on lg)
          ============================================================ */}
      <aside className="hidden lg:flex lg:col-span-5 p-4">
        <div className="w-full h-full rounded-2xl bg-[#163F32] dark:bg-[#0C1210] border border-[#C8A15A]/25 dark:border-[#F3F0E8]/12 text-[#F7F4EC] p-10 xl:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Warm Brass Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(200,161,90,0.45) 0%, transparent 70%)',
            }}
          />

          {/* Top Monograph Header */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#F7F4EC]/70 border-b border-[#F7F4EC]/12 pb-5">
            <span className="font-mono tracking-wider uppercase text-[11px] text-[#C8A15A]">
              Monograph · Issue 01
            </span>
            <span>5-Agent LangGraph Architecture</span>
          </div>

          {/* Center Editorial Manifesto Quote */}
          <div className="relative z-10 my-auto py-10 space-y-8">
            <blockquote
              className="text-3xl xl:text-[38px] leading-[1.16] tracking-tight font-normal text-[#F7F4EC]"
              style={{ fontFamily: "'Instrument Serif', 'Newsreader', Georgia, serif" }}
            >
              “Automation should move the work forward, not take the{' '}
              <em className="italic text-[#C8A15A]">editor</em> out of it.”
            </blockquote>

            <p className="text-sm text-[#F7F4EC]/75 leading-relaxed max-w-md">
              Every article is grounded in live Tavily web citations, synthesized with semantic
              H2/H3 structure by Gemini, and held at a human editorial checkpoint before touching
              your WordPress CMS.
            </p>

            {/* Interactive 01–04 Hairline Chapter Index */}
            <div className="pt-4">
              <div className="grid grid-cols-4 border-b border-[#F7F4EC]/15">
                {EDITORIAL_STAGES.map((stage, idx) => {
                  const isActive = idx === activeStageIdx;
                  return (
                    <button
                      key={stage.num}
                      type="button"
                      onClick={() => setActiveStageIdx(idx)}
                      className={`relative text-left py-2.5 pr-2 transition-colors cursor-pointer ${
                        isActive ? 'text-[#F7F4EC]' : 'text-[#F7F4EC]/50 hover:text-[#F7F4EC]/80'
                      }`}
                    >
                      <span
                        className={`italic mr-1.5 text-sm ${
                          isActive ? 'text-[#C8A15A] font-semibold' : ''
                        }`}
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                      >
                        {stage.num}
                      </span>
                      <span className="text-xs font-semibold">{stage.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="login-stage-brass-bar"
                          className="absolute left-0 right-3 -bottom-[1px] h-[2px] bg-[#C8A15A]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#F7F4EC]/70 mt-3 font-mono">
                {EDITORIAL_STAGES[activeStageIdx].num}. {EDITORIAL_STAGES[activeStageIdx].desc}
              </p>
            </div>
          </div>

          {/* Bottom Editorial Attribution & Quantitative Proof */}
          <div className="relative z-10 pt-6 border-t border-[#F7F4EC]/12 flex items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-semibold text-[#F7F4EC]">Sarah Chen · Managing Editor</div>
              <div className="text-[#F7F4EC]/60 mt-0.5">
                2,400+ editorial teams · 94/100 avg SEO readiness
              </div>
            </div>
            <span className="font-mono text-[11px] text-[#C8A15A] shrink-0">
              14 Citations / Article
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F4EC] dark:bg-[#101714]">
          <Loader2 className="animate-spin text-[#163F32] dark:text-[#B8D5C5]" size={28} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
