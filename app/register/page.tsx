// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import EditorialPressPass3D from '@/components/auth/EditorialPressPass3D';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { isDark, toggleTheme, mounted } = useTheme();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [doorsOpening, setDoorsOpening] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      e.password = 'Password is required.';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: 'An account with this email already exists.' });
        } else {
          setErrors({ general: data.error || 'Registration failed. Please try again.' });
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setDoorsOpening(true);
      }, 650);
      setTimeout(() => {
        router.push('/login?registered=1');
      }, 1200);
    } catch {
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
    disabled: loading || success,
  });

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F7F4EC] dark:bg-[#101714] text-[#18211D] dark:text-[#F3F0E8] transition-colors duration-300 overflow-hidden">
      {/* ============================================================
          LEFT COLUMN: WARM ARCHIVAL PAPER FORM CANVAS (7 cols on lg)
          ============================================================ */}
      <motion.div
        animate={
          doorsOpening
            ? { x: '-105%', opacity: 0 }
            : { x: '0%', opacity: 1 }
        }
        transition={{ duration: 0.52, ease: EASE_OUT }}
        className="lg:col-span-7 flex flex-col justify-between px-6 sm:px-12 lg:px-16 xl:px-24 py-8 sm:py-10"
      >
        {/* Top Bar */}
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#68736D] dark:text-[#8E9E95] hover:text-[#18211D] dark:hover:text-[#F3F0E8] transition-colors whitespace-nowrap"
          >
            <ArrowLeft size={14} />
            Back to Studio
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#163F32]/15 dark:border-[#F3F0E8]/15 text-xs font-medium text-[#18211D] dark:text-[#F3F0E8] hover:border-[#163F32] dark:hover:border-[#B8D5C5] transition-colors whitespace-nowrap cursor-pointer"
            aria-label="Toggle color theme"
          >
            <span className="text-[#C8A15A] dark:text-[#D4AF67]">
              {mounted && isDark ? <Moon size={13} /> : <Sun size={13} />}
            </span>
            <span>{mounted && isDark ? 'Dark' : 'Light'}</span>
          </button>
        </header>

        {/* Center Form */}
        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="w-full max-w-[420px] mx-auto my-6"
        >
          {/* Editorial Wordmark Lockup */}
          <Link
            href="/landing"
            className="inline-flex items-center gap-2.5 text-[#18211D] dark:text-[#F3F0E8] mb-5"
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

          <div className="mb-5">
            <p className="text-xs font-medium text-[#C8A15A] dark:text-[#D4AF67] mb-1.5">
              New Editorial Workspace · Live 3D Credential Minting
            </p>
            <h1
              className="text-4xl sm:text-[42px] leading-[1.08] tracking-tight text-[#18211D] dark:text-[#F3F0E8] font-normal"
              style={{ fontFamily: "'Instrument Serif', 'Newsreader', Georgia, serif" }}
            >
              Create your <em className="italic text-[#163F32] dark:text-[#B8D5C5]">studio.</em>
            </h1>
            <p className="text-sm text-[#68736D] dark:text-[#8E9E95] mt-2 leading-relaxed">
              Watch your 3D Press Pass engrave your identity as you type, then flip 180° when setting your password.
            </p>
          </div>

          {errors.general && (
            <div className="flex items-center gap-3 p-3.5 mb-5 bg-[#F5E4E1] dark:bg-red-950/40 border border-red-300/60 dark:border-red-800/50 rounded-lg text-red-900 dark:text-red-200 text-xs font-medium">
              <AlertCircle size={15} className="shrink-0 text-red-700 dark:text-red-400" />
              <span>{errors.general}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-[#E5EFE5] dark:bg-emerald-950/40 border border-[#163F32]/20 dark:border-emerald-800/40 rounded-lg text-[#163F32] dark:text-[#B8D5C5] text-xs font-medium">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>3D Press Pass issued! Opening studio doors…</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-[#18211D] dark:text-[#F3F0E8] mb-1.5"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Alex Rivera"
                onFocus={() => {
                  setIsPasswordFocused(false);
                  setActiveStageIdx(0);
                }}
                {...field('name')}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-[#17211D] border border-[#163F32]/15 dark:border-[#F3F0E8]/15 text-sm text-[#18211D] dark:text-[#F3F0E8] placeholder:text-[#68736D]/60 dark:placeholder:text-[#8E9E95]/60 focus:outline-none focus:border-[#163F32] dark:focus:border-[#B8D5C5] transition-colors"
              />
              {errors.name && (
                <span className="block text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-[#18211D] dark:text-[#F3F0E8] mb-1.5"
              >
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="editor@publication.com"
                onFocus={() => {
                  setIsPasswordFocused(false);
                  setActiveStageIdx(1);
                }}
                {...field('email')}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-[#17211D] border border-[#163F32]/15 dark:border-[#F3F0E8]/15 text-sm text-[#18211D] dark:text-[#F3F0E8] placeholder:text-[#68736D]/60 dark:placeholder:text-[#8E9E95]/60 focus:outline-none focus:border-[#163F32] dark:focus:border-[#B8D5C5] transition-colors"
              />
              {errors.email && (
                <span className="block text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="register-password"
                  className="block text-xs font-semibold text-[#18211D] dark:text-[#F3F0E8]"
                >
                  Password
                </label>
                <span className="text-[11px] font-mono text-[#C8A15A] dark:text-[#D4AF67]">
                  {isPasswordFocused ? '180° Tumbler Active' : 'Flips Pass 180°'}
                </span>
              </div>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  onFocus={() => {
                    setIsPasswordFocused(true);
                    setActiveStageIdx(2);
                  }}
                  onBlur={() => setIsPasswordFocused(false)}
                  {...field('password')}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white dark:bg-[#17211D] border border-[#163F32]/15 dark:border-[#F3F0E8]/15 text-sm text-[#18211D] dark:text-[#F3F0E8] placeholder:text-[#68736D]/60 dark:placeholder:text-[#8E9E95]/60 focus:outline-none focus:border-[#163F32] dark:focus:border-[#B8D5C5] transition-colors"
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
              {errors.password && (
                <span className="block text-xs text-red-600 dark:text-red-400 mt-1">{errors.password}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold text-[#18211D] dark:text-[#F3F0E8] mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  onFocus={() => {
                    setIsPasswordFocused(true);
                    setActiveStageIdx(3);
                  }}
                  onBlur={() => setIsPasswordFocused(false)}
                  {...field('confirmPassword')}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white dark:bg-[#17211D] border border-[#163F32]/15 dark:border-[#F3F0E8]/15 text-sm text-[#18211D] dark:text-[#F3F0E8] placeholder:text-[#68736D]/60 dark:placeholder:text-[#8E9E95]/60 focus:outline-none focus:border-[#163F32] dark:focus:border-[#B8D5C5] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#68736D] dark:text-[#8E9E95] hover:text-[#18211D] dark:hover:text-[#F3F0E8] transition-colors cursor-pointer"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="block text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              id="register-submit"
              disabled={loading || success}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 mt-2 rounded-lg bg-[#163F32] hover:bg-[#1e5040] dark:bg-[#B8D5C5] dark:hover:bg-[#CCE5D7] text-[#F7F4EC] dark:text-[#102019] text-sm font-semibold transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Minting Studio Credential…
                </>
              ) : (
                <>
                  <span>Create Studio Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#163F32]/12 dark:border-[#F3F0E8]/12 flex items-center justify-between text-xs text-[#68736D] dark:text-[#8E9E95]">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="font-semibold text-[#163F32] dark:text-[#B8D5C5] hover:underline inline-flex items-center gap-1"
            >
              Sign in to Studio
              <ArrowRight size={12} />
            </Link>
          </div>
        </motion.main>

        {/* Bottom Quiet Footer */}
        <footer className="flex items-center justify-between text-[11px] text-[#68736D] dark:text-[#8E9E95] pt-4 border-t border-[#163F32]/10 dark:border-[#F3F0E8]/10">
          <span>BlogFlow AI · Autonomous Editorial Studio</span>
          <span>Research · Think · Publish</span>
        </footer>
      </motion.div>

      {/* ============================================================
          RIGHT COLUMN: 3D LIVE-ENGRAVED PRESS PASS STAGE (5 cols on lg)
          ============================================================ */}
      <motion.aside
        animate={
          doorsOpening
            ? { x: '105%', opacity: 0 }
            : { x: '0%', opacity: 1 }
        }
        transition={{ duration: 0.52, ease: EASE_OUT }}
        className="hidden lg:flex lg:col-span-5 p-4"
      >
        <div className="w-full h-full rounded-2xl bg-[#163F32] dark:bg-[#0C1210] border border-[#C8A15A]/25 dark:border-[#F3F0E8]/12 text-[#F7F4EC] p-8 xl:p-10 flex flex-col justify-between relative overflow-hidden">
          <EditorialPressPass3D
            mode="register"
            name={form.name}
            email={form.email}
            password={form.password}
            confirmPassword={form.confirmPassword}
            isPasswordFocused={isPasswordFocused}
            activeStageIdx={activeStageIdx}
            onSelectStage={setActiveStageIdx}
            isSubmitting={loading}
            isVerified={success}
          />
        </div>
      </motion.aside>
    </div>
  );
}
