'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import GutenbergTypeBlock3D, { TypeBlockFace } from '@/components/brand/GutenbergTypeBlock3D';

export type AuthMode = 'login' | 'register' | 'forgot';
type ForgotStep = 1 | 2 | 3 | 4;
type FocusedField = 'name' | 'email' | 'password' | 'confirm' | 'otp' | null;

interface MorphingAuthPortalProps {
  initialMode?: AuthMode;
}

interface Star3D {
  x: number;
  y: number;
  z: number;
  pz: number;
  size: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface KeystrokeParticle {
  x: number;
  y: number;
  sx: number;
  sy: number;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  progress: number;
  speed: number;
  size: number;
  color: string;
  trail: { x: number; y: number }[];
}

interface AbsorptionRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface BackgroundShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: string;
  tiltRatio: number;
}

const EMAIL_DOMAINS = ['@gmail.com', '@outlook.com', '@blogflow.ai'];

const MODE_COPY: Record<
  AuthMode,
  {
    headlineStart: string;
    headlineItalic: string;
    subtext: string;
    defaultFace: TypeBlockFace;
  }
> = {
  login: {
    headlineStart: 'Welcome',
    headlineItalic: 'back.',
    subtext: 'Sign in to continue to your writing studio.',
    defaultFace: 'monogram',
  },
  register: {
    headlineStart: 'Create your',
    headlineItalic: 'account.',
    subtext: 'Start drafting and publishing in your personal studio.',
    defaultFace: 'nib',
  },
  forgot: {
    headlineStart: 'Reset your',
    headlineItalic: 'password.',
    subtext: 'Verify your email to set a new password.',
    defaultFace: 'seal',
  },
};

function computePasswordStrength(pw: string) {
  const rules = [
    { id: 'length', label: '8+ chars', met: pw.length >= 8 },
    { id: 'case', label: 'Upper & lower', met: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { id: 'number', label: 'Number', met: /[0-9]/.test(pw) },
    { id: 'symbol', label: 'Symbol', met: /[^A-Za-z0-9]/.test(pw) },
  ];
  if (!pw) return { score: 0, label: '', color: '#8A8477', rules };
  const score = rules.filter((r) => r.met).length;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#B85D3B', rules };
  if (score === 2) return { score: 2, label: 'Fair', color: '#C8A15A', rules };
  if (score === 3) return { score: 3, label: 'Good', color: '#2A6B53', rules };
  return { score: 4, label: 'Strong', color: '#52B788', rules };
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

  // 3D Warp Launch Sequence State
  const [isWarping, setIsWarping] = useState(false);
  const [warpStage, setWarpStage] = useState<'idle' | 'align' | 'jump'>('idle');
  const isWarpingRef = useRef(false);

  // Login / Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Passwordless 6-Digit OTP Login state
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [loginOtpStep, setLoginOtpStep] = useState<'request' | 'verify'>('request');
  const [loginOtpDigits, setLoginOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loginOtpToken, setLoginOtpToken] = useState('');
  const [loginOtpPreview, setLoginOtpPreview] = useState<string | null>(null);

  // OAuth Provider Availability state
  const [oauthStatus, setOauthStatus] = useState<{ google: boolean; github: boolean }>({
    google: false,
    github: false,
  });
  const [oauthNotice, setOauthNotice] = useState<'Google' | 'GitHub' | null>(null);

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
  const loginOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cubeStageRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  // Particle, Shockwave & Starfield Refs for 60fps Canvas Loop
  const particlesRef = useRef<KeystrokeParticle[]>([]);
  const ringsRef = useRef<AbsorptionRing[]>([]);
  const shockwavesRef = useRef<BackgroundShockwave[]>([]);
  const pointerNormRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  // Cursor-reactive 3D stage & spotlight coordinates
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 55, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 55, damping: 24 });

  // 3D stage tilt transforms
  const stageRotateX = useTransform(smoothY, [0, 1], [8, -8]);
  const stageRotateY = useTransform(smoothX, [0, 1], [-10, 10]);
  const spotlightX = useTransform(smoothX, [0, 1], ['18%', '82%']);
  const spotlightY = useTransform(smoothY, [0, 1], ['18%', '82%']);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/providers-status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setOauthStatus({
            google: Boolean(data.google),
            github: Boolean(data.github),
          });
        }
      })
      .catch(() => {
        // Keep safe defaults
      });
  }, []);

  useEffect(() => {
    const modeParam = searchParams?.get('mode');
    if (modeParam === 'register' || modeParam === 'login' || modeParam === 'forgot') {
      setMode(modeParam);
    }
  }, [searchParams]);

  const targetRedirect = useMemo(() => {
    const cb = searchParams?.get('callbackUrl');
    if (cb && cb.startsWith('/') && cb !== '/login' && cb !== '/register') {
      return cb;
    }
    return '/dashboard';
  }, [searchParams]);

  // Only auto-redirect on initial load if not currently playing the 3D warp animation
  useEffect(() => {
    if (status === 'authenticated' && !isWarpingRef.current) {
      router.push(targetRedirect);
    }
  }, [status, router, targetRedirect]);

  // Default to Dark Golden Cosmos when unmounted so the starfield shines immediately
  const isDark = mounted ? theme === 'dark' : true;
  const copy = MODE_COPY[mode];

  // Determine active 3D cube face based on warp, focus, mode, or manual click
  const activeCubeFace: TypeBlockFace = useMemo(() => {
    if (isWarping) return 'seal';
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
  }, [isWarping, focusedField, manualFaceOverride, mode, forgotStep]);

  // Calculate form completion percentage (0..1)
  const completionPct = useMemo(() => {
    if (mode === 'login') {
      if (loginMethod === 'otp') {
        let pct = 0;
        if (email.trim().includes('@')) pct += 0.5;
        if (loginOtpDigits.join('').length === 6) pct += 0.5;
        return pct;
      }
      let pct = 0;
      if (email.trim().length > 3) pct += 0.5;
      if (password.length >= 6) pct += 0.5;
      return pct;
    }
    if (mode === 'register') {
      let pct = 0;
      if (name.trim().length >= 2) pct += 0.25;
      if (email.trim().includes('@')) pct += 0.25;
      if (password.length >= 8) pct += 0.25;
      if (confirmPassword.length >= 8 && confirmPassword === password) pct += 0.25;
      return pct;
    }
    return (forgotStep - 1) / 3;
  }, [mode, loginMethod, loginOtpDigits, name, email, password, confirmPassword, forgotStep]);

  // Spawn Golden Keystroke Energy Particles flowing from the active input card into the 3D Cube
  const spawnKeystrokeParticles = useCallback((count = 2) => {
    if (typeof window === 'undefined') return;
    const cubeRect = cubeStageRef.current?.getBoundingClientRect();
    const formRect = formCardRef.current?.getBoundingClientRect();

    const tx = cubeRect
      ? cubeRect.left + cubeRect.width / 2
      : window.innerWidth * 0.3;
    const ty = cubeRect
      ? cubeRect.top + cubeRect.height / 2
      : window.innerHeight * 0.45;

    const sxBase = formRect
      ? formRect.left + formRect.width * 0.35
      : window.innerWidth * 0.68;
    const syBase = formRect
      ? formRect.top + formRect.height * 0.45
      : window.innerHeight * 0.5;

    const palette = ['#F5E1A4', '#E5C98B', '#C8A15A', '#52B788'];

    for (let i = 0; i < count; i++) {
      const sx = sxBase + (Math.random() - 0.5) * 120;
      const sy = syBase + (Math.random() - 0.5) * 90;
      // Control point arcs upward or downward in 3D-like curve toward the cube
      const cx = (sx + tx) / 2 + (Math.random() - 0.5) * 140;
      const cy = Math.min(sy, ty) - 60 - Math.random() * 110;

      particlesRef.current.push({
        x: sx,
        y: sy,
        sx,
        sy,
        cx,
        cy,
        tx: tx + (Math.random() - 0.5) * 28,
        ty: ty + (Math.random() - 0.5) * 28,
        progress: 0,
        speed: 0.024 + Math.random() * 0.018,
        size: 2.2 + Math.random() * 2.2,
        color: palette[Math.floor(Math.random() * palette.length)],
        trail: [],
      });
    }
  }, []);

  // Spawn a 3D Background Shockwave Ripple across the starfield
  const spawnShockwaveRipple = useCallback((origin: 'cube' | 'form' | 'burst' = 'cube') => {
    if (typeof window === 'undefined') return;
    const cubeRect = cubeStageRef.current?.getBoundingClientRect();
    const formRect = formCardRef.current?.getBoundingClientRect();

    const cubeX = cubeRect
      ? cubeRect.left + cubeRect.width / 2
      : window.innerWidth * 0.3;
    const cubeY = cubeRect
      ? cubeRect.top + cubeRect.height / 2
      : window.innerHeight * 0.45;

    const formX = formRect
      ? formRect.left + formRect.width / 2
      : window.innerWidth * 0.68;
    const formY = formRect
      ? formRect.top + formRect.height * 0.45
      : window.innerHeight * 0.5;

    const maxViewportSpan = Math.hypot(window.innerWidth, window.innerHeight) * 0.72;

    if (origin === 'burst') {
      const burstColors = ['#E5C98B', '#C8A15A', '#52B788'];
      burstColors.forEach((color, idx) => {
        shockwavesRef.current.push({
          x: cubeX,
          y: cubeY,
          radius: 24 + idx * 28,
          maxRadius: maxViewportSpan,
          speed: 11 + idx * 3.5,
          alpha: 0.52 - idx * 0.1,
          color,
          tiltRatio: 1,
        });
      });
      return;
    }

    // Primary shockwave radiating from the 3D Cube Astrolabe
    shockwavesRef.current.push({
      x: origin === 'form' ? formX : cubeX,
      y: origin === 'form' ? formY : cubeY,
      radius: 32,
      maxRadius: maxViewportSpan * 0.85,
      speed: 8.5,
      alpha: 0.38,
      color: origin === 'form' ? '#52B788' : '#E5C98B',
      tiltRatio: 0.82,
    });

    // Cap concurrent shockwaves for crisp 60fps rendering
    if (shockwavesRef.current.length > 7) {
      shockwavesRef.current.shift();
    }
  }, []);

  const pulseCube = useCallback(
    (emitParticles = true) => {
      setKeystrokePulse((prev) => prev + 1);
      if (emitParticles) {
        spawnKeystrokeParticles(2);
        spawnShockwaveRipple('cube');
      } else {
        spawnShockwaveRipple('form');
      }
    },
    [spawnKeystrokeParticles, spawnShockwaveRipple]
  );

  // Trigger the 3D Cube Spin & Starfield Warp Jump into the Studio
  const triggerWarpToStudio = useCallback(() => {
    isWarpingRef.current = true;
    setIsWarping(true);
    setWarpStage('align');
    spawnKeystrokeParticles(14);
    spawnShockwaveRipple('burst');

    // Stage 2: Engage high-speed starfield warp streaks
    setTimeout(() => {
      setWarpStage('jump');
      spawnShockwaveRipple('burst');
    }, 520);

    // Stage 3: Navigate to Dashboard after warp climax
    setTimeout(() => {
      router.push(targetRedirect);
      router.refresh();
    }, 1850);
  }, [router, spawnKeystrokeParticles, spawnShockwaveRipple, targetRedirect]);

  // --- 60FPS 3D GOLDEN STARDUST COSMOS & PARTICLE CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const STAR_COUNT = 260;
    const starColorsDark = ['#F7F4EC', '#E5C98B', '#C8A15A', '#8FD6B8', '#D9B772'];
    const starColorsLight = ['#C8A15A', '#163F32', '#9A732E', '#2A6B53', '#8A6829'];

    const stars: Star3D[] = Array.from({ length: STAR_COUNT }, () => {
      const z = Math.random() * width;
      return {
        x: (Math.random() - 0.5) * width * 2.2,
        y: (Math.random() - 0.5) * height * 2.2,
        z,
        pz: z,
        size: 0.7 + Math.random() * 1.9,
        color: (isDark ? starColorsDark : starColorsLight)[
          Math.floor(Math.random() * 5)
        ],
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
      };
    });

    let warpSpeedMultiplier = 1;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly ramp warp speed when post-login 3D warp jump is triggered
      const targetSpeed = isWarpingRef.current ? 34 : 1.15;
      warpSpeedMultiplier += (targetSpeed - warpSpeedMultiplier) * 0.06;

      // Camera center shifts subtly with cursor parallax, or locks to center during warp
      const px = isWarpingRef.current ? 0.5 : pointerNormRef.current.x;
      const py = isWarpingRef.current ? 0.5 : pointerNormRef.current.y;
      const centerX = width / 2 + (px - 0.5) * 90;
      const centerY = height / 2 + (py - 0.5) * 70;

      // 0. Advance & Draw Keystroke Background Shockwave Ripples
      for (let w = shockwavesRef.current.length - 1; w >= 0; w--) {
        const wave = shockwavesRef.current[w];
        wave.radius += wave.speed;
        const progress = wave.radius / wave.maxRadius;
        wave.alpha = Math.max(0, (1 - progress) * 0.36);

        if (wave.radius >= wave.maxRadius || wave.alpha <= 0.01) {
          shockwavesRef.current.splice(w, 1);
          continue;
        }

        ctx.save();
        ctx.translate(wave.x, wave.y);
        ctx.scale(1, wave.tiltRatio);

        // Outer luminous brass shockwave wavefront
        ctx.beginPath();
        ctx.arc(0, 0, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = isDark ? wave.alpha : wave.alpha * 0.75;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Soft trailing echo ring
        if (wave.radius > 28) {
          ctx.beginPath();
          ctx.arc(0, 0, wave.radius - 18, 0, Math.PI * 2);
          ctx.strokeStyle = '#C8A15A';
          ctx.globalAlpha = (isDark ? wave.alpha : wave.alpha * 0.6) * 0.45;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 1. Draw 3D Starfield (with real-time Shockwave Ripple Displacement)
      const focalLength = width * 0.75;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.pz = star.z;
        star.z -= warpSpeedMultiplier * 2.2;
        star.twinklePhase += star.twinkleSpeed;

        if (star.z <= 1) {
          star.z = width;
          star.pz = width;
          star.x = (Math.random() - 0.5) * width * 2.2;
          star.y = (Math.random() - 0.5) * height * 2.2;
        }

        let sx = (star.x / star.z) * focalLength + centerX;
        let sy = (star.y / star.z) * focalLength + centerY;

        const pxScreen = (star.x / star.pz) * focalLength + centerX;
        const pyScreen = (star.y / star.pz) * focalLength + centerY;

        // Displace stars and boost luminosity when a Keystroke Shockwave passes over them
        let waveBoost = 0;
        for (let w = 0; w < shockwavesRef.current.length; w++) {
          const wave = shockwavesRef.current[w];
          const dx = sx - wave.x;
          const dy = (sy - wave.y) / wave.tiltRatio;
          const dist = Math.hypot(dx, dy);
          const band = 48;
          const delta = Math.abs(dist - wave.radius);
          if (delta < band && dist > 1) {
            const influence = (1 - delta / band) * (wave.alpha / 0.36);
            const push = influence * 11;
            sx += (dx / dist) * push;
            sy += (dy / dist) * push;
            waveBoost = Math.max(waveBoost, influence);
          }
        }

        if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
          const depthRatio = 1 - star.z / width;
          const twinkle = 0.65 + 0.35 * Math.sin(star.twinklePhase);
          const alpha = Math.min(1, Math.max(0.1, depthRatio * twinkle + waveBoost * 0.45));
          const radius = Math.max(0.4, star.size * depthRatio * 1.6 + waveBoost * 1.3);

          if (warpSpeedMultiplier > 3.2) {
            // Draw high-speed 3D warp starlight streaks
            ctx.beginPath();
            ctx.moveTo(pxScreen, pyScreen);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = star.color;
            ctx.globalAlpha = Math.min(0.95, alpha * 1.2);
            ctx.lineWidth = Math.max(1, radius * 1.15);
            ctx.lineCap = 'round';
            ctx.stroke();
          } else {
            // Draw glowing 3D stardust point
            ctx.beginPath();
            ctx.arc(sx, sy, radius, 0, Math.PI * 2);
            ctx.fillStyle = waveBoost > 0.25 ? '#FFF8E7' : star.color;
            ctx.globalAlpha = isDark ? alpha : alpha * 0.75;
            ctx.fill();

            // Subtle golden halo on larger foreground stars or shockwave-excited stars
            if ((radius > 1.8 || waveBoost > 0.2) && isDark) {
              ctx.beginPath();
              ctx.arc(sx, sy, radius * (2.6 + waveBoost * 1.4), 0, Math.PI * 2);
              ctx.fillStyle = star.color;
              ctx.globalAlpha = alpha * (0.16 + waveBoost * 0.22);
              ctx.fill();
            }
          }
        }
      }

      // 2. Draw Keystroke Energy Particles flowing into the 3D Cube
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          // Spawn an absorption golden pulse ring on the 3D cube
          ringsRef.current.push({
            x: p.tx,
            y: p.ty,
            radius: 18,
            maxRadius: 85,
            alpha: 0.65,
            color: p.color,
          });
          particlesRef.current.splice(i, 1);
          continue;
        }

        const t = p.progress;
        const inv = 1 - t;
        // Quadratic Bezier interpolation
        const nx = inv * inv * p.sx + 2 * inv * t * p.cx + t * t * p.tx;
        const ny = inv * inv * p.sy + 2 * inv * t * p.cy + t * t * p.ty;

        p.trail.push({ x: nx, y: ny });
        if (p.trail.length > 10) p.trail.shift();

        p.x = nx;
        p.y = ny;

        // Draw luminous comet trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.55 * (1 - t * 0.3);
          ctx.lineWidth = p.size * 0.9;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw glowing particle head
        ctx.beginPath();
        ctx.arc(nx, ny, p.size, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFDF7';
        ctx.globalAlpha = 0.95;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.35;
        ctx.fill();
      }

      // 3. Draw Cube Energy Absorption Rings
      for (let i = ringsRef.current.length - 1; i >= 0; i--) {
        const ring = ringsRef.current[i];
        ring.radius += 2.4;
        ring.alpha *= 0.92;

        if (ring.alpha <= 0.03 || ring.radius >= ring.maxRadius) {
          ringsRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = ring.alpha;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    mouseX.set(nx);
    mouseY.set(ny);
    pointerNormRef.current = { x: nx, y: ny };
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
    pulseCube(false);
  };

  const switchMode = (nextMode: AuthMode) => {
    setError('');
    setSuccessMsg('');
    setOauthNotice(null);
    setManualFaceOverride(null);
    setFocusedField(null);
    setMode(nextMode);
    pulseCube(true);
    if (nextMode === 'forgot') {
      setForgotStep(1);
      setForgotEmail(email || '');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpPreview(null);
    }
  };

  const handlePasswordKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
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
    pulseCube(true);
  };

  const pwStrength = useMemo(
    () => computePasswordStrength(mode === 'forgot' ? newPassword : password),
    [mode, newPassword, password]
  );

  // --- Handlers ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOauthNotice(null);
    setLoading(true);
    pulseCube(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        triggerError('Invalid email or password. You can also sign in with a 6-digit email code.');
        setLoading(false);
      } else {
        triggerWarpToStudio();
      }
    } catch {
      triggerError('An unexpected connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  // --- Passwordless 6-Digit OTP Sign-In Handlers ---
  const handleRequestLoginOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setOauthNotice(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      triggerError('Please enter a valid email address to receive your 6-digit login code.');
      return;
    }

    setLoading(true);
    pulseCube(true);
    try {
      const res = await fetch('/api/auth/otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        triggerError(data.error || 'Could not issue 6-digit login code.');
        setLoading(false);
        return;
      }

      setLoginOtpToken(data.resetToken);
      setLoginOtpPreview(data.otpPreview || null);
      setLoginOtpDigits(['', '', '', '', '', '']);
      setLoginOtpStep('verify');
      setManualFaceOverride('seal');
    } catch {
      triggerError('Network error while requesting 6-digit login code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...loginOtpDigits];
    next[index] = digit;
    setLoginOtpDigits(next);
    setError('');
    pulseCube(true);

    if (digit && index < 5) {
      loginOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleLoginOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !loginOtpDigits[index] && index > 0) {
      loginOtpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLoginOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setLoginOtpDigits(next);
    pulseCube(true);
    const focusIdx = Math.min(5, pasted.length);
    loginOtpInputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otp = loginOtpDigits.join('');
    if (otp.length !== 6) {
      triggerError('Please enter all 6 digits of your sign-in code.');
      return;
    }

    setLoading(true);
    pulseCube(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        otp,
        resetToken: loginOtpToken,
      });

      if (res?.error) {
        triggerError('Invalid or expired 6-digit code. Please check the code or request a new one.');
        setLoading(false);
      } else {
        triggerWarpToStudio();
      }
    } catch {
      triggerError('Could not verify your 6-digit login code.');
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    setError('');
    pulseCube(true);
    if (oauthStatus[provider]) {
      signIn(provider, { callbackUrl: targetRedirect });
      return;
    }
    setOauthNotice(provider === 'google' ? 'Google' : 'GitHub');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOauthNotice(null);

    if (name.trim().length < 2) {
      triggerError('Please enter your name (at least 2 characters).');
      return;
    }
    if (password.length < 8) {
      triggerError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      triggerError('Passwords do not match.');
      return;
    }

    setLoading(true);
    pulseCube(true);
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
        setSuccessMsg('Account created! Please sign in with your new credentials.');
        setMode('login');
        setLoading(false);
      } else {
        triggerWarpToStudio();
      }
    } catch {
      triggerError('Network error while creating your account.');
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError('');
    setOauthNotice(null);
    setDemoLoading(true);
    setManualFaceOverride('seal');
    pulseCube(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'demo@blogflow.ai',
        password: '__DEMO_STUDIO_ACCESS__',
      });

      if (res?.error) {
        triggerError('Could not start demo session.');
        setDemoLoading(false);
      } else {
        triggerWarpToStudio();
      }
    } catch {
      triggerError('Failed to start demo session.');
      setDemoLoading(false);
    }
  };

  // --- Forgot Password Handlers ---
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      triggerError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    pulseCube(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        triggerError(data.error || 'Could not send verification code.');
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
    pulseCube(true);

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
    pulseCube(true);
    const focusIdx = Math.min(5, pasted.length);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      triggerError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    pulseCube(true);
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
        triggerError(data.error || 'Invalid verification code.');
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

    if (newPassword.length < 8) {
      triggerError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      triggerError('Passwords do not match.');
      return;
    }

    setLoading(true);
    pulseCube(true);
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
        triggerError(data.error || 'Could not update password.');
        setLoading(false);
        return;
      }

      setForgotStep(4);
    } catch {
      triggerError('Failed to save new password.');
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
      triggerWarpToStudio();
    } else {
      setEmail(forgotEmail);
      setPassword('');
      switchMode('login');
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative min-h-screen w-full overflow-hidden flex flex-col justify-between select-none transition-colors duration-700 ${
        isDark
          ? 'bg-[#050B09] text-[#F7F4EC]'
          : 'bg-[#F5F2E8] text-[#18211D]'
      }`}
    >
      {/* --- LAYER 1: Volumetric Gold & Emerald Nebula + 3D Starfield + Shockwaves --- */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Base Cosmic Atmospheric Gradient */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: isDark
              ? [
                  'radial-gradient(circle 820px at 26% 46%, rgba(200, 161, 90, 0.22), rgba(22, 63, 50, 0.36) 46%, transparent 78%)',
                  'radial-gradient(circle 740px at 76% 36%, rgba(34, 97, 74, 0.28), rgba(200, 161, 90, 0.12) 48%, transparent 80%)',
                  'radial-gradient(ellipse 115% 80% at 50% 100%, rgba(16, 48, 37, 0.52), transparent 72%)',
                ].join(', ')
              : [
                  'radial-gradient(circle 820px at 26% 46%, rgba(200, 161, 90, 0.28), rgba(22, 63, 50, 0.10) 48%, transparent 78%)',
                  'radial-gradient(circle 680px at 76% 42%, rgba(200, 161, 90, 0.20), rgba(22, 63, 50, 0.08) 50%, transparent 80%)',
                ].join(', '),
          }}
        />

        {/* Animated Volumetric Gold Nebula Plume (Left Observatory Core) */}
        <motion.div
          animate={{
            x: [-25, 30, -25],
            y: [-18, 22, -18],
            scale: [1, 1.14, 1],
            rotate: [0, 12, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-24 top-[12%] w-[680px] h-[680px] rounded-full blur-[130px]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(229, 201, 139, 0.22) 0%, rgba(200, 161, 90, 0.12) 42%, rgba(22, 63, 50, 0.18) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(200, 161, 90, 0.26) 0%, rgba(22, 63, 50, 0.08) 60%, transparent 100%)',
          }}
        />

        {/* Animated Volumetric Forest Emerald Nebula Plume (Right Horizon) */}
        <motion.div
          animate={{
            x: [30, -28, 30],
            y: [20, -24, 20],
            scale: [1.08, 0.94, 1.08],
            rotate: [0, -15, 0],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[-8%] bottom-[6%] w-[740px] h-[740px] rounded-full blur-[145px]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(42, 107, 83, 0.28) 0%, rgba(22, 63, 50, 0.22) 45%, rgba(200, 161, 90, 0.09) 72%, transparent 100%)'
              : 'radial-gradient(circle, rgba(22, 63, 50, 0.12) 0%, rgba(200, 161, 90, 0.16) 55%, transparent 100%)',
          }}
        />

        {/* Diagonal Volumetric Light Beams (God-Rays) behind the 3D Astrolabe */}
        <motion.div
          animate={{
            opacity: isDark ? [0.26, 0.44, 0.26] : [0.18, 0.3, 0.18],
            rotate: [-26, -22, -26],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-36 left-[8%] w-[520px] h-[980px] blur-[75px] origin-top"
          style={{
            background:
              'linear-gradient(180deg, rgba(229, 201, 139, 0.24) 0%, rgba(200, 161, 90, 0.08) 52%, transparent 100%)',
          }}
        />

        {/* Cursor-Reactive Cosmic Nebula Halo */}
        <motion.div
          className="absolute w-[720px] h-[720px] rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2"
          style={{
            left: spotlightX,
            top: spotlightY,
            background: isDark
              ? 'radial-gradient(circle, rgba(229, 201, 139, 0.17) 0%, rgba(22, 63, 50, 0.15) 45%, transparent 72%)'
              : 'radial-gradient(circle, rgba(200, 161, 90, 0.22) 0%, rgba(22, 63, 50, 0.06) 45%, transparent 72%)',
          }}
        />

        {/* 60fps 3D Starfield, Shockwave Ripples & Keystroke Energy Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Soft Cosmic Edge Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 92% 88% at 50% 50%, transparent 52%, rgba(2, 6, 4, 0.78) 100%)'
              : 'radial-gradient(ellipse 92% 88% at 50% 50%, transparent 60%, rgba(22, 63, 50, 0.07) 100%)',
          }}
        />
      </div>

      {/* --- LAYER 2: Clean Minimal Top Navigation Bar --- */}
      <motion.header
        animate={{
          opacity: isWarping ? 0 : 1,
          y: isWarping ? -24 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 w-full max-w-6xl mx-auto px-6 sm:px-10 pt-6 pb-4 flex items-center justify-between gap-8"
      >
        {/* Zone 1: Back Link */}
        <Link
          href="/landing"
          className={`group inline-flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
            isDark
              ? 'text-[#C8A15A]/90 hover:text-[#F7F4EC]'
              : 'text-[#163F32] hover:text-[#0B261D]'
          }`}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Home</span>
        </Link>

        {/* Zone 2: Single-Line Brand Wordmark + 3D Cube Mark */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-3 group focus:outline-none whitespace-nowrap shrink-0"
        >
          <GutenbergTypeBlock3D
            size={30}
            activeFace={activeCubeFace}
            activityPulse={keystrokePulse}
            scrollPct={completionPct}
            interactiveStamp={false}
          />
          <span
            className={`text-xl font-bold tracking-tight ${
              isDark ? 'text-[#F7F4EC]' : 'text-[#12261F]'
            }`}
            style={{
              fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
            }}
          >
            BlogFlow AI
          </span>
        </Link>

        {/* Zone 3: Theme Toggle */}
        <div className="flex items-center shrink-0">
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isDark
                  ? 'border-[#C8A15A]/25 bg-[#0E2019]/80 text-[#E5C98B] hover:border-[#C8A15A]/60'
                  : 'border-[#163F32]/15 bg-white/70 text-[#163F32] hover:border-[#163F32]/40'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#E5C98B]" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#163F32]" />
                  <span>Dark</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.header>

      {/* --- LAYER 3: Split Main Stage (3D Astrolabe + Cube + Form Card) --- */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 sm:px-10 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN: Unboxed Floating 3D Gutenberg Cube + 3D Orbital Brass Astrolabe */}
        <motion.div
          animate={
            isWarping
              ? {
                  x: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '52%' : 0,
                  scale: warpStage === 'jump' ? 1.38 : 1.12,
                }
              : { x: 0, scale: 1 }
          }
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-6"
        >
          {/* Unboxed 3D Cube Stage with Multi-Plane 3D Orbital Brass Astrolabe Rings */}
          <div
            ref={cubeStageRef}
            className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 lg:-ml-4"
            style={{ perspective: 1300 }}
          >
            <motion.div
              style={{
                rotateX: stageRotateX,
                rotateY: stageRotateY,
                transformStyle: 'preserve-3d',
              }}
              className="relative flex items-center justify-center w-full h-full"
            >
              {/* Soft Golden Cosmos Plinth Glow behind Cube */}
              <motion.div
                animate={
                  isWarping
                    ? { scale: [1, 1.65, 2.4], opacity: [0.5, 0.9, 0] }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 1.5 }}
                className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle, rgba(229, 201, 139, 0.42) 0%, rgba(200, 161, 90, 0.22) 45%, rgba(22, 63, 50, 0.20) 70%, transparent 100%)'
                    : 'radial-gradient(circle, rgba(200, 161, 90, 0.44) 0%, rgba(22, 63, 50, 0.15) 55%, transparent 100%)',
                }}
              />

              {/* ASTROLABE RING 1: Outer Engraved Degree Dial (Background 3D Plane Z: -36px) */}
              <motion.div
                animate={{
                  rotateZ: 360,
                  scale: isWarping ? 1.55 : 1 + completionPct * 0.05,
                }}
                transition={{
                  rotateZ: {
                    duration: isWarping ? 3.5 : 58,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: { duration: 0.7 },
                }}
                style={{ transform: 'translateZ(-36px)' }}
                className="absolute -inset-12 sm:-inset-16 pointer-events-none flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 400 400"
                  className={`w-full h-full ${
                    isDark ? 'text-[#C8A15A]/45' : 'text-[#163F32]/35'
                  }`}
                >
                  {/* Outer hairline ring */}
                  <circle
                    cx="200"
                    cy="200"
                    r="190"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeDasharray="3 7"
                  />
                  {/* Inner degree track */}
                  <circle
                    cx="200"
                    cy="200"
                    r="172"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeOpacity="0.65"
                  />
                  {/* 24 Astrolabe Degree Ticks */}
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i * 15 * Math.PI) / 180;
                    const isMajor = i % 6 === 0;
                    const r1 = isMajor ? 162 : 167;
                    const r2 = 178;
                    const x1 = 200 + Math.cos(angle) * r1;
                    const y1 = 200 + Math.sin(angle) * r1;
                    const x2 = 200 + Math.cos(angle) * r2;
                    const y2 = 200 + Math.sin(angle) * r2;
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        strokeWidth={isMajor ? '2' : '1'}
                        strokeOpacity={isMajor ? '0.95' : '0.55'}
                      />
                    );
                  })}
                  {/* 4 Cardinal Brass Nodes */}
                  <circle cx="200" cy="28" r="3.5" fill="#E5C98B" />
                  <circle cx="372" cy="200" r="3.5" fill="#C8A15A" />
                  <circle cx="200" cy="372" r="3.5" fill="#E5C98B" />
                  <circle cx="28" cy="200" r="3.5" fill="#52B788" />
                </svg>
              </motion.div>

              {/* ASTROLABE RING 2: 3D Tilted Meridian Gyroscope Ring (Reacts to Field Focus) */}
              <motion.div
                animate={{
                  rotateX: isWarping
                    ? 0
                    : focusedField === 'email'
                    ? 56
                    : focusedField === 'password' || focusedField === 'confirm'
                    ? 72
                    : 64,
                  rotateY: isWarping
                    ? 0
                    : focusedField === 'email'
                    ? -34
                    : focusedField === 'password'
                    ? 28
                    : -24,
                  rotateZ: -360,
                  scale: isWarping ? 1.38 : 1,
                }}
                transition={{
                  rotateX: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                  rotateY: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                  rotateZ: {
                    duration: isWarping ? 2.6 : 32,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: { duration: 0.7 },
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className={`absolute -inset-4 sm:-inset-6 rounded-full border pointer-events-none ${
                  isDark
                    ? 'border-[#E5C98B]/40 shadow-[0_0_24px_rgba(200,161,90,0.16)]'
                    : 'border-[#C8A15A]/55'
                }`}
              >
                {/* Orbiting Brass Satellite Bead */}
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#E5C98B] shadow-[0_0_12px_#E5C98B]" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#52B788] shadow-[0_0_10px_#52B788]" />
              </motion.div>

              {/* ASTROLABE RING 3: Counter-Tilted Ecliptic Brass Ring */}
              <motion.div
                animate={{
                  rotateX: isWarping
                    ? 0
                    : focusedField === 'password' || focusedField === 'otp'
                    ? -66
                    : -54,
                  rotateY: isWarping
                    ? 0
                    : focusedField === 'name'
                    ? -36
                    : 32,
                  rotateZ: 360,
                  scale: isWarping ? 1.24 : 1,
                }}
                transition={{
                  rotateX: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                  rotateY: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                  rotateZ: {
                    duration: isWarping ? 2.2 : 24,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: { duration: 0.7 },
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className={`absolute inset-3 sm:inset-4 rounded-full border border-dashed pointer-events-none ${
                  isDark ? 'border-[#C8A15A]/45' : 'border-[#163F32]/35'
                }`}
              >
                <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#C8A15A] shadow-[0_0_10px_#C8A15A]" />
              </motion.div>

              {/* ASTROLABE RING 4: Inner Celestial Locking Collar */}
              <motion.div
                animate={{
                  rotateZ: -360,
                  scale: isWarping ? 1.18 : 1,
                }}
                transition={{
                  rotateZ: {
                    duration: isWarping ? 2.8 : 36,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: { duration: 0.8 },
                }}
                className={`absolute inset-10 rounded-full border pointer-events-none ${
                  isDark ? 'border-[#E5C98B]/25' : 'border-[#C8A15A]/45'
                }`}
              />

              {/* Interactive 3D Gutenberg Cube */}
              <div className="relative z-10">
                <GutenbergTypeBlock3D
                  size={152}
                  activeFace={activeCubeFace}
                  activityPulse={keystrokePulse}
                  scrollPct={completionPct}
                  interactiveStamp={!isWarping}
                  warpSpin={isWarping}
                  onStampFace={(nextFace) => {
                    setFocusedField(null);
                    setManualFaceOverride(nextFace);
                    pulseCube(false);
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Concise Welcome Copy or Post-Login Launch Status */}
          <div className="space-y-2.5 max-w-md">
            <AnimatePresence mode="wait">
              {isWarping ? (
                <motion.div
                  key="warp-copy"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-2 text-center"
                >
                  <h2
                    className={`text-3xl sm:text-4xl font-normal tracking-tight ${
                      isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                    }`}
                    style={{
                      fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
                    }}
                  >
                    Entering{' '}
                    <span className="italic text-[#E5C98B]">Studio...</span>
                  </h2>
                </motion.div>
              ) : (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-2.5"
                >
                  <h1
                    className={`text-4xl sm:text-5xl font-normal tracking-tight leading-[1.1] ${
                      isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                    }`}
                    style={{
                      fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
                      textWrap: 'balance',
                    }}
                  >
                    {copy.headlineStart}{' '}
                    <span
                      className={`italic font-normal ${
                        isDark ? 'text-[#E5C98B]' : 'text-[#163F32]'
                      }`}
                    >
                      {copy.headlineItalic}
                    </span>
                  </h1>

                  <p
                    className={`text-base leading-relaxed ${
                      isDark ? 'text-[#B4C4BC]' : 'text-[#4A5A52]'
                    }`}
                  >
                    {copy.subtext}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Clean Form Card with Everyday Labels */}
        <motion.div
          ref={formCardRef}
          animate={
            isWarping
              ? { opacity: 0, scale: 0.9, y: 20, filter: 'blur(8px)' }
              : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`lg:col-span-6 w-full max-w-[440px] mx-auto ${
            isWarping ? 'pointer-events-none' : ''
          }`}
        >
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
            {/* Card Container with Brushed-Brass Double Bezel & Completion Rim */}
            <div
              className={`relative rounded-2xl border p-6 sm:p-8 transition-colors duration-500 backdrop-blur-xl overflow-hidden ${
                isDark
                  ? 'bg-[#0B1914]/88 border-[#C8A15A]/30 shadow-[0_28px_70px_-15px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(229,201,139,0.2)]'
                  : 'bg-[#FCFBF7]/92 border-[#163F32]/20 shadow-[0_24px_60px_-15px_rgba(22,63,50,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]'
              }`}
            >
              {/* Top Completion Progress Hairline */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden"
                style={{
                  background: isDark
                    ? 'rgba(200, 161, 90, 0.12)'
                    : 'rgba(22, 63, 50, 0.08)',
                }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-[#163F32] via-[#C8A15A] to-[#E5C98B]"
                  animate={{ width: `${Math.max(8, Math.round(completionPct * 100))}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>

              {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
              {mode !== 'forgot' ? (
                <div
                  className={`relative grid grid-cols-2 p-1 rounded-xl border mb-5 ${
                    isDark
                      ? 'bg-[#06100C] border-[#C8A15A]/15'
                      : 'bg-[#EFECE1] border-[#163F32]/10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`relative z-10 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      mode === 'login'
                        ? 'text-[#F7F4EC]'
                        : isDark
                        ? 'text-[#9DB1A8] hover:text-[#F7F4EC]'
                        : 'text-[#4A5A52] hover:text-[#18211D]'
                    }`}
                  >
                    {mode === 'login' && (
                      <motion.div
                        layoutId="cleanAuthTab"
                        className="absolute inset-0 rounded-lg bg-[#163F32] border border-[#C8A15A]/40 shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`relative z-10 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      mode === 'register'
                        ? 'text-[#F7F4EC]'
                        : isDark
                        ? 'text-[#9DB1A8] hover:text-[#F7F4EC]'
                        : 'text-[#4A5A52] hover:text-[#18211D]'
                    }`}
                  >
                    {mode === 'register' && (
                      <motion.div
                        layoutId="cleanAuthTab"
                        className="absolute inset-0 rounded-lg bg-[#163F32] border border-[#C8A15A]/40 shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#C8A15A]/20">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`inline-flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
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
                    className={`mb-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
                      isDark
                        ? 'bg-[#3A1818]/90 border-[#D97757]/50 text-[#FCDAD0]'
                        : 'bg-[#FDF2EE] border-[#B85D3B]/40 text-[#7A2E18]'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C85A32]" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {oauthNotice && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mb-4 p-3.5 rounded-xl border text-xs leading-relaxed space-y-2.5 ${
                      isDark
                        ? 'bg-[#12261F]/95 border-[#C8A15A]/45 text-[#F7F4EC]'
                        : 'bg-[#F5F2E8] border-[#163F32]/25 text-[#18211D]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-[#C8A15A]" />
                        <div>
                          <p className="font-semibold">
                            {oauthNotice} OAuth client credentials are not configured in this preview environment.
                          </p>
                          <p className={`mt-0.5 ${isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'}`}>
                            Sign in immediately using a passwordless 6-digit email code or launch the instant Demo Studio.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOauthNotice(null)}
                        className="text-[11px] opacity-70 hover:opacity-100 cursor-pointer px-1"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setOauthNotice(null);
                          setMode('login');
                          setLoginMethod('otp');
                          setLoginOtpStep('request');
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#163F32] text-[#F7F4EC] border border-[#C8A15A]/40 hover:bg-[#1D5241] cursor-pointer"
                      >
                        Use 6-Digit Email Code
                      </button>
                      <button
                        type="button"
                        onClick={handleDemoAccess}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                          isDark
                            ? 'border-[#C8A15A]/35 text-[#E5C98B] hover:bg-[#C8A15A]/15'
                            : 'border-[#163F32]/25 text-[#163F32] hover:bg-[#163F32]/10'
                        }`}
                      >
                        Try Demo Account
                      </button>
                    </div>
                  </motion.div>
                )}

                {successMsg && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mb-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
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
                  <motion.div
                    key="login-view"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Sign-In Method Selector: Password vs. 6-Digit Email Code */}
                    <div
                      className={`grid grid-cols-2 gap-1 p-1 rounded-lg border text-[11px] font-medium ${
                        isDark
                          ? 'bg-[#06100C]/90 border-[#C8A15A]/20'
                          : 'bg-[#F3EFE4] border-[#163F32]/12'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setError('');
                        }}
                        className={`py-1.5 px-2.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          loginMethod === 'password'
                            ? isDark
                              ? 'bg-[#12261F] text-[#E5C98B] border border-[#C8A15A]/35 shadow-xs'
                              : 'bg-white text-[#163F32] border border-[#163F32]/20 shadow-xs'
                            : isDark
                            ? 'text-[#8FA59B] hover:text-[#F7F4EC]'
                            : 'text-[#615B4E] hover:text-[#18211D]'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Password</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('otp');
                          setError('');
                        }}
                        className={`py-1.5 px-2.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          loginMethod === 'otp'
                            ? isDark
                              ? 'bg-[#12261F] text-[#E5C98B] border border-[#C8A15A]/35 shadow-xs'
                              : 'bg-white text-[#163F32] border border-[#163F32]/20 shadow-xs'
                            : isDark
                            ? 'text-[#8FA59B] hover:text-[#F7F4EC]'
                            : 'text-[#615B4E] hover:text-[#18211D]'
                        }`}
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>6-Digit Email Code</span>
                      </button>
                    </div>

                    {loginMethod === 'password' ? (
                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                          <label
                            className={`block text-xs font-medium mb-1.5 ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            Email
                          </label>
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
                                pulseCube(false);
                              }}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                pulseCube(true);
                              }}
                              placeholder="you@example.com"
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          </div>

                          {/* Domain Quick-Buttons */}
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
                            <div className="flex items-center gap-2">
                              <label
                                className={`block text-xs font-medium ${
                                  isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                                }`}
                              >
                                Password
                              </label>
                              {capsLockOn && focusedField === 'password' && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#C8A15A]/20 text-[#E5C98B] border border-[#C8A15A]/40">
                                  CAPS LOCK ON
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => switchMode('forgot')}
                              className={`text-xs underline underline-offset-4 transition-colors cursor-pointer ${
                                isDark
                                  ? 'text-[#E5C98B] hover:text-[#F7F4EC]'
                                  : 'text-[#163F32] hover:text-[#9A732E]'
                              }`}
                            >
                              Forgot password?
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
                                pulseCube(false);
                              }}
                              onBlur={() => setFocusedField(null)}
                              onKeyUp={handlePasswordKeyEvent}
                              onKeyDown={handlePasswordKeyEvent}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                pulseCube(true);
                              }}
                              placeholder="••••••••"
                              className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/45 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Sign In</span>
                              <ArrowRight className="w-4 h-4 text-[#E5C98B]" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : loginOtpStep === 'request' ? (
                      <form onSubmit={handleRequestLoginOtp} className="space-y-4">
                        <div>
                          <label
                            className={`block text-xs font-medium mb-1.5 ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            Email Address
                          </label>
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
                                pulseCube(false);
                              }}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                pulseCube(true);
                              }}
                              placeholder="you@example.com"
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          </div>
                          <p
                            className={`mt-2 text-[11px] leading-relaxed ${
                              isDark ? 'text-[#8FA59B]' : 'text-[#615B4E]'
                            }`}
                          >
                            We will generate a one-time 6-digit verification code so you can sign in without a password.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || demoLoading}
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/45 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Send 6-Digit Login Code</span>
                              <ArrowRight className="w-4 h-4 text-[#E5C98B]" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold ${
                                isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                              }`}
                            >
                              Enter 6-Digit Sign-In Code
                            </span>
                            <button
                              type="button"
                              onClick={() => setLoginOtpStep('request')}
                              className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer"
                            >
                              Change email
                            </button>
                          </div>
                          <p
                            className={`text-xs ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Code issued for <span className="font-semibold underline">{email}</span>
                          </p>
                        </div>

                        {loginOtpPreview && (
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
                                Instant Code:{' '}
                                <strong className="font-mono tracking-widest text-sm">
                                  {loginOtpPreview}
                                </strong>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setLoginOtpDigits(loginOtpPreview.split(''));
                                pulseCube(true);
                              }}
                              className="text-xs font-medium px-2.5 py-1 rounded bg-[#163F32] text-[#F7F4EC] hover:opacity-90 cursor-pointer"
                            >
                              Auto-fill
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-6 gap-2 pt-1">
                          {loginOtpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                loginOtpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onFocus={() => setFocusedField('otp')}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => handleLoginOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleLoginOtpKeyDown(idx, e)}
                              onPaste={idx === 0 ? handleLoginOtpPaste : undefined}
                              className={`w-full aspect-square text-center text-lg font-mono font-bold rounded-xl border transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#06100C] border-[#C8A15A]/30 text-[#E5C98B] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/25 text-[#163F32] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-end text-xs">
                          <button
                            type="button"
                            onClick={() => handleRequestLoginOtp()}
                            className="inline-flex items-center gap-1 underline opacity-75 hover:opacity-100 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Resend code
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || demoLoading}
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/45 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Verify & Sign In</span>
                              <ArrowRight className="w-4 h-4 text-[#E5C98B]" />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* ==================== REGISTER VIEW ==================== */}
                {mode === 'register' && (
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-4"
                  >
                    {/* Full Name */}
                    <div>
                      <label
                        className={`block text-xs font-medium mb-1.5 ${
                          isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                        }`}
                      >
                        Full Name
                      </label>
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
                            pulseCube(false);
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => {
                            setName(e.target.value);
                            pulseCube(true);
                          }}
                          placeholder="Your name"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                            isDark
                              ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                              : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        className={`block text-xs font-medium mb-1.5 ${
                          isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                        }`}
                      >
                        Email
                      </label>
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
                            pulseCube(false);
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            pulseCube(true);
                          }}
                          placeholder="you@example.com"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                            isDark
                              ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
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
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            className={`block text-xs font-medium ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            Password
                          </label>
                          {capsLockOn && (focusedField === 'password' || focusedField === 'confirm') && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#C8A15A]/20 text-[#E5C98B] border border-[#C8A15A]/40">
                              CAPS
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#615B4E]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onFocus={() => {
                              setFocusedField('password');
                              pulseCube(false);
                            }}
                            onBlur={() => setFocusedField(null)}
                            onKeyUp={handlePasswordKeyEvent}
                            onKeyDown={handlePasswordKeyEvent}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              pulseCube(true);
                            }}
                            placeholder="Min 8 chars"
                            className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              isDark
                                ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            className={`block text-xs font-medium ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            Confirm Password
                          </label>
                          {confirmPassword.length > 0 && (
                            <span
                              className={`text-[10px] font-medium ${
                                confirmPassword === password
                                  ? 'text-[#52B788]'
                                  : 'text-[#D97757]'
                              }`}
                            >
                              {confirmPassword === password ? '✓ Match' : 'No match'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#615B4E]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onFocus={() => {
                              setFocusedField('confirm');
                              pulseCube(false);
                            }}
                            onBlur={() => setFocusedField(null)}
                            onKeyUp={handlePasswordKeyEvent}
                            onKeyDown={handlePasswordKeyEvent}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              pulseCube(true);
                            }}
                            placeholder="Repeat password"
                            className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              isDark
                                ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Meter & Live 4-Rule Checklist */}
                    {password.length > 0 && (
                      <div className="space-y-2 pt-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className={isDark ? 'text-[#8FA59B]' : 'text-[#615B4E]'}>
                            Password strength
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                          {pwStrength.rules.map((rule) => (
                            <div
                              key={rule.id}
                              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border transition-colors ${
                                rule.met
                                  ? isDark
                                    ? 'bg-[#12261F]/90 border-[#52B788]/40 text-[#95D5B2]'
                                    : 'bg-[#EAF2EE] border-[#163F32]/25 text-[#163F32]'
                                  : isDark
                                  ? 'bg-[#06100C]/60 border-white/10 text-[#6E857B]'
                                  : 'bg-[#F3EFE4]/70 border-[#163F32]/10 text-[#8A8477]'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{rule.label}</span>
                            </div>
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
                          <span>Create Account</span>
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
                    transition={{ duration: 0.2 }}
                  >
                    {forgotStep === 1 && (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-1">
                          <h3
                            className={`text-lg font-semibold ${
                              isDark ? 'text-[#F7F4EC]' : 'text-[#18211D]'
                            }`}
                          >
                            Reset Password
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Enter your email address and we will send you a 6-digit verification code.
                          </p>
                        </div>

                        <div>
                          <label
                            className={`block text-xs font-medium mb-1.5 ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C8A15A]" />
                            <input
                              type="email"
                              required
                              value={forgotEmail}
                              onFocus={() => {
                                setFocusedField('email');
                                pulseCube(false);
                              }}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setForgotEmail(e.target.value);
                                pulseCube(true);
                              }}
                              placeholder="you@example.com"
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] placeholder-[#6E857B] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] placeholder-[#8A8477] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/45 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Send Verification Code</span>
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
                          >
                            Enter 6-Digit Code
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Enter the code sent to{' '}
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
                                Code:{' '}
                                <strong className="font-mono tracking-widest text-sm">
                                  {otpPreview}
                                </strong>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpDigits(otpPreview.split(''));
                                pulseCube(true);
                              }}
                              className="text-xs font-medium px-2.5 py-1 rounded bg-[#163F32] text-[#F7F4EC] hover:opacity-90 cursor-pointer"
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
                                  ? 'bg-[#06100C] border-[#C8A15A]/30 text-[#E5C98B] focus:border-[#C8A15A]'
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
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/45 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Verify Code</span>
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
                          >
                            Set New Password
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Code verified. Enter your new password (at least 8 characters) below.
                          </p>
                        </div>

                        <div>
                          <label
                            className={`block text-xs font-medium mb-1.5 ${
                              isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                            }`}
                          >
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C8A15A]" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={newPassword}
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField(null)}
                              onKeyUp={handlePasswordKeyEvent}
                              onKeyDown={handlePasswordKeyEvent}
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                pulseCube(true);
                              }}
                              placeholder="At least 8 characters"
                              className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] focus:border-[#C8A15A]'
                                  : 'bg-[#F7F4EC] border-[#163F32]/20 text-[#18211D] focus:border-[#163F32] focus:bg-white'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              className={`block text-xs font-medium ${
                                isDark ? 'text-[#D7E2DC]' : 'text-[#18211D]'
                              }`}
                            >
                              Confirm New Password
                            </label>
                            {confirmNewPassword.length > 0 && (
                              <span
                                className={`text-[10px] font-medium ${
                                  confirmNewPassword === newPassword
                                    ? 'text-[#52B788]'
                                    : 'text-[#D97757]'
                                }`}
                              >
                                {confirmNewPassword === newPassword ? '✓ Passwords match' : 'No match yet'}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C8A15A]" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={confirmNewPassword}
                              onFocus={() => setFocusedField('confirm')}
                              onBlur={() => setFocusedField(null)}
                              onKeyUp={handlePasswordKeyEvent}
                              onKeyDown={handlePasswordKeyEvent}
                              onChange={(e) => {
                                setConfirmNewPassword(e.target.value);
                                pulseCube(true);
                              }}
                              placeholder="Repeat new password"
                              className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                                isDark
                                  ? 'bg-[#06100C] border-[#C8A15A]/25 text-[#F7F4EC] focus:border-[#C8A15A]'
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
                              <span>Update Password</span>
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
                          >
                            Password Updated
                          </h3>
                          <p
                            className={`text-xs ${
                              isDark ? 'text-[#9DB1A8]' : 'text-[#4A5A52]'
                            }`}
                          >
                            Your password has been updated. You can now sign in.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignInAfterReset}
                          disabled={loading}
                          className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F4EC] bg-[#163F32] hover:bg-[#1D5241] border border-[#C8A15A]/45 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#E5C98B]" />
                          ) : (
                            <>
                              <span>Continue to Studio</span>
                              <ArrowRight className="w-4 h-4 text-[#E5C98B]" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* --- Demo Account & Social Providers --- */}
              {mode !== 'forgot' && (
                <div className="mt-6 pt-5 border-t border-[#C8A15A]/15 space-y-3">
                  <button
                    type="button"
                    onClick={handleDemoAccess}
                    disabled={loading || demoLoading}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                      isDark
                        ? 'bg-[#12261F]/60 hover:bg-[#163F32] border-[#C8A15A]/30 text-[#E5C98B]'
                        : 'bg-[#EFECE1]/80 hover:bg-[#163F32] border-[#163F32]/15 text-[#163F32] hover:text-[#F7F4EC]'
                    }`}
                  >
                    {demoLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Try Demo Account</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleOAuthSignIn('google')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#06100C] border-[#C8A15A]/20 text-[#D7E2DC] hover:border-[#C8A15A]/50'
                          : 'bg-[#F7F4EC] border-[#163F32]/15 text-[#18211D] hover:bg-[#EFECE1]'
                      }`}
                    >
                      <span className="font-serif font-bold text-sm text-[#C8A15A]">G</span>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOAuthSignIn('github')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#06100C] border-[#C8A15A]/20 text-[#D7E2DC] hover:border-[#C8A15A]/50'
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
        </motion.div>
      </main>

      {/* --- LAYER 4: Post-Login Golden Warp Flash Overlay --- */}
      <AnimatePresence>
        {warpStage === 'jump' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0.92] }}
            transition={{ duration: 1.25, ease: 'easeIn' }}
            className="pointer-events-none fixed inset-0 z-50"
            style={{
              background: isDark
                ? 'radial-gradient(circle at 50% 50%, rgba(229, 201, 139, 0.85) 0%, rgba(22, 63, 50, 0.95) 55%, #050B09 100%)'
                : 'radial-gradient(circle at 50% 50%, rgba(229, 201, 139, 0.9) 0%, #F7F4EC 80%)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="h-6" />
    </div>
  );
}

export default MorphingAuthPortal;
