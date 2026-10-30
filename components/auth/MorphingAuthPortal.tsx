'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  Wand2,
  Layers,
  Compass,
  Fingerprint,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';

export type PortalMode = 'login' | 'register' | 'forgot';
type ForgotStep = 1 | 2 | 3 | 4;
type PrismPreset = 'prism' | 'kinetic' | 'zenith';

interface MorphingAuthPortalProps {
  initialMode: 'login' | 'register';
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const MODE_PALETTES: Record<
  PortalMode,
  {
    primary: string;
    secondary: string;
    tertiary: string;
    badge: string;
    headlineFirst: string;
    headlineAccent: string;
    headlineLast: string;
    subline: string;
    kineticWords: string[];
    ringColor: string;
  }
> = {
  login: {
    primary: '#6366F1',
    secondary: '#22D3EE',
    tertiary: '#818CF8',
    badge: 'Spatial Identity Portal',
    headlineFirst: 'Where ideas',
    headlineAccent: 'take form',
    headlineLast: 'in light.',
    subline:
      'Step through a refractive glass sanctuary designed for pure creative focus and effortless expression.',
    kineticWords: ['CLARITY', 'DEPTH', 'RESONANCE', 'PERSPECTIVE'],
    ringColor: 'rgba(34, 211, 238, 0.45)',
  },
  register: {
    primary: '#10B981',
    secondary: '#A855F7',
    tertiary: '#34D399',
    badge: 'Genesis Creative Sanctuary',
    headlineFirst: 'Shape your',
    headlineAccent: 'own universe',
    headlineLast: 'of thought.',
    subline:
      'Mint your personal creative identity and unlock an atmospheric space built for original voices.',
    kineticWords: ['ORIGIN', 'IMAGINATION', 'VOICE', 'LUMINANCE'],
    ringColor: 'rgba(16, 185, 129, 0.45)',
  },
  forgot: {
    primary: '#F59E0B',
    secondary: '#EC4899',
    tertiary: '#FBBF24',
    badge: 'Cryptographic Key Recovery',
    headlineFirst: 'Restore your',
    headlineAccent: 'cipher key',
    headlineLast: 'in seconds.',
    subline:
      'Verify your identity with a time-bound 6-digit cryptographic code and mint a fresh password immediately.',
    kineticWords: ['RECOVERY', 'CIPHER', ' CONTINUITY', 'TRUST'],
    ringColor: 'rgba(245, 158, 11, 0.48)',
  },
};

const EMAIL_DOMAINS = ['@gmail.com', '@outlook.com', '@blogflow.ai'];

function evaluatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: 'Enter password', color: '#64748B' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  const clamped = Math.max(1, Math.min(4, score));
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Weak', color: '#F43F5E' },
    2: { label: 'Fair', color: '#F59E0B' },
    3: { label: 'Good', color: '#22D3EE' },
    4: { label: 'Strong', color: '#10B981' },
  };
  return { score: clamped, ...map[clamped] };
}

export default function MorphingAuthPortal({ initialMode }: MorphingAuthPortalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { isDark, toggleTheme, mounted } = useTheme();

  const [mode, setMode] = useState<PortalMode>(initialMode);
  const [prismPreset, setPrismPreset] = useState<PrismPreset>('prism');
  const [keystrokePulse, setKeystrokePulse] = useState(0);
  const [portalWarpExit, setPortalWarpExit] = useState(false);

  // Login & Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Status & errors
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Forgot Password multi-step state
  const [forgotStep, setForgotStep] = useState<ForgotStep>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Resolve safe callback URL
  const rawCallbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const callbackUrl = useMemo(() => {
    if (rawCallbackUrl.startsWith('/')) return rawCallbackUrl;
    try {
      const parsed = new URL(rawCallbackUrl);
      return (parsed.pathname || '/dashboard') + parsed.search;
    } catch {
      return '/dashboard';
    }
  }, [rawCallbackUrl]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && !portalWarpExit) {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl, portalWarpExit]);

  // Notice if redirected from registration
  useEffect(() => {
    if (searchParams?.get('registered') === '1') {
      setInfoMessage('Your account is ready. Sign in below to enter the portal.');
    }
  }, [searchParams]);

  // 3D Cursor-Reactive Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 110, damping: 24, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 110, damping: 24, mass: 0.6 });

  // Card 3D tilt transforms
  const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const glareX = useTransform(smoothX, [-0.5, 0.5], ['15%', '85%']);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ['10%', '90%']);

  // Sculpture 3D parallax transforms
  const sculptureRotateX = useTransform(smoothY, [-0.5, 0.5], [16, -16]);
  const sculptureRotateY = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const auroraOffsetX = useTransform(smoothX, [-0.5, 0.5], ['-12%', '12%']);
  const auroraOffsetY = useTransform(smoothY, [-0.5, 0.5], ['-12%', '12%']);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const triggerKeystrokeWave = () => {
    setKeystrokePulse((prev) => prev + 1);
  };

  const switchMode = (nextMode: PortalMode) => {
    setError(null);
    setInfoMessage(null);
    setMode(nextMode);
    if (nextMode === 'forgot') {
      setForgotStep(1);
      setForgotEmail(email || '');
      setOtpDigits(['', '', '', '', '', '']);
    } else if (typeof window !== 'undefined') {
      const targetPath = nextMode === 'register' ? '/register' : '/login';
      window.history.replaceState(null, '', targetPath);
    }
  };

  // Email domain chip helper
  const applyEmailDomain = (domain: string, isForgot = false) => {
    const current = isForgot ? forgotEmail : email;
    const base = current.includes('@') ? current.split('@')[0] : current.trim() || 'creator';
    const nextVal = `${base}${domain}`;
    if (isForgot) {
      setForgotEmail(nextVal);
    } else {
      setEmail(nextVal);
    }
    triggerKeystrokeWave();
  };

  // Sign In Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        setLoading(false);
        setError('Invalid email or password. Try the 1-Click Demo Access or reset your password.');
      } else if (result?.ok) {
        setPortalWarpExit(true);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 560);
      } else {
        setLoading(false);
        setError('Unable to sign in right now. Please try again.');
      }
    } catch {
      setLoading(false);
      setError('Network error while connecting to authentication server.');
    }
  };

  // Create Account Handler (with automatic sign-in!)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!name.trim()) {
      setError('Please enter your full name or creative alias.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check both fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        if (res.status === 409) {
          setError('An account with this email already exists. Try signing in instead.');
        } else {
          setError(data.error || 'Could not create your account. Please try again.');
        }
        return;
      }

      // Auto-sign in right after registration so the user enters the studio seamlessly
      const loginResult = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginResult?.ok) {
        setPortalWarpExit(true);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 560);
      } else {
        setLoading(false);
        setMode('login');
        setInfoMessage('Account created! Please sign in with your new credentials.');
      }
    } catch {
      setLoading(false);
      setError('Network error. Please verify your connection and try again.');
    }
  };

  // 1-Click Demo Studio Access Handler
  const handleInstantDemoAccess = async () => {
    setError(null);
    setInfoMessage(null);
    setDemoLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: 'demo@blogflow.ai',
        password: '__DEMO_STUDIO_ACCESS__',
      });

      if (result?.ok) {
        setPortalWarpExit(true);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 520);
      } else {
        setDemoLoading(false);
        setError('Could not launch Demo Studio session. Please try again.');
      }
    } catch {
      setDemoLoading(false);
      setError('Network error while launching Demo Studio.');
    }
  };

  // Social OAuth Handler
  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    setInfoMessage(
      `Connecting to ${provider === 'google' ? 'Google' : 'GitHub'} identity provider…`
    );
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setError(`Could not initiate ${provider} sign-in.`);
    }
  };

  // ==============================================================
  // FORGOT PASSWORD MULTI-STEP HANDLERS
  // ==============================================================

  // Step 1 -> Request 6-digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Could not generate recovery code.');
        return;
      }

      setResetToken(data.resetToken);
      setOtpPreview(data.otpPreview || null);
      setOtpDigits(['', '', '', '', '', '']);
      setForgotStep(2);
      triggerKeystrokeWave();
    } catch {
      setLoading(false);
      setError('Network error while requesting verification code.');
    }
  };

  // OTP Slot Input Handling
  const handleOtpDigitChange = (index: number, rawVal: string) => {
    const digit = rawVal.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError(null);
    triggerKeystrokeWave();

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    triggerKeystrokeWave();
    const focusIdx = Math.min(5, pasted.length - 1);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const autoFillPreviewOtp = () => {
    if (!otpPreview) return;
    const chars = otpPreview.slice(0, 6).split('');
    setOtpDigits([
      chars[0] || '',
      chars[1] || '',
      chars[2] || '',
      chars[3] || '',
      chars[4] || '',
      chars[5] || '',
    ]);
    setError(null);
    triggerKeystrokeWave();
  };

  // Step 2 -> Verify 6-digit OTP
  const handleVerifyOtpStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: forgotEmail.trim().toLowerCase(),
          otp: code,
          resetToken,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Incorrect verification code.');
        return;
      }

      setForgotStep(3);
      triggerKeystrokeWave();
    } catch {
      setLoading(false);
      setError('Unable to verify code right now. Please try again.');
    }
  };

  // Step 3 -> Commit New Password to PostgreSQL
  const handleCommitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: forgotEmail.trim().toLowerCase(),
          otp: otpDigits.join(''),
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Could not update password.');
        return;
      }

      setEmail(forgotEmail.trim().toLowerCase());
      setPassword(newPassword);
      setForgotStep(4);
      triggerKeystrokeWave();
    } catch {
      setLoading(false);
      setError('Network error while updating your password.');
    }
  };

  // Sign in immediately after Step 4 password reset
  const handleSignInWithResetPassword = async () => {
    setLoading(true);
    setError(null);
    const result = await signIn('credentials', {
      redirect: false,
      email: forgotEmail.trim().toLowerCase(),
      password: newPassword,
    });
    if (result?.ok) {
      setPortalWarpExit(true);
      setTimeout(() => {
        router.push(callbackUrl);
      }, 540);
    } else {
      setLoading(false);
      setMode('login');
      setInfoMessage('Password updated! Please sign in below.');
    }
  };

  const activePalette = MODE_PALETTES[mode];
  const activePasswordStrength = evaluatePasswordStrength(
    mode === 'forgot' ? newPassword : password
  );

  // Preset angles for the 3D Prism Stage
  const presetRotationOffset = useMemo(() => {
    if (prismPreset === 'kinetic') return { x: 18, y: -22, scale: 1.06 };
    if (prismPreset === 'zenith') return { x: -16, y: 24, scale: 0.96 };
    return { x: 0, y: 0, scale: 1 };
  }, [prismPreset]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative min-h-screen w-full overflow-hidden select-none transition-colors duration-700 ${
        mounted && !isDark
          ? 'bg-[#F4F6FB] text-[#0F172A]'
          : 'bg-[#05060B] text-[#F8FAFC]'
      }`}
    >
      {/* =====================================================================
          LAYER 1: CURSOR-REACTIVE BIOLUMINESCENT AURORA & STARLIGHT FIELD
          ===================================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary Dynamic Aurora Orb */}
        <motion.div
          style={{ x: auroraOffsetX, y: auroraOffsetY }}
          animate={{
            background: `radial-gradient(650px circle at 32% 38%, ${activePalette.primary}3B, ${activePalette.secondary}1F 45%, transparent 75%)`,
            scale: 1 + (keystrokePulse % 3) * 0.03,
          }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          className="absolute -inset-32 blur-3xl opacity-90"
        />

        {/* Secondary Counter-Rotating Aurora Plume */}
        <motion.div
          animate={{
            background: `radial-gradient(580px circle at 76% 66%, ${activePalette.secondary}33, ${activePalette.tertiary}1A 50%, transparent 78%)`,
            rotate: mode === 'login' ? 0 : mode === 'register' ? 28 : -25,
          }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
          className="absolute -inset-24 blur-3xl opacity-80"
        />

        {/* Subtle Refractive Perspective Grid */}
        <div
          className="absolute inset-0 opacity-[0.14] dark:opacity-[0.18]"
          style={{
            backgroundImage: `linear-gradient(to right, ${activePalette.primary}22 1px, transparent 1px), linear-gradient(to bottom, ${activePalette.secondary}22 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 75% at 50% 50%, black 25%, transparent 90%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 75% at 50% 50%, black 25%, transparent 90%)',
          }}
        />

        {/* Keystroke Resonance Wave Ring */}
        <AnimatePresence mode="popLayout">
          {keystrokePulse > 0 && (
            <motion.div
              key={keystrokePulse}
              initial={{ opacity: 0.45, scale: 0.55 }}
              animate={{ opacity: 0, scale: 1.65 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="
                absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-[520px] h-[520px] rounded-full border pointer-events-none
              "
              style={{ borderColor: activePalette.secondary }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* =====================================================================
          LAYER 2: TOP MINIMALIST NAVIGATION BAR
          ===================================================================== */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link
          href="/landing"
          className="group inline-flex items-center gap-3 text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300/60 dark:border-white/15 bg-white/60 dark:bg-white/5 backdrop-blur-md group-hover:-translate-x-0.5 transition-transform">
            <ArrowLeft size={14} />
          </span>
          <span>Back to Studio</span>
        </Link>

        {/* Brand Identity Lockup */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-2.5 text-slate-900 dark:text-white"
        >
          <motion.span
            animate={{
              rotate: keystrokePulse * 18,
              borderColor: activePalette.secondary,
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white/70 dark:bg-white/10 backdrop-blur-md shadow-sm"
            style={{
              boxShadow: `0 0 20px -4px ${activePalette.primary}66`,
            }}
          >
            <Sparkles size={15} style={{ color: activePalette.secondary }} />
          </motion.span>
          <span
            className="text-xl tracking-tight font-semibold"
            style={{ fontFamily: "'Instrument Serif', 'Newsreader', Georgia, serif" }}
          >
            BlogFlow AI
          </span>
        </Link>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 dark:border-white/15 bg-white/70 dark:bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 backdrop-blur-md hover:border-slate-400 dark:hover:border-white/30 transition-all cursor-pointer"
          aria-label="Toggle color theme"
        >
          {mounted && !isDark ? (
            <>
              <Sun size={13} className="text-amber-500" />
              <span>Daylight</span>
            </>
          ) : (
            <>
              <Moon size={13} className="text-cyan-300" />
              <span>Obsidian</span>
            </>
          )}
        </button>
      </header>

      {/* =====================================================================
          LAYER 3: MAIN ASYMMETRIC 3D PORTAL WORKSPACE
          ===================================================================== */}
      <motion.main
        animate={
          portalWarpExit
            ? { scale: 1.08, opacity: 0, filter: 'blur(16px)' }
            : { scale: 1, opacity: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
        className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-12 pt-2 lg:grid-cols-12 sm:px-10"
      >
        {/* ===================================================================
            LEFT COLUMN (7 COLS ON LG): 3D KINETIC TYPOGRAPHY & PRISM SCULPTURE
            (Strictly zero workflow, pipeline, or dashboard clutter)
            =================================================================== */}
        <section className="relative flex flex-col justify-between lg:col-span-7 lg:pr-6">
          {/* Interactive 3D Gyroscopic Prism Stage */}
          <div
            className="relative mx-auto flex h-[340px] sm:h-[420px] w-full max-w-[580px] items-center justify-center"
            style={{ perspective: '1200px' }}
          >
            <motion.div
              style={{
                rotateX: sculptureRotateX,
                rotateY: sculptureRotateY,
                transformStyle: 'preserve-3d',
              }}
              animate={{
                scale: presetRotationOffset.scale,
              }}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              className="relative flex h-full w-full items-center justify-center"
            >
              {/* Outer Refractive Orbital Ring 1 */}
              <motion.div
                animate={{
                  rotateZ: 360,
                  rotateX: 62 + presetRotationOffset.x,
                  rotateY: -12 + presetRotationOffset.y,
                  borderColor: activePalette.ringColor,
                }}
                transition={{
                  rotateZ: { duration: 28, repeat: Infinity, ease: 'linear' },
                  rotateX: { duration: 0.8, ease: EASE_OUT_EXPO },
                  rotateY: { duration: 0.8, ease: EASE_OUT_EXPO },
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className="absolute h-[270px] w-[270px] sm:h-[340px] sm:w-[340px] rounded-full border-[1.5px] shadow-[0_0_50px_rgba(99,102,241,0.2)]"
              />

              {/* Middle Counter-Rotating Glass Ring 2 */}
              <motion.div
                animate={{
                  rotateZ: -360,
                  rotateX: -54 + presetRotationOffset.y,
                  rotateY: 28 + presetRotationOffset.x,
                  borderColor: activePalette.secondary,
                }}
                transition={{
                  rotateZ: { duration: 22, repeat: Infinity, ease: 'linear' },
                  rotateX: { duration: 0.8, ease: EASE_OUT_EXPO },
                  rotateY: { duration: 0.8, ease: EASE_OUT_EXPO },
                }}
                style={{ transformStyle: 'preserve-3d', opacity: 0.42 }}
                className="absolute h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] rounded-full border border-dashed"
              />

              {/* Inner Gyroscopic Core Prism */}
              <motion.div
                animate={{
                  rotateY: keystrokePulse * 25 + presetRotationOffset.y,
                  rotateX: (keystrokePulse % 2 === 0 ? 12 : -12) + presetRotationOffset.x,
                  boxShadow: `0 0 80px -10px ${activePalette.primary}88, inset 0 0 36px ${activePalette.secondary}55`,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                style={{
                  transform: 'translateZ(40px)',
                  background: `linear-gradient(135deg, ${activePalette.primary}30 0%, ${activePalette.secondary}22 50%, transparent 100%)`,
                }}
                className="relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-3xl border border-white/30 dark:border-white/20 backdrop-blur-2xl"
              >
                {/* Inner Diamond Facet */}
                <motion.div
                  animate={{
                    rotate: 45 + keystrokePulse * 15,
                    borderColor: activePalette.secondary,
                  }}
                  transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border bg-white/20 dark:bg-white/5 backdrop-blur-md"
                />

                {/* Center Floating Glyph */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center"
                  style={{ transform: 'translateZ(35px)' }}
                >
                  <span
                    className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 dark:text-white"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    {mode === 'login' ? 'BF·I' : mode === 'register' ? 'BF·II' : 'BF·KEY'}
                  </span>
                  <span className="mt-1 font-mono text-[10px] tracking-[0.24em] uppercase text-slate-600 dark:text-slate-300">
                    {prismPreset}
                  </span>
                </div>
              </motion.div>

              {/* Floating 3D Kinetic Typography Words Orbiting in Z-Space */}
              {activePalette.kineticWords.map((word, idx) => {
                const positions = [
                  'top-6 left-4 sm:left-8',
                  'top-10 right-4 sm:right-8',
                  'bottom-10 left-6 sm:left-12',
                  'bottom-6 right-6 sm:right-10',
                ];
                const zDepths = [75, 55, 65, 85];
                return (
                  <motion.div
                    key={`${mode}-${word}`}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      y: [0, idx % 2 === 0 ? -7 : 7, 0],
                      scale: 1,
                    }}
                    transition={{
                      opacity: { duration: 0.45, delay: idx * 0.06 },
                      y: {
                        duration: 4.2 + idx * 0.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }}
                    style={{
                      transform: `translateZ(${zDepths[idx]}px)`,
                    }}
                    className={`absolute ${positions[idx]} rounded-xl border border-slate-300/60 dark:border-white/15 bg-white/75 dark:bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-xl shadow-lg`}
                  >
                    <span className="font-mono text-[10px] sm:text-[11px] font-medium tracking-[0.22em] text-slate-800 dark:text-slate-100">
                      {word}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Sculptural Kinetic Editorial Headline */}
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 dark:border-white/15 bg-white/70 dark:bg-white/5 px-3.5 py-1 text-[11px] font-medium tracking-wide text-slate-700 dark:text-slate-300 backdrop-blur-md mb-4">
                  <Sparkles size={12} style={{ color: activePalette.secondary }} />
                  <span>{activePalette.badge}</span>
                </div>

                <h1
                  className="text-4xl sm:text-6xl leading-[1.04] tracking-tight font-normal text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Instrument Serif', 'Newsreader', Georgia, serif" }}
                >
                  {activePalette.headlineFirst}{' '}
                  <em
                    className="italic font-normal bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(120deg, ${activePalette.primary}, ${activePalette.secondary})`,
                    }}
                  >
                    {activePalette.headlineAccent}
                  </em>{' '}
                  {activePalette.headlineLast}
                </h1>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300/85 max-w-lg mx-auto lg:mx-0">
                  {activePalette.subline}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Interactive 3D Camera / Refraction Angle Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                3D Optics:
              </span>
              {(
                [
                  { id: 'prism', label: 'Prism Core', icon: Layers },
                  { id: 'kinetic', label: 'Kinetic Orbit', icon: Compass },
                  { id: 'zenith', label: 'Zenith Tilt', icon: Wand2 },
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const isSelected = prismPreset === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setPrismPreset(id);
                      triggerKeystrokeWave();
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400/60 bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                        : 'border-slate-300/70 dark:border-white/12 bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/25'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            RIGHT COLUMN (5 COLS ON LG): 3D GLASSMORPHIC MORPHING AUTH CARD
            =================================================================== */}
        <section
          className="relative lg:col-span-5 flex items-center justify-center"
          style={{ perspective: '1400px' }}
        >
          <motion.div
            style={{
              rotateX: cardRotateX,
              rotateY: cardRotateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full max-w-[460px]"
          >
            {/* Outer Ambient Glow Halo */}
            <motion.div
              animate={{
                background: `radial-gradient(circle at 50% 0%, ${activePalette.primary}44, ${activePalette.secondary}22 55%, transparent 80%)`,
              }}
              transition={{ duration: 0.7 }}
              className="pointer-events-none absolute -inset-3 rounded-[32px] blur-2xl opacity-80"
            />

            {/* Main Frosted Glass Portal Card */}
            <motion.div
              layout
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              className="relative overflow-hidden rounded-[28px] border border-slate-300/80 dark:border-white/15 bg-white/85 dark:bg-[#0B0F1C]/80 p-6 sm:p-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
              {/* Specular Glare Overlay following cursor */}
              <motion.div
                style={{
                  background: useTransform(
                    [glareX, glareY],
                    ([gx, gy]) =>
                      `radial-gradient(380px circle at ${gx} ${gy}, rgba(255,255,255,0.14), transparent 70%)`
                  ),
                }}
                className="pointer-events-none absolute inset-0"
              />

              {/* Top Mode Switcher Tabs (Sign In / Create Account) */}
              {mode !== 'forgot' ? (
                <div className="relative z-10 mb-6 grid grid-cols-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] p-1">
                  {(['login', 'register'] as const).map((tab) => {
                    const active = mode === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => switchMode(tab)}
                        className={`relative z-10 rounded-xl py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                          active
                            ? 'text-slate-950 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="portalModeTab"
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="absolute inset-0 -z-10 rounded-xl bg-white dark:bg-white/12 shadow-sm border border-slate-200/60 dark:border-white/15"
                          />
                        )}
                        {tab === 'login' ? 'Sign In' : 'Create Account'}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative z-10 mb-6 flex items-center justify-between border-b border-slate-200/70 dark:border-white/10 pb-4">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((stepNum) => (
                      <span
                        key={stepNum}
                        className={`h-1.5 rounded-full transition-all ${
                          forgotStep >= stepNum
                            ? 'w-6 bg-amber-400'
                            : 'w-2 bg-slate-300 dark:bg-white/15'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Alert & Info Banners */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="auth-error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="relative z-10 mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-700 dark:text-rose-200"
                  >
                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {infoMessage && !error && (
                  <motion.div
                    key="auth-info"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="relative z-10 mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-200"
                  >
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{infoMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* =============================================================
                  MODE 1 & 2: SIGN IN / CREATE ACCOUNT FORMS
                  ============================================================= */}
              <AnimatePresence mode="wait">
                {mode !== 'forgot' ? (
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                    className="relative z-10"
                  >
                    <div className="mb-5">
                      <h2
                        className="text-2xl sm:text-3xl font-normal tracking-tight text-slate-900 dark:text-white"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                      >
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {mode === 'login'
                          ? 'Enter your credentials to unlock your creative workspace.'
                          : 'Set up your personal credentials in seconds.'}
                      </p>
                    </div>

                    <form
                      onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
                      noValidate
                      className="space-y-4"
                    >
                      {/* Full Name Field (Register Mode Only) */}
                      {mode === 'register' && (
                        <div>
                          <label
                            htmlFor="portal-name"
                            className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
                          >
                            Full Name
                          </label>
                          <div
                            className={`relative flex items-center rounded-xl border transition-all ${
                              focusedField === 'name'
                                ? 'border-emerald-400/80 ring-2 ring-emerald-400/20 bg-white dark:bg-white/[0.07]'
                                : 'border-slate-300/80 dark:border-white/12 bg-slate-50/70 dark:bg-white/[0.04]'
                            }`}
                          >
                            <User
                              size={15}
                              className="ml-3.5 shrink-0 text-slate-400 dark:text-slate-400"
                            />
                            <input
                              id="portal-name"
                              type="text"
                              autoComplete="name"
                              placeholder="Aria Vance"
                              value={name}
                              onFocus={() => setFocusedField('name')}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setName(e.target.value);
                                triggerKeystrokeWave();
                              }}
                              disabled={loading || demoLoading}
                              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Email Address Field */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label
                            htmlFor="portal-email"
                            className="text-xs font-medium text-slate-700 dark:text-slate-300"
                          >
                            Email Address
                          </label>
                          <div className="flex items-center gap-1">
                            {EMAIL_DOMAINS.map((dom) => (
                              <button
                                key={dom}
                                type="button"
                                onClick={() => applyEmailDomain(dom, false)}
                                className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-300 hover:border-cyan-400/50 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                              >
                                {dom}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div
                          className={`relative flex items-center rounded-xl border transition-all ${
                            focusedField === 'email'
                              ? 'border-cyan-400/80 ring-2 ring-cyan-400/20 bg-white dark:bg-white/[0.07]'
                              : 'border-slate-300/80 dark:border-white/12 bg-slate-50/70 dark:bg-white/[0.04]'
                          }`}
                        >
                          <Mail
                            size={15}
                            className="ml-3.5 shrink-0 text-slate-400 dark:text-slate-400"
                          />
                          <input
                            id="portal-email"
                            type="email"
                            autoComplete="email"
                            placeholder="creator@blogflow.ai"
                            value={email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              triggerKeystrokeWave();
                            }}
                            disabled={loading || demoLoading}
                            className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label
                            htmlFor="portal-password"
                            className="text-xs font-medium text-slate-700 dark:text-slate-300"
                          >
                            Password
                          </label>
                          {mode === 'login' && (
                            <button
                              type="button"
                              onClick={() => switchMode('forgot')}
                              className="text-xs font-medium text-indigo-600 dark:text-cyan-300 hover:underline cursor-pointer"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div
                          className={`relative flex items-center rounded-xl border transition-all ${
                            focusedField === 'password'
                              ? 'border-indigo-400/80 ring-2 ring-indigo-400/20 bg-white dark:bg-white/[0.07]'
                              : 'border-slate-300/80 dark:border-white/12 bg-slate-50/70 dark:bg-white/[0.04]'
                          }`}
                        >
                          <Lock
                            size={15}
                            className="ml-3.5 shrink-0 text-slate-400 dark:text-slate-400"
                          />
                          <input
                            id="portal-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete={
                              mode === 'login' ? 'current-password' : 'new-password'
                            }
                            placeholder={
                              mode === 'login'
                                ? 'Enter your password'
                                : 'At least 8 characters'
                            }
                            value={password}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              triggerKeystrokeWave();
                            }}
                            disabled={loading || demoLoading}
                            className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="mr-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>

                        {/* Live 4-Bar Password Strength Meter in Register Mode */}
                        {mode === 'register' && password.length > 0 && (
                          <div className="mt-2">
                            <div className="grid grid-cols-4 gap-1.5">
                              {[1, 2, 3, 4].map((bar) => (
                                <div
                                  key={bar}
                                  className="h-1 rounded-full transition-colors duration-300"
                                  style={{
                                    backgroundColor:
                                      activePasswordStrength.score >= bar
                                        ? activePasswordStrength.color
                                        : 'rgba(148,163,184,0.22)',
                                  }}
                                />
                              ))}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-500 dark:text-slate-400">
                                Password strength
                              </span>
                              <span style={{ color: activePasswordStrength.color }}>
                                {activePasswordStrength.label}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password (Register Mode Only) */}
                      {mode === 'register' && (
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <label
                              htmlFor="portal-confirm-password"
                              className="text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              Confirm Password
                            </label>
                            {confirmPassword.length > 0 && (
                              <span
                                className={`font-mono text-[10px] ${
                                  password === confirmPassword
                                    ? 'text-emerald-500'
                                    : 'text-rose-400'
                                }`}
                              >
                                {password === confirmPassword ? 'Matched' : 'Does not match'}
                              </span>
                            )}
                          </div>
                          <div
                            className={`relative flex items-center rounded-xl border transition-all ${
                              focusedField === 'confirmPassword'
                                ? 'border-emerald-400/80 ring-2 ring-emerald-400/20 bg-white dark:bg-white/[0.07]'
                                : 'border-slate-300/80 dark:border-white/12 bg-slate-50/70 dark:bg-white/[0.04]'
                            }`}
                          >
                            <ShieldCheck
                              size={15}
                              className="ml-3.5 shrink-0 text-slate-400 dark:text-slate-400"
                            />
                            <input
                              id="portal-confirm-password"
                              type={showConfirmPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              placeholder="Re-enter your password"
                              value={confirmPassword}
                              onFocus={() => setFocusedField('confirmPassword')}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                triggerKeystrokeWave();
                              }}
                              disabled={loading || demoLoading}
                              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              className="mr-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                              aria-label={
                                showConfirmPassword ? 'Hide password' : 'Show password'
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Remember Me Checkbox (Login Mode) */}
                      {mode === 'login' && (
                        <div className="flex items-center justify-between pt-0.5">
                          <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Keep my session active for 30 days</span>
                          </label>
                        </div>
                      )}

                      {/* Primary Submit CTA */}
                      <button
                        type="submit"
                        disabled={loading || demoLoading}
                        className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 px-5 text-sm font-semibold text-white shadow-lg transition-all cursor-pointer disabled:opacity-60"
                        style={{
                          background: `linear-gradient(135deg, ${activePalette.primary}, ${activePalette.secondary})`,
                          boxShadow: `0 12px 30px -8px ${activePalette.primary}88`,
                        }}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>
                              {mode === 'login'
                                ? 'Opening Portal…'
                                : 'Creating Account & Signing In…'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {mode === 'login'
                                ? 'Sign In to Studio'
                                : 'Create Account & Enter'}
                            </span>
                            <ArrowRight
                              size={15}
                              className="transition-transform group-hover:translate-x-0.5"
                            />
                          </>
                        )}
                      </button>
                    </form>

                    {/* 1-Click Instant Demo Studio Access + Social Auth */}
                    <div className="mt-6">
                      <div className="relative flex items-center justify-center">
                        <div className="w-full border-t border-slate-200 dark:border-white/10" />
                        <span className="bg-white dark:bg-[#0C101E] px-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                          Instant Access
                        </span>
                        <div className="w-full border-t border-slate-200 dark:border-white/10" />
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <button
                          type="button"
                          onClick={handleInstantDemoAccess}
                          disabled={loading || demoLoading}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/35 dark:border-cyan-400/30 bg-indigo-500/10 dark:bg-cyan-400/10 py-2.5 px-4 text-xs font-semibold text-indigo-900 dark:text-cyan-200 hover:bg-indigo-500/15 dark:hover:bg-cyan-400/15 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {demoLoading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Launching Demo Sandbox…</span>
                            </>
                          ) : (
                            <>
                              <Fingerprint size={15} className="text-indigo-500 dark:text-cyan-300" />
                              <span>1-Click Demo Studio Access (demo@blogflow.ai)</span>
                            </>
                          )}
                        </button>

                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleSocialSignIn('google')}
                            disabled={loading || demoLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/12 bg-white/70 dark:bg-white/[0.04] py-2.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-slate-900 dark:text-white">G</span>
                            <span>Google</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSocialSignIn('github')}
                            disabled={loading || demoLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/12 bg-white/70 dark:bg-white/[0.04] py-2.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                          >
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              GH
                            </span>
                            <span>GitHub</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* =============================================================
                     MODE 3: MULTI-STEP ANIMATED FORGOT PASSWORD FLOW
                     (Step 1: Email -> Step 2: 6-Digit OTP -> Step 3: New Password -> Step 4: Done)
                     ============================================================= */
                  <motion.div
                    key={`forgot-step-${forgotStep}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                    className="relative z-10"
                  >
                    {/* STEP 1: ENTER EMAIL TO REQUEST 6-DIGIT CODE */}
                    {forgotStep === 1 && (
                      <div>
                        <div className="mb-5">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500">
                            Step 01 / 03 · Identity Dispatch
                          </span>
                          <h2
                            className="mt-1 text-2xl sm:text-3xl font-normal tracking-tight text-slate-900 dark:text-white"
                            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                          >
                            Reset your password
                          </h2>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Enter the email associated with your account and we&apos;ll generate a 6-digit recovery code.
                          </p>
                        </div>

                        <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
                          <div>
                            <div className="mb-1.5 flex items-center justify-between">
                              <label
                                htmlFor="forgot-email"
                                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                              >
                                Account Email
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setForgotEmail('demo@blogflow.ai');
                                  triggerKeystrokeWave();
                                }}
                                className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                              >
                                Try demo@blogflow.ai
                              </button>
                            </div>
                            <div className="relative flex items-center rounded-xl border border-slate-300/80 dark:border-white/15 bg-slate-50/70 dark:bg-white/[0.04] focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                              <Mail size={15} className="ml-3.5 shrink-0 text-slate-400" />
                              <input
                                id="forgot-email"
                                type="email"
                                required
                                placeholder="demo@blogflow.ai"
                                value={forgotEmail}
                                onChange={(e) => {
                                  setForgotEmail(e.target.value);
                                  triggerKeystrokeWave();
                                }}
                                disabled={loading}
                                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 py-3.5 px-5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-60"
                          >
                            {loading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Generating 6-Digit Code…</span>
                              </>
                            ) : (
                              <>
                                <span>Send 6-Digit Verification Code</span>
                                <ArrowRight size={15} />
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
                    {forgotStep === 2 && (
                      <div>
                        <div className="mb-4">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500">
                            Step 02 / 03 · 6-Digit Verification
                          </span>
                          <h2
                            className="mt-1 text-2xl sm:text-3xl font-normal tracking-tight text-slate-900 dark:text-white"
                            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                          >
                            Enter verification code
                          </h2>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Enter the 6-digit cryptographic code generated for{' '}
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {forgotEmail}
                            </span>
                            .
                          </p>
                        </div>

                        {/* Interactive Sandbox Dispatch Preview Banner */}
                        {otpPreview && (
                          <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs">
                            <div>
                              <span className="block font-mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-300">
                                Instant Verification Code
                              </span>
                              <span className="font-mono text-base font-bold tracking-[0.25em] text-slate-900 dark:text-white">
                                {otpPreview}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={autoFillPreviewOtp}
                              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
                            >
                              Auto-fill Code
                            </button>
                          </div>
                        )}

                        <form onSubmit={handleVerifyOtpStep} className="space-y-5" noValidate>
                          <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                            {otpDigits.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => {
                                  otpInputRefs.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                onPaste={handleOtpPaste}
                                aria-label={`Digit ${idx + 1}`}
                                className="h-12 sm:h-14 w-full rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.05] text-center font-mono text-lg sm:text-xl font-bold text-slate-900 dark:text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/25"
                              />
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <button
                              type="button"
                              onClick={() => setForgotStep(1)}
                              className="hover:underline cursor-pointer"
                            >
                              Change email address
                            </button>
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-300 hover:underline cursor-pointer"
                            >
                              <RefreshCw size={12} />
                              <span>Resend code</span>
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 py-3.5 px-5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-60"
                          >
                            {loading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Verifying Code…</span>
                              </>
                            ) : (
                              <>
                                <span>Verify 6-Digit Code</span>
                                <ArrowRight size={15} />
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* STEP 3: SET NEW PASSWORD IN DATABASE */}
                    {forgotStep === 3 && (
                      <div>
                        <div className="mb-5">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                            Step 03 / 03 · Mint New Cipher
                          </span>
                          <h2
                            className="mt-1 text-2xl sm:text-3xl font-normal tracking-tight text-slate-900 dark:text-white"
                            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                          >
                            Create new password
                          </h2>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Choose a strong password (at least 8 characters) to update your account in the database.
                          </p>
                        </div>

                        <form onSubmit={handleCommitNewPassword} className="space-y-4" noValidate>
                          <div>
                            <label
                              htmlFor="reset-new-password"
                              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              New Password
                            </label>
                            <div className="relative flex items-center rounded-xl border border-slate-300/80 dark:border-white/15 bg-slate-50/70 dark:bg-white/[0.04] focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                              <KeyRound size={15} className="ml-3.5 shrink-0 text-slate-400" />
                              <input
                                id="reset-new-password"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="At least 8 characters"
                                value={newPassword}
                                onChange={(e) => {
                                  setNewPassword(e.target.value);
                                  triggerKeystrokeWave();
                                }}
                                disabled={loading}
                                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="mr-3 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                              >
                                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>

                            {/* Password Strength Bar */}
                            {newPassword.length > 0 && (
                              <div className="mt-2">
                                <div className="grid grid-cols-4 gap-1.5">
                                  {[1, 2, 3, 4].map((bar) => (
                                    <div
                                      key={bar}
                                      className="h-1 rounded-full transition-colors duration-300"
                                      style={{
                                        backgroundColor:
                                          activePasswordStrength.score >= bar
                                            ? activePasswordStrength.color
                                            : 'rgba(148,163,184,0.22)',
                                      }}
                                    />
                                  ))}
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Strength
                                  </span>
                                  <span style={{ color: activePasswordStrength.color }}>
                                    {activePasswordStrength.label}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="reset-confirm-password"
                              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              Confirm New Password
                            </label>
                            <div className="relative flex items-center rounded-xl border border-slate-300/80 dark:border-white/15 bg-slate-50/70 dark:bg-white/[0.04] focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                              <ShieldCheck size={15} className="ml-3.5 shrink-0 text-slate-400" />
                              <input
                                id="reset-confirm-password"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Re-enter new password"
                                value={confirmNewPassword}
                                onChange={(e) => {
                                  setConfirmNewPassword(e.target.value);
                                  triggerKeystrokeWave();
                                }}
                                disabled={loading}
                                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-60"
                          >
                            {loading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Updating Password…</span>
                              </>
                            ) : (
                              <>
                                <span>Save New Password</span>
                                <CheckCircle2 size={15} />
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* STEP 4: PASSWORD UPDATED SUCCESS */}
                    {forgotStep === 4 && (
                      <div className="py-4 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-400">
                          <CheckCircle2 size={28} />
                        </div>
                        <h2
                          className="text-3xl font-normal tracking-tight text-slate-900 dark:text-white"
                          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                        >
                          Password updated
                        </h2>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          Your new password for{' '}
                          <span className="font-semibold">{forgotEmail}</span> has been saved to the database.
                        </p>

                        <div className="mt-6 space-y-2.5">
                          <button
                            type="button"
                            onClick={handleSignInWithResetPassword}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-3.5 px-5 text-sm font-semibold text-white shadow-lg cursor-pointer disabled:opacity-60"
                          >
                            {loading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Signing In…</span>
                              </>
                            ) : (
                              <>
                                <span>Sign In Now with New Password</span>
                                <ArrowRight size={15} />
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="w-full rounded-xl border border-slate-300 dark:border-white/15 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                          >
                            Return to Sign In Form
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </section>
      </motion.main>
    </div>
  );
}
