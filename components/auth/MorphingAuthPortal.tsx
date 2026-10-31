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
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Sun,
  Moon,
  Feather,
  Compass,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import GutenbergTypeBlock3D, { TypeBlockFace } from '@/components/brand/GutenbergTypeBlock3D';

export type AuthMode = 'login' | 'register' | 'forgot';
type ForgotStep = 1 | 2 | 3 | 4;
type FocusedField = 'name' | 'email' | 'password' | 'confirm' | 'otp' | null;

interface MorphingAuthPortalProps {
  initialMode?: AuthMode;
}

const EMAIL_DOMAINS = ['@gmail.com', '@outlook.com', '@blogflow.ai'];

const CUBE_FACE_INDEX: {
  id: TypeBlockFace;
  numeral: string;
  label: string;
  caption: string;
}[] = [
  {
    id: 'monogram',
    numeral: 'I',
    label: 'Monogram',
    caption: 'Movable-Type Matrix · Sign In',
  },
  {
    id: 'loupe',
    numeral: 'II',
    label: 'Loupe',
    caption: 'Optical Calibration · Identity Lookup',
  },
  {
    id: 'nib',
    numeral: 'III',
    label: 'Nib',
    caption: 'Fountain Draught · New Author Press',
  },
  {
    id: 'seal',
    numeral: 'IV',
    label: 'Seal',
    caption: 'Foundry Cipher · Passkey & Verification',
  },
  {
    id: 'section',
    numeral: 'V',
    label: 'Silcrow',
    caption: 'Editorial Folio · Author Attribution',
  },
];

const MODE_COPY: Record<
  AuthMode,
  {
    folioTag: string;
    headlineStart: string;
    headlineItalic: string;
    headlineEnd: string;
    subtext: string;
    defaultFace: TypeBlockFace;
  }
> = {
  login: {
    folioTag: 'FOLIO I · ATELIER ENTRY',
    headlineStart: 'Step to the',
    headlineItalic: 'movable-type',
    headlineEnd: 'press.',
    subtext:
      'Enter your editorial credentials to unlock your private desk, typography presets, and archival workspace.',
    defaultFace: 'monogram',
  },
  register: {
    folioTag: 'FOLIO II · AUTHOR COMMISSION',
    headlineStart: 'Cast your',
    headlineItalic: 'signature',
    headlineEnd: 'in brass.',
    subtext:
      'Commission a new author imprint with custom voice calibration, long-form drafting tools, and instant press access.',
    defaultFace: 'nib',
  },
  forgot: {
    folioTag: 'FOLIO III · SEAL RECOVERY',
    headlineStart: 'Re-strike your',
    headlineItalic: 'foundry',
    headlineEnd: 'cipher.',
    subtext:
      'Verify your editorial address with a 6-digit security dispatch and mint a fresh cryptographic passkey.',
    defaultFace: 'seal',
  },
};

function computePasswordStrength(pw: string) {
  if (!pw) return { score: 0, label: 'Unset', color: '#8A8477' };
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;

  if (score <= 1) return { score: 1, label: 'Fragile Cast', color: '#B85D3B' };
  if (score === 2) return { score: 2, label: 'Standard Alloy', color: '#C8A15A' };
  if (score === 3) return { score: 3, label: 'Tempered Brass', color: '#2A6B53' };
  return { score: 4, label: 'Archival Grade', color: '#163F32' };
}

export function MorphingAuthPortal({ initialMode = 'login' }: MorphingAuthPortalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [manualFaceOverride, setManualFaceOverride] = useState<TypeBlockFace | null>(null);
  const [keystrokePulse, setKeystrokePulse] = useState(0);

  // Login / Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password multi-step state
  const [forgotStep, setForgotStep] = useState<ForgotStep>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Status & feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cursor-reactive 3D stage coordinates
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 65, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 65, damping: 24 });

  // 3D stage tilt transforms
  const stageRotateX = useTransform(smoothY, [0, 1], [8, -8]);
  const stageRotateY = useTransform(smoothX, [0, 1], [-10, 10]);
  const spotlightX = useTransform(smoothX, [0, 1], ['15%', '85%']);
  const spotlightY = useTransform(smoothY, [0, 1], ['15%', '85%']);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const modeParam = searchParams?.get('mode');
    if (modeParam === 'register' || modeParam === 'login' || modeParam === 'forgot') {
      setMode(modeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/studio');
    }
  }, [status, router]);

  // Determine active 3D cube face based on focus, mode, or manual inspection
  const activeCubeFace: TypeBlockFace = useMemo(() => {
    if (focusedField === 'name') return 'section';
    if (focusedField === 'email') return 'loupe';
    if (focusedField === 'password' || focusedField === 'confirm' || focusedField === 'otp') {
      return 'seal';
    }
    if (manualFaceOverride) return manualFaceOverride;
    if (mode === 'forgot') {
      if (forgotStep === 1) return 'loupe';
      return 'seal';
    }
    return MODE_COPY[mode].defaultFace;
  }, [focusedField, manualFaceOverride, mode, forgotStep]);

  // Calculate form completion percentage (0..1) to drive subtle cube elevation/rotation
  const completionPct = useMemo(() => {
    if (mode === 'login') {
      let pct = 0;
      if (email.trim().length > 3) pct += 0.5;
      if (password.length >= 6) pct += 0.5;
      return pct;
    }
    if (mode === 'register') {
      let pct = 0;
      if (name.trim().length >= 2) pct += 0.25;
      if (email.trim().includes('@')) pct += 0.25;
      if (password.length >= 6) pct += 0.25;
      if (confirmPassword.length >= 6 && confirmPassword === password) pct += 0.25;
      return pct;
    }
    return (forgotStep - 1) / 3;
  }, [mode, name, email, password, confirmPassword, forgotStep]);

  const activeFaceMeta =
    CUBE_FACE_INDEX.find((f) => f.id === activeCubeFace) || CUBE_FACE_INDEX[0];

  const pulseCube = () => {
    setKeystrokePulse((prev) => prev + 1);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    mouseX.set(Math.max(0, Math.min(1, nx)));
    mouseY.set(Math.max(0, Math.min(1, ny)));
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
    pulseCube();
  };

  const switchMode = (nextMode: AuthMode) => {
    setError('');
    setSuccessMsg('');
    setManualFaceOverride(null);
    setFocusedField(null);
    setMode(nextMode);
    pulseCube();
    if (nextMode === 'forgot') {
      setForgotStep(1);
      setForgotEmail(email || '');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpPreview(null);
    }
  };

  const activeEmailValue = mode === 'forgot' ? forgotEmail : email;
  const showDomainSuggestions =
    activeEmailValue.length > 0 && !activeEmailValue.includes('@');

  const applyEmailDomain = (domain: string) => {
    const prefix = activeEmailValue.split('@')[0];
    const nextVal = `${prefix}${domain}`;
    if (mode === 'forgot') {
      setForgotEmail(nextVal);
    } else {
      setEmail(nextVal);
    }
    pulseCube();
  };

  const pwStrength = useMemo(
    () => computePasswordStrength(mode === 'forgot' ? newPassword : password),
    [mode, newPassword, password]
  );

  // --- Handlers ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    pulseCube();

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        triggerError('Invalid editorial email or passkey. Please verify your credentials.');
      } else {
        router.push('/studio');
        router.refresh();
      }
    } catch {
      triggerError('An unexpected connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      triggerError('Please enter your author or studio name.');
      return;
    }
    if (password.length < 6) {
      triggerError('Passkey must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      triggerError('Passkeys do not match.');
      return;
    }

    setLoading(true);
    pulseCube();
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
        triggerError(data.error || 'Registration failed. Please try another email.');
        setLoading(false);
        return;
      }

      const signInRes = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInRes?.error) {
        setSuccessMsg('Author imprint created! Please sign in with your new credentials.');
        setMode('login');
        setLoading(false);
      } else {
        router.push('/studio');
        router.refresh();
      }
    } catch {
      triggerError('Network error while commissioning your account.');
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError('');
    setDemoLoading(true);
    setManualFaceOverride('seal');
    pulseCube();
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'demo@blogflow.ai',
        password: '__DEMO_STUDIO_ACCESS__',
      });

      if (res?.error) {
        triggerError('Could not initialize Demo Atelier session.');
        setDemoLoading(false);
      } else {
        router.push('/studio');
        router.refresh();
      }
    } catch {
      triggerError('Failed to launch Demo Atelier.');
      setDemoLoading(false);
    }
  };

  // --- Forgot Password Handlers ---
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      triggerError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    pulseCube();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        triggerError(data.error || 'Could not dispatch verification code.');
        setLoading(false);
        return;
      }

      setResetToken(data.resetToken);
      setOtpPreview(data.otpPreview || null);
      setOtpDigits(['', '', '', '', '', '']);
      setForgotStep(2);
    } catch {
      triggerError('Failed to connect to recovery service.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError('');
    pulseCube();

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
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setOtpDigits(next);
    pulseCube();
    const focusIdx = Math.min(5, pasted.length);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      triggerError('Please enter all 6 digits of your verification cipher.');
      return;
    }

    setLoading(true);
    pulseCube();
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: forgotEmail.trim().toLowerCase(),
          otp,
          resetToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        triggerError(data.error || 'Invalid verification cipher.');
        setLoading(false);
        return;
      }

      setForgotStep(3);
    } catch {
      triggerError('Verification request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      triggerError('New passkey must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      triggerError('New passkeys do not match.');
      return;
    }

    setLoading(true);
    pulseCube();
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
      if (!res.ok) {
        triggerError(data.error || 'Could not update passkey.');
        setLoading(false);
        return;
      }

      setForgotStep(4);
    } catch {
      triggerError('Failed to save new passkey.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInAfterReset = async () => {
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email: forgotEmail.trim().toLowerCase(),
      password: newPassword,
    });
    if (!res?.error) {
      router.push('/studio');
      router.refresh();
    } else {
      setEmail(forgotEmail);
      setPassword('');
      switchMode('login');
      setLoading(false);
    }
  };

  // Default to Warm Archival Paper (light mode) on initial SSR so text is always crisp dark charcoal on ivory
  const isDark = mounted ? theme === 'dark' : false;
  const copy = MODE_COPY[mode];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative min-h-screen w-full overflow-hidden flex flex-col justify-between select-none transition-colors duration-500 ${
        isDark
          ? 'bg-[#0B1612] text-[#F7F4EC]'
          : 'bg-[#F7F4EC] text-[#18211D]'
      }`}
    >
      {/* --- LAYER 1: Archival Paper Grain, Brass Vernier Grid & Warm Cursor Spotlight --- */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Ambient Forest & Brass Radial Wash */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 26% 42%, rgba(22, 63, 50, 0.45), transparent 55%), radial-gradient(circle at 78% 25%, rgba(200, 161, 90, 0.14), transparent 50%)'
              : 'radial-gradient(circle at 26% 42%, rgba(200, 161, 90, 0.18), transparent 55%), radial-gradient(circle at 78% 25%, rgba(22, 63, 50, 0.08), transparent 50%)',
          }}
        />

        {/* Cursor-Following Warm Brass Atelier Lamp */}
        <motion.div
          className="absolute w-[640px] h-[640px] rounded-full blur-[130px] -translate-x-1/2 -translate-y-1/2"
          style={{
            left: spotlightX,
            top: spotlightY,
            background: isDark
              ? 'radial-gradient(circle, rgba(200,161,90,0.16) 0%, rgba(22,63,50,0.12) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(200,161,90,0.22) 0%, rgba(22,63,50,0.06) 45%, transparent 70%)',
          }}
        />

        {/* Fine Editorial Ruled Grid Lines */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isDark ? 0.07 : 0.09,
            backgroundImage: isDark
              ? 'linear-gradient(to right, #C8A15A 1px, transparent 1px), linear-gradient(to bottom, #C8A15A 1px, transparent 1px)'
              : 'linear-gradient(to right, #163F32 1px, transparent 1px), linear-gradient(to bottom, #163F32 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage:
              'radial-gradient(ellipse 85% 80% at 50% 50%, black 35%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 85% 80% at 50% 50%, black 35%, transparent 100%)',
          }}
        />
      </div>

      {/* --- LAYER 2: Top Navigation Bar with 3D Gutenberg Type-Block Brand Lockup --- */}
      <header
        className={`relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-5 pb-4 flex items-center justify-between border-b ${
          isDark ? 'border-[#C8A15A]/15' : 'border-[#163F32]/12'
        }`}
      >
        <Link
          href="/landing"
          className={`group inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.18em] transition-colors ${
            isDark
              ? 'text-[#C8A15A]/80 hover:text-[#F7F4EC]'
              : 'text-[#163F32] hover:text-[#0B261D]'
          }`}
        >
          <span
            className={`w-7 h-7 rounded-md flex items-center justify-center border transition-transform group-hover:-translate-x-0.5 ${
              isDark
                ? 'border-[#C8A15A]/30 bg-[#12261F] text-[#E5C98B]'
                : 'border-[#163F32]/20 bg-[#EFECE1] text-[#163F32]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          <span>Back to Atelier</span>
        </Link>

        {/* Center Brand Lockup: 3D Gutenberg Cube + Serif Wordmark */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-3.5 group focus:outline-none"
          title="BlogFlow AI — Gutenberg Type-Block Identity"
        >
          <GutenbergTypeBlock3D
            size={34}
            activeFace={activeCubeFace}
            activityPulse={keystrokePulse}
            scrollPct={completionPct}
            interactiveStamp={false}
          />
          <div className="flex flex-col text-left">
            <span
              className={`text-xl sm:text-2xl font-bold tracking-tight leading-none ${
                isDark ? 'text-[#F7F4EC]' : 'text-[#12261F]'
              }`}
              style={{
                fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
              }}
            >
              BlogFlow AI
            </span>
            <span
              className={`text-[9px] font-mono uppercase tracking-[0.22em] mt-0.5 ${
                isDark ? 'text-[#C8A15A]/80' : 'text-[#615B4E]'
              }`}
            >
              EST. 1450 · TYPE FOUNDRY
            </span>
          </div>
        </Link>

        {/* Right Theme Switcher */}
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Atelier lighting"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-[11px] font-mono uppercase tracking-[0.14em] transition-all cursor-pointer ${
                isDark
                  ? 'border-[#C8A15A]/30 bg-[#12261F]/90 text-[#E5C98B] hover:border-[#C8A15A]'
                  : 'border-[#163F32]/20 bg-[#EFECE1]/90 text-[#163F32] hover:border-[#163F32]/50'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#E5C98B]" />
                  <span className="hidden sm:inline">Archival Paper</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#163F32]" />
                  <span className="hidden sm:inline">Forest Obsidian</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* --- LAYER 3: Split Editorial Stage (Left 3D Gutenberg Cube Pedestal + Right Auth Press) --- */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN: Interactive 3D Gutenberg Type-Block Stage & Kinetic Serif Typography */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-7">
          {/* Interactive 3D Gutenberg Type-Block Pedestal */}
          <div className="relative w-full max-w-[440px] flex flex-col items-center lg:items-start">
            <div
              className={`relative w-full h-[290px] sm:h-[320px] rounded-2xl border flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${
                isDark
                  ? 'bg-[#0F211B]/80 border-[#C8A15A]/25 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]'
                  : 'bg-[#EFECE1]/85 border-[#163F32]/15 shadow-[0_24px_50px_-18px_rgba(22,63,50,0.14)]'
              }`}
              style={{ perspective: 1200 }}
            >
              {/* Top Corner Technical Readout */}
              <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] pointer-events-none">
                <span className={isDark ? 'text-[#C8A15A]' : 'text-[#163F32]'}>
                  MATRIX FACE · {activeFaceMeta.numeral} ({activeFaceMeta.label.toUpperCase()})
                </span>
                <span className={isDark ? 'text-[#9DB1A8]' : 'text-[#615B4E]'}>
                  STAMP PULSE · {String(keystrokePulse).padStart(2, '0')}
                </span>
              </div>

              {/* Architectural Crosshairs & Vernier Rings */}
              <motion.div
                style={{
                  rotateX: stageRotateX,
                  rotateY: stageRotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="relative flex items-center justify-center w-60 h-60"
              >
                {/* Outer Calibrated Brass Ring */}
                <motion.div
                  animate={{ rotateZ: 360 }}
                  transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-0 rounded-full border border-dashed pointer-events-none ${
                    isDark ? 'border-[#C8A15A]/30' : 'border-[#163F32]/25'
                  }`}
                />

                {/* Inner Concentric Vernier Ring */}
                <motion.div
                  animate={{ rotateZ: -360 }}
                  transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-6 rounded-full border pointer-events-none ${
                    isDark ? 'border-[#163F32]/70' : 'border-[#C8A15A]/45'
                  }`}
                />

                {/* Warm Brass Cast Shadow Plinth under Cube */}
                <div
                  className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none"
                  style={{
                    background: isDark
                      ? 'radial-gradient(circle, rgba(200,161,90,0.28) 0%, rgba(22,63,50,0.2) 60%, transparent 100%)'
                      : 'radial-gradient(circle, rgba(22,63,50,0.18) 0%, rgba(200,161,90,0.22) 60%, transparent 100%)',
                  }}
                />

                {/* THE 3D GUTENBERG TYPE-BLOCK CUBE */}
                <div className="relative z-10">
                  <GutenbergTypeBlock3D
                    size={136}
                    activeFace={activeCubeFace}
                    activityPulse={keystrokePulse}
                    scrollPct={completionPct}
                    interactiveStamp={true}
                    onStampFace={(nextFace) => {
                      setFocusedField(null);
                      setManualFaceOverride(nextFace);
                      pulseCube();
                    }}
                  />
                </div>
              </motion.div>

              {/* Bottom Stage Caption Bar */}
              <div
                className={`absolute bottom-3 left-4 right-4 pt-2 border-t flex items-center justify-between text-[10px] font-mono tracking-[0.12em] ${
                  isDark
                    ? 'border-[#C8A15A]/15 text-[#C8A15A]/85'
                    : 'border-[#163F32]/12 text-[#4A5A52]'
                }`}
              >
                <span>{activeFaceMeta.caption}</span>
                <span className="uppercase opacity-80">Click cube to rotate</span>
              </div>
            </div>

            {/* Unboxed Typographic 5-Face Inspector Bar (Zero-Pill Discipline) */}
            <div
              className={`w-full mt-3 pt-2.5 border-t flex flex-wrap items-center justify-center lg:justify-between gap-y-2 text-[11px] font-mono uppercase tracking-[0.15em] ${
                isDark ? 'border-[#C8A15A]/20' : 'border-[#163F32]/15'
              }`}
            >
              {CUBE_FACE_INDEX.map((face, idx) => {
                const isSelected = activeCubeFace === face.id;
                return (
                  <React.Fragment key={face.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setFocusedField(null);
                        setManualFaceOverride(face.id);
                        pulseCube();
                      }}
                      className={`cursor-pointer transition-colors pb-0.5 border-b-2 ${
                        isSelected
                          ? isDark
                            ? 'text-[#E5C98B] border-[#C8A15A] font-semibold'
                            : 'text-[#163F32] border-[#163F32] font-semibold'
                          : isDark
                          ? 'text-[#8FA59B] border-transparent hover:text-[#F7F4EC]'
                          : 'text-[#615B4E] border-transparent hover:text-[#18211D]'
                      }`}
                    >
                      {face.numeral} · {face.label}
                    </button>
                    {idx < CUBE_FACE_INDEX.length - 1 && (
                      <span
                        className={
                          isDark ? 'text-[#C8A15A]/30' : 'text-[#163F32]/25'
                        }
                      >
                        /
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Kinetic Serif Headline & Unboxed Folio Metadata */}
          <div className="space-y-3 max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                <div
                  className={`flex items-center justify-center lg:justify-start gap-2.5 text-[11px] font-mono uppercase tracking-[0.22em] ${
                    isDark ? 'text-[#C8A15A]' : 'text-[#163F32]'
                  }`}
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>{copy.folioTag}</span>
                </div>

                <h1
                  className={`text-4xl sm:text-5xl font-normal tracking-tight leading-[1.08] ${
                    isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                  }`}
                  style={{
                    fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
                  }}
                >
                  {copy.headlineStart}{' '}
                  <span
                    className={`italic font-normal ${
                      isDark ? 'text-[#E5C98B]' : 'text-[#163F32]'
                    }`}
                    style={{
                      textDecoration: 'underline',
                      textDecorationColor: '#C8A15A',
                      textUnderlineOffset: '6px',
                      textDecorationThickness: '1.5px',
                    }}
                  >
                    {copy.headlineItalic}
                  </span>{' '}
                  {copy.headlineEnd}
                </h1>

                <p
                  className={`text-sm sm:text-base leading-relaxed font-normal ${
                    isDark ? 'text-[#B4C4BC]' : 'text-[#4A5A52]'
                  }`}
                >
                  {copy.subtext}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Unboxed Architectural Specifications Row */}
            <div
              className={`pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 text-[11px] font-mono uppercase tracking-[0.14em] ${
                isDark ? 'text-[#8FA59B]' : 'text-[#615B4E]'
              }`}
            >
              <span>ALLOY: #163F32 · #C8A15A</span>
              <span>·</span>
              <span>COMPLETION: {Math.round(completionPct * 100)}%</span>
              <span>·</span>
              <span>CIPHER: AES-GCM</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Warm Archival Paper & Brushed Brass Authentication Press Card */}
        <div className="lg:col-span-6 w-full max-w-[470px] mx-auto">
          <motion.div
            key={shakeKey}
            animate={
              shakeKey > 0
                ? { x: [0, -10, 10, -7, 7, -3, 3, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* Subtle Brass Outer Frame Glow */}
            <div
              className=" -inset-[1px] rounded-2xl pointer-events-none opacity-80"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(200,161,90,0.45), rgba(22,63,50,0.2), rgba(200,161,90,0.35))'
                  : 'linear-gradient(135deg, rgba(22,63,50,0.25), rgba(200,161,90,0.45), rgba(22,63,50,0.2))',
              }}
            />

            {/* Main Card Interior */}
            <div
              className={`relative rounded-2xl border p-6 sm:p-8 transition-colors duration-500 ${
                isDark
                  ? 'bg-[#0F1F19]/95 border-[#C8A15A]/30 shadow-[0_28px_70px_-15px_rgba(0,0,0,0.8)]'
                  : 'bg-[#FCFBF7] border-[#163F32]/18 shadow-[0_24px_60px_-15px_rgba(22,63,50,0.14)]'
              }`}
            >
              {/* Top Brass Registration Hairline */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#C8A15A]/25 text-[10px] font-mono uppercase tracking-[0.2em]">
                <span className={isDark ? 'text-[#E5C98B]' : 'text-[#163F32]'}>
                  PRESS REGISTER · {mode.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#9A732E] dark:text-[#C8A15A]">
                  <Compass className="w-3 h-3" />
                  <span>CUBE SYNC: {activeCubeFace.toUpperCase()}</span>
                </span>
              </div>

              {/* Mode Switcher Tabs (Sign In vs Create Account) */}
              {mode !== 'forgot' ? (
                <div
                  className={`relative grid grid-cols-2 p-1 rounded-xl border mb-6 ${
                    isDark
                      ? 'bg-[#091410] border-[#C8A15A]/20'
                      : 'bg-[#EFECE1] border-[#163F32]/12'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`relative z-10 py-2.5 text-xs font-mono uppercase tracking-[0.16em] font-semibold rounded-lg transition-colors cursor-pointer ${
                      mode === 'login'
                        ? 'text-[#F7F4EC]'
                        : isDark
                        ? 'text-[#9DB1A8] hover:text-[#F7F4EC]'
                        : 'text-[#4A5A52] hover:text-[#18211D]'
                    }`}
                  >
                    {mode === 'login' && (
                      <motion.div
                        layoutId="atelierAuthTab"
                        className="absolute inset-0 rounded-lg bg-[#163F32] border border-[#C8A15A]/45 shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`relative z-10 py-2.5 text-xs font-mono uppercase tracking-[0.16em] font-semibold rounded-lg transition-colors cursor-pointer ${
                      mode === 'register'
                        ? 'text-[#F7F4EC]'
                        : isDark
                        ? 'text-[#9DB1A8] hover:text-[#F7F4EC]'
                        : 'text-[#4A5A52] hover:text-[#18211D]'
                    }`}
                  >
                    {mode === 'register' && (
                      <motion.div
                        layoutId="atelierAuthTab"
                        className="absolute inset-0 rounded-lg bg-[#163F32] border border-[#C8A15A]/45 shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    Create Account
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#C8A15A]/20">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] transition-colors cursor-pointer ${
                      isDark
                        ? 'text-[#E5C98B] hover:text-[#F7F4EC]'
                        : 'text-[#163F32] hover:text-[#0B261D]'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </button>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((s) => (
                      <span
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          forgotStep >= s
                            ? 'w-5 bg-[#C8A15A]'
                            : isDark
                            ? 'w-2 bg-white/15'
                            : 'w-2 bg-[#163F32]/15'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Alert Banners */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mb-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
                      isDark
                        ? 'bg-[#3A1818]/90 border-[#D97757]/50 text-[#FCDAD0]'
                        : 'bg-[#FDF2EE] border-[#B85D3B]/40 text-[#7A2E18]'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C85A32]" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMsg && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mb-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
                      isDark
                        ? 'bg-[#123328]/90 border-[#C8A15A]/50 text-[#E5C98B]'
                        : 'bg-[#EAF2EE] border-[#163F32]/30 text-[#123328]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#163F32] dark:text-[#C8A15A]" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* FORM VIEWS */}
              <AnimatePresence mode="wait">
                {/* ==================== LOGIN VIEW ==================== */}
                {mode === 'login' && (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 14 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4"
                  >
                    {/* Email Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold ${
                            isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                          }`}
                        >
                          Editorial Email
                        </label>
                        <span
                          className={`text-[10px] font-mono ${
                            focusedField === 'email'
                              ? 'text-[#C8A15A]'
                              : isDark
                              ? 'text-[#8FA59B]/60'
                              : 'text-[#615B4E]/70'
                          }`}
                        >
                          FACE II · LOUPE
                        </span>
                      </div>
                      <div className="relative">
                        <Mail
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                            focusedField === 'email'
                              ? 'text-[#C8A15A]'
                              : isDark
                              ? 'text-[#8FA59B]'
                              : 'text-[#615B4E]'
                          }`}
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onFocus={() => {
                            setFocusedField('email');
                            pulseCube();
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            pulseCube();
                          }}
                          placeholder="editor@publication.com"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                            isDark
                              ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                              : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                          }`}
                        />
                      </div>

                      {/* Domain Quick-Chips */}
                      <AnimatePresence>
                        {showDomainSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap items-center gap-1.5 pt-2 overflow-hidden"
                          >
                            {EMAIL_DOMAINS.map((dom) => (
                              <button
                                key={dom}
                                type="button"
                                onClick={() => applyEmailDomain(dom)}
                                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                  isDark
                                    ? 'bg-[#12261F] border-[#C8A15A]/30 text-[#E5C98B] hover:border-[#C8A15A]'
                                    : 'bg-[#EFECE1] border-[#163F32]/20 text-[#163F32] hover:bg-[#163F32] hover:text-[#F7F4EC]'
                                }`}
                              >
                                {dom}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold ${
                            isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                          }`}
                        >
                          Passkey
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className={`text-[11px] font-mono underline underline-offset-4 transition-colors cursor-pointer ${
                            isDark
                              ? 'text-[#E5C98B] hover:text-[#F7F4EC]'
                              : 'text-[#163F32] hover:text-[#9A732E]'
                          }`}
                        >
                          Forgot passkey?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                            focusedField === 'password'
                              ? 'text-[#C8A15A]'
                              : isDark
                              ? 'text-[#8FA59B]'
                              : 'text-[#615B4E]'
                          }`}
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onFocus={() => {
                            setFocusedField('password');
                            pulseCube();
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            pulseCube();
                          }}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                            isDark
                              ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                              : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer ${
                            isDark
                              ? 'text-[#8FA59B] hover:text-[#F7F4EC]'
                              : 'text-[#615B4E] hover:text-[#18211D]'
                          }`}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Primary Submit CTA */}
                    <button
                      type="submit"
                      disabled={loading || demoLoading}
                      className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                      ) : (
                        <>
                          <span>Enter Editorial Atelier</span>
                          <ArrowRight className="w-4 h-4 text-[#E5C98B]" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {/* ==================== REGISTER VIEW ==================== */}
                {mode === 'register' && (
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-4"
                  >
                    {/* Author / Studio Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold ${
                            isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                          }`}
                        >
                          Author or Publication Name
                        </label>
                        <span
                          className={`text-[10px] font-mono ${
                            focusedField === 'name'
                              ? 'text-[#C8A15A]'
                              : isDark
                              ? 'text-[#8FA59B]/60'
                              : 'text-[#615B4E]/70'
                          }`}
                        >
                          FACE V · SILCROW
                        </span>
                      </div>
                      <div className="relative">
                        <User
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                            focusedField === 'name'
                              ? 'text-[#C8A15A]'
                              : isDark
                              ? 'text-[#8FA59B]'
                              : 'text-[#615B4E]'
                          }`}
                        />
                        <input
                          type="text"
                          required
                          value={name}
                          onFocus={() => {
                            setFocusedField('name');
                            pulseCube();
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => {
                            setName(e.target.value);
                            pulseCube();
                          }}
                          placeholder="Clara Vance"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                            isDark
                              ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                              : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold ${
                            isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                          }`}
                        >
                          Editorial Email
                        </label>
                        <span
                          className={`text-[10px] font-mono ${
                            focusedField === 'email'
                              ? 'text-[#C8A15A]'
                              : isDark
                              ? 'text-[#8FA59B]/60'
                              : 'text-[#615B4E]/70'
                          }`}
                        >
                          FACE II · LOUPE
                        </span>
                      </div>
                      <div className="relative">
                        <Mail
                          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                            focusedField === 'email'
                              ? 'text-[#C8A15A]'
                              : isDark
                              ? 'text-[#8FA59B]'
                              : 'text-[#615B4E]'
                          }`}
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onFocus={() => {
                            setFocusedField('email');
                            pulseCube();
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            pulseCube();
                          }}
                          placeholder="clara@atelier.press"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                            isDark
                              ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                              : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {showDomainSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap items-center gap-1.5 pt-2 overflow-hidden"
                          >
                            {EMAIL_DOMAINS.map((dom) => (
                              <button
                                key={dom}
                                type="button"
                                onClick={() => applyEmailDomain(dom)}
                                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                  isDark
                                    ? 'bg-[#12261F] border-[#C8A15A]/30 text-[#E5C98B] hover:border-[#C8A15A]'
                                    : 'bg-[#EFECE1] border-[#163F32]/20 text-[#163F32] hover:bg-[#163F32] hover:text-[#F7F4EC]'
                                }`}
                              >
                                {dom}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Passwords Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold mb-1.5 ${
                            isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                          }`}
                        >
                          Passkey
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#615B4E]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onFocus={() => {
                              setFocusedField('password');
                              pulseCube();
                            }}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              pulseCube();
                            }}
                            placeholder="Min 6 chars"
                            className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              isDark
                                ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#615B4E] cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold mb-1.5 ${
                            isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                          }`}
                        >
                          Confirm
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#615B4E]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onFocus={() => {
                              setFocusedField('confirm');
                              pulseCube();
                            }}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              pulseCube();
                            }}
                            placeholder="Repeat passkey"
                            className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              isDark
                                ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Passkey Alloy Strength Meter */}
                    {password.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em]">
                          <span className={isDark ? 'text-[#8FA59B]' : 'text-[#615B4E]'}>
                            Passkey Temper
                          </span>
                          <span style={{ color: pwStrength.color }} className="font-semibold">
                            {pwStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className="h-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor:
                                  pwStrength.score >= level
                                    ? pwStrength.color
                                    : isDark
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(22,63,50,0.12)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || demoLoading}
                      className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#12261F] bg-gradient-to-r from-[#E5C98B] via-[#C8A15A] to-[#D9B772] hover:brightness-105 border border-[#8A6829]/40 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#12261F]" />
                      ) : (
                        <>
                          <span>Commission Author Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {/* ==================== FORGOT PASSWORD MULTI-STEP VIEW ==================== */}
                {mode === 'forgot' && (
                  <motion.div
                    key={`forgot-step-${forgotStep}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    {forgotStep === 1 && (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-1">
                          <h3
                            className={`text-lg font-semibold ${
                              isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                            }`}
                            style={{
                              fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
                            }}
                          >
                            Step I · Dispatch Recovery Cipher
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Enter your editorial email. We will issue a 6-digit foundry verification code.
                          </p>
                        </div>

                        <div>
                          <label
                            className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold mb-1.5 ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            Registered Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C8A15A]" />
                            <input
                              type="email"
                              required
                              value={forgotEmail}
                              onFocus={() => {
                                setFocusedField('email');
                                pulseCube();
                              }}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setForgotEmail(e.target.value);
                                pulseCube();
                              }}
                              placeholder="editor@publication.com"
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Send 6-Digit Foundry Code</span>
                              <ArrowRight className="w-4 h-4 text-[#E5C98B]" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {forgotStep === 2 && (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-1">
                          <h3
                            className={`text-lg font-semibold ${
                              isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                            }`}
                            style={{
                              fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
                            }}
                          >
                            Step II · Verify 6-Digit Seal
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Enter the 6-digit code dispatched to{' '}
                            <span className="font-semibold underline">{forgotEmail}</span>.
                          </p>
                        </div>

                        {otpPreview && (
                          <div
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                              isDark
                                ? 'bg-[#12261F] border-[#C8A15A]/40 text-[#E5C98B]'
                                : 'bg-[#EFECE1] border-[#163F32]/25 text-[#163F32]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <KeyRound className="w-4 h-4 shrink-0 text-[#C8A15A]" />
                              <span>
                                Dispatch Code:{' '}
                                <strong className="font-mono tracking-widest text-sm">
                                  {otpPreview}
                                </strong>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpDigits(otpPreview.split(''));
                                pulseCube();
                              }}
                              className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-[#163F32] text-[#F7F4EC] hover:opacity-90 cursor-pointer"
                            >
                              Auto-fill
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-6 gap-2 pt-1">
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
                              onFocus={() => setFocusedField('otp')}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={idx === 0 ? handleOtpPaste : undefined}
                              className={`w-full aspect-square text-center text-lg font-mono font-bold rounded-xl border transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#091410] border-[#C8A15A]/30 text-[#E5C98B] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/25 text-[#163F32] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setForgotStep(1)}
                            className="underline opacity-75 hover:opacity-100 cursor-pointer"
                          >
                            Change email
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendOtp()}
                            className="inline-flex items-center gap-1 underline opacity-75 hover:opacity-100 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Resend code
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Verify Foundry Seal</span>
                              <ArrowRight className="w-4 h-4 text-[#E5C98B]" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {forgotStep === 3 && (
                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <h3
                            className={`text-lg font-semibold ${
                              isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                            }`}
                            style={{
                              fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
                            }}
                          >
                            Step III · Cast New Passkey
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Seal verified. Enter your new passkey below.
                          </p>
                        </div>

                        <div>
                          <label
                            className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold mb-1.5 ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            New Passkey
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C8A15A]" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={newPassword}
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                pulseCube();
                              }}
                              placeholder="At least 6 characters"
                              className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            className={`block text-[11px] font-mono uppercase tracking-[0.16em] font-semibold mb-1.5 ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            Confirm New Passkey
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C8A15A]" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={confirmNewPassword}
                              onFocus={() => setFocusedField('confirm')}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setConfirmNewPassword(e.target.value);
                                pulseCube();
                              }}
                              placeholder="Repeat new passkey"
                              className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#091410] border-[#C8A15A]/25 text-[#F7F4EC] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#12261F] bg-gradient-to-r from-[#E5C98B] via-[#C8A15A] to-[#D9B772] hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#12261F]" />
                          ) : (
                            <>
                              <span>Update Passkey</span>
                              <CheckCircle2 className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {forgotStep === 4 && (
                      <div className="text-center py-4 space-y-4">
                        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#163F32] text-[#E5C98B] border border-[#C8A15A]">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3
                            className={`text-xl font-semibold ${
                              isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                            }`}
                            style={{
                              fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
                            }}
                          >
                            Passkey Re-Cast Complete
                          </h3>
                          <p
                            className={`text-xs ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Your editorial credentials have been updated in the foundry ledger.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignInAfterReset}
                          disabled={loading}
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Enter Atelier Now</span>
                              <ArrowRight className="w-4 h-4 text-[#E5C98B]" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* --- 1-Click Instant Atelier Pass & Social Providers --- */}
              {mode !== 'forgot' && (
                <div className="mt-6 pt-5 border-t border-[#C8A15A]/20 space-y-3">
                  <button
                    type="button"
                    onClick={handleDemoAccess}
                    disabled={loading || demoLoading}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-mono uppercase tracking-[0.14em] transition-all flex items-center justify-between group cursor-pointer ${
                      isDark
                        ? 'bg-[#12261F]/70 hover:bg-[#163F32] border-[#C8A15A]/35 text-[#E5C98B]'
                        : 'bg-[#EFECE1]/90 hover:bg-[#163F32] border-[#163F32]/20 text-[#163F32] hover:text-[#F7F4EC]'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#C8A15A]" />
                      <span>Instant Guest Atelier Pass (1-Click Demo)</span>
                    </span>
                    {demoLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => signIn('google', { callbackUrl: '/studio' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#091410] border-[#C8A15A]/20 text-[#D7E2DC] hover:border-[#C8A15A]/50'
                          : 'bg-[#F7F4EC] border-[#163F32]/15 text-[#18211D] hover:bg-[#EFECE1]'
                      }`}
                    >
                      <span className="font-serif font-bold text-sm text-[#C8A15A]">G</span>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => signIn('github', { callbackUrl: '/studio' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#091410] border-[#C8A15A]/20 text-[#D7E2DC] hover:border-[#C8A15A]/50'
                          : 'bg-[#F7F4EC] border-[#163F32]/15 text-[#18211D] hover:bg-[#EFECE1]'
                      }`}
                    >
                      <span className="font-mono font-bold text-xs text-[#C8A15A]">GH</span>
                      <span>GitHub</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* --- LAYER 4: Editorial Colophon Footer --- */}
      <footer
        className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.16em] ${
          isDark
            ? 'border-[#C8A15A]/15 text-[#8FA59B]'
            : 'border-[#163F32]/12 text-[#615B4E]'
        }`}
      >
        <span>COLOPHON · GUTENBERG TYPE-BLOCK EDITION</span>
        <span>WARM ARCHIVAL PAPER (#F7F4EC) · FOREST (#163F32) · BRASS (#C8A15A)</span>
      </footer>
    </div>
  );
}

export default MorphingAuthPortal;
