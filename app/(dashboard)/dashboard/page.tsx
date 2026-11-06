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

interface AtelierDustMote3D {
  x: number;
  y: number;
  z: number; // 0.15 (far) .. 1.0 (near foreground bokeh)
  vx: number;
  vy: number;
  baseRadius: number;
  color: string;
  shimmerPhase: number;
  shimmerSpeed: number;
}

interface AtelierRippleWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  secondaryColor?: string;
  tiltY: number;
  lineWidth: number;
}

/**
 * Volumetric Atelier Light Beams + 60fps 3D Gold Dust Motes & Reactive Ripple Canvas
 */
function DashboardAtelierBackdrop3D({
  isDark,
  typingPulse,
  stampPulse,
  coverflowPulse,
  coverflowDir,
}: {
  isDark: boolean;
  typingPulse: number;
  stampPulse: number;
  coverflowPulse: number;
  coverflowDir: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<AtelierRippleWave[]>([]);
  const breezeVxRef = useRef<number>(0);

  // 1. Keystroke Energy Ripples from the Command Stage
  useEffect(() => {
    if (typingPulse === 0 || typeof window === 'undefined') return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ripplesRef.current.push({
      x: w * 0.42 + (Math.random() - 0.5) * 90,
      y: h * 0.24 + (Math.random() - 0.5) * 40,
      radius: 18,
      maxRadius: Math.hypot(w, h) * 0.42,
      speed: 6.8,
      alpha: 0.34,
      maxAlpha: 0.34,
      color: '#E5C98B',
      secondaryColor: '#C8A15A',
      tiltY: 0.78,
      lineWidth: 1.4,
    });
    if (ripplesRef.current.length > 10) ripplesRef.current.shift();
  }, [typingPulse]);

  // 2. 3D Coverflow Card Flip Energy Pulse + Horizontal Dust Breeze
  useEffect(() => {
    if (coverflowPulse === 0 || typeof window === 'undefined') return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    breezeVxRef.current = (coverflowDir >= 0 ? -1 : 1) * 4.2;

    ripplesRef.current.push({
      x: w * 0.55,
      y: h * 0.58,
      radius: 28,
      maxRadius: Math.hypot(w, h) * 0.58,
      speed: 9.2,
      alpha: 0.44,
      maxAlpha: 0.44,
      color: '#C8A15A',
      secondaryColor: '#52B788',
      tiltY: 0.72,
      lineWidth: 1.8,
    });
    if (ripplesRef.current.length > 10) ripplesRef.current.shift();
  }, [coverflowPulse, coverflowDir]);

  // 3. Approve / Publish Stamp Double Shockwave Burst
  useEffect(() => {
    if (stampPulse === 0 || typeof window === 'undefined') return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxSpan = Math.hypot(w, h) * 0.78;
    breezeVxRef.current = (Math.random() > 0.5 ? 1 : -1) * 2.6;

    const palette = [
      { color: '#E5C98B', secondary: '#C8A15A', speed: 11.5, r0: 24, alpha: 0.52 },
      { color: '#52B788', secondary: '#E5C98B', speed: 8.6, r0: 46, alpha: 0.4 },
    ];
    palette.forEach((p) => {
      ripplesRef.current.push({
        x: w * 0.54,
        y: h * 0.52,
        radius: p.r0,
        maxRadius: maxSpan,
        speed: p.speed,
        alpha: p.alpha,
        maxAlpha: p.alpha,
        color: p.color,
        secondaryColor: p.secondary,
        tiltY: 0.85,
        lineWidth: 2.2,
      });
    });
  }, [stampPulse]);

  // 60fps 3D Gold Dust Motes & Reactive Wave Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const darkColors = ['#F7F4EC', '#E5C98B', '#C8A15A', '#D4AF67', '#68C39F'];
    const lightColors = ['#C8A15A', '#9A732E', '#163F32', '#B5893D', '#2A6B53'];
    const MOTE_COUNT = 110;

    const motes: AtelierDustMote3D[] = Array.from({ length: MOTE_COUNT }, () => {
      // Bias more motes toward mid/background with ~18% foreground bokeh motes
      const z = Math.random() < 0.18 ? 0.75 + Math.random() * 0.25 : 0.16 + Math.random() * 0.58;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        vx: (Math.random() - 0.35) * 0.28 * z,
        vy: (-0.18 - Math.random() * 0.26) * z,
        baseRadius: z > 0.78 ? 2.6 + Math.random() * 2.2 : 0.8 + z * 1.8,
        color: (isDark ? darkColors : lightColors)[Math.floor(Math.random() * 5)],
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.015 + Math.random() * 0.028,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Decay Coverflow horizontal breeze smoothly
      breezeVxRef.current *= 0.93;

      // 1. Advance & Draw Reactive Ripple Waves
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const wave = ripplesRef.current[r];
        wave.radius += wave.speed;
        const progress = wave.radius / wave.maxRadius;
        wave.alpha = Math.max(0, (1 - progress) * wave.maxAlpha);

        if (wave.radius >= wave.maxRadius || wave.alpha <= 0.01) {
          ripplesRef.current.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.translate(wave.x, wave.y);
        ctx.scale(1, wave.tiltY);

        // Primary golden wavefront
        ctx.beginPath();
        ctx.arc(0, 0, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = isDark ? wave.alpha : wave.alpha * 0.8;
        ctx.lineWidth = wave.lineWidth;
        ctx.stroke();

        // Secondary harmonic echo ring
        if (wave.secondaryColor && wave.radius > 32) {
          ctx.beginPath();
          ctx.arc(0, 0, wave.radius - 20, 0, Math.PI * 2);
          ctx.strokeStyle = wave.secondaryColor;
          ctx.globalAlpha = (isDark ? wave.alpha : wave.alpha * 0.7) * 0.45;
          ctx.lineWidth = wave.lineWidth * 0.65;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Update & Draw 3D Gold Dust Motes
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.shimmerPhase += m.shimmerSpeed;

        // Drift + subtle sinusoidal float + Coverflow breeze scaled by 3D Z-depth
        m.x += m.vx + Math.sin(m.shimmerPhase * 0.6) * 0.14 * m.z + breezeVxRef.current * m.z;
        m.y += m.vy;

        // Wrap around viewport edges
        if (m.y < -20) {
          m.y = height + 18;
          m.x = Math.random() * width;
        } else if (m.y > height + 20) {
          m.y = -18;
        }
        if (m.x < -20) m.x = width + 18;
        if (m.x > width + 20) m.x = -18;

        let drawX = m.x;
        let drawY = m.y;
        let waveExcite = 0;

        // Displace and brighten 3D gold dust motes when a ripple wave passes through them
        for (let r = 0; r < ripplesRef.current.length; r++) {
          const wave = ripplesRef.current[r];
          const dx = drawX - wave.x;
          const dy = (drawY - wave.y) / wave.tiltY;
          const dist = Math.hypot(dx, dy);
          const band = 56;
          const delta = Math.abs(dist - wave.radius);
          if (delta < band && dist > 1) {
            const influence = (1 - delta / band) * (wave.alpha / wave.maxAlpha);
            const push = influence * 14 * m.z;
            drawX += (dx / dist) * push;
            drawY += (dy / dist) * push;
            waveExcite = Math.max(waveExcite, influence);
          }
        }

        // Check if mote is inside the diagonal Volumetric Atelier Light Beam corridor
        const beamCoord = drawX * 0.75 + drawY * 0.45;
        const inPrimaryBeam =
          beamCoord > width * 0.18 && beamCoord < width * 0.78 ? 0.25 : 0;

        const shimmer = 0.55 + 0.45 * Math.sin(m.shimmerPhase);
        const baseAlpha = m.z > 0.78 ? 0.28 : 0.22 + m.z * 0.48;
        const alpha = Math.min(
          0.95,
          (baseAlpha * shimmer + inPrimaryBeam * 0.22 + waveExcite * 0.48) *
            (isDark ? 1 : 0.78)
        );
        const radius = m.baseRadius * (1 + waveExcite * 0.55);

        // Soft 3D bokeh halo for foreground motes or ripple-excited motes
        if (m.z > 0.68 || waveExcite > 0.18 || inPrimaryBeam > 0) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.globalAlpha = alpha * 0.18;
          ctx.fill();
        }

        // Crisp luminous gold core
        ctx.beginPath();
        ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
        ctx.fillStyle = waveExcite > 0.28 ? '#FFF9EA' : m.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none">
      {/* Ambient Deep Atelier Base Wash */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: isDark
            ? [
                'radial-gradient(circle 860px at 26% 18%, rgba(200, 161, 90, 0.16), rgba(22, 63, 50, 0.22) 48%, transparent 78%)',
                'radial-gradient(circle 760px at 82% 58%, rgba(22, 63, 50, 0.28), rgba(200, 161, 90, 0.08) 52%, transparent 80%)',
              ].join(', ')
            : [
                'radial-gradient(circle 860px at 26% 18%, rgba(200, 161, 90, 0.20), rgba(22, 63, 50, 0.06) 50%, transparent 78%)',
                'radial-gradient(circle 720px at 82% 58%, rgba(200, 161, 90, 0.14), rgba(22, 63, 50, 0.05) 52%, transparent 80%)',
              ].join(', '),
        }}
      />

      {/* Volumetric Atelier Light Beam 1: Primary Golden Skylight Shaft */}
      <motion.div
        animate={{
          opacity: isDark ? [0.28, 0.46, 0.28] : [0.22, 0.36, 0.22],
          rotate: [-28, -24, -28],
          x: [-15, 20, -15],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-44 left-[14%] w-[460px] h-[1200px] blur-[72px] origin-top"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(229, 201, 139, 0.26) 0%, rgba(200, 161, 90, 0.11) 48%, transparent 92%)'
            : 'linear-gradient(180deg, rgba(200, 161, 90, 0.30) 0%, rgba(200, 161, 90, 0.10) 48%, transparent 92%)',
        }}
      />

      {/* Volumetric Atelier Light Beam 2: Secondary Champagne & Emerald Ray */}
      <motion.div
        animate={{
          opacity: isDark ? [0.2, 0.36, 0.2] : [0.14, 0.26, 0.14],
          rotate: [-22, -26, -22],
          x: [20, -18, 20],
        }}
        transition={{ duration: 23, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-36 left-[46%] w-[380px] h-[1100px] blur-[80px] origin-top"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(200, 161, 90, 0.18) 0%, rgba(42, 107, 83, 0.14) 52%, transparent 94%)'
            : 'linear-gradient(180deg, rgba(200, 161, 90, 0.22) 0%, rgba(22, 63, 50, 0.07) 52%, transparent 94%)',
        }}
      />

      {/* Volumetric Atelier Light Beam 3: Far-Right Ambient Column */}
      <motion.div
        animate={{
          opacity: isDark ? [0.15, 0.28, 0.15] : [0.1, 0.2, 0.1],
          rotate: [-30, -27, -30],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 right-[6%] w-[320px] h-[960px] blur-[76px] origin-top"
        style={{
          background:
            'linear-gradient(180deg, rgba(229, 201, 139, 0.18) 0%, rgba(200, 161, 90, 0.06) 55%, transparent 95%)',
        }}
      />

      {/* 60fps 3D Gold Dust Motes & Reactive Ripple Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}

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
      className={`card p-5 relative cursor-pointer select-none transition-colors backdrop-blur-xl !bg-[var(--color-surface)]/72 dark:!bg-[#111B16]/70 ${
        active
          ? 'border-[#C8A15A] ring-1 ring-[#C8A15A]/45'
          : 'border-[#C8A15A]/20 hover:border-[#C8A15A]/55'
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

  // 3D Orrery & Atelier Background Reactive Impulses
  const [typingPulse, setTypingPulse] = useState(0);
  const [stampPulse, setStampPulse] = useState(0);
  const [coverflowPulse, setCoverflowPulse] = useState(0);
  const [coverflowDir, setCoverflowDir] = useState<number>(1);
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
    setCoverflowDir(dir);
    setCoverflowPulse((p) => p + 1);
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

  const frostedCardClass =
    'card backdrop-blur-xl !bg-[var(--color-surface)]/72 dark:!bg-[#111B16]/70 border-[#C8A15A]/20 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.18)]';

  return (
    <div className="relative space-y-6 pb-8">
      {/* LAYER 0: Volumetric Atelier Light Beams + 60fps 3D Gold Dust & Reactive Ripples */}
      <DashboardAtelierBackdrop3D
        isDark={isDark}
        typingPulse={typingPulse}
        stampPulse={stampPulse}
        coverflowPulse={coverflowPulse}
        coverflowDir={coverflowDir}
      />

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
      <div className={`${frostedCardClass} relative z-10 p-6 sm:p-7`}>
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
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
      <div className={`${frostedCardClass} relative z-10 p-6 sm:p-7 overflow-hidden`}>
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
                        setCoverflowDir(idx > safeCoverflowIndex ? 1 : -1);
                        setCoverflowPulse((p) => p + 1);
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
                    className={`rounded-2xl border p-6 transition-shadow backdrop-blur-xl ${
                      isCenter ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      isDark
                        ? isCenter
                          ? 'bg-[#121D18]/88 border-[#C8A15A]/65 shadow-[0_26px_60px_-15px_rgba(0,0,0,0.85)]'
                          : 'bg-[#0E1713]/75 border-[var(--color-border)]'
                        : isCenter
                        ? 'bg-[#FCFBF7]/88 border-[#163F32]/45 shadow-[0_24px_55px_-15px_rgba(22,63,50,0.22)]'
                        : 'bg-[#F5F2E9]/78 border-[var(--color-border)]'
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
                onClick={() => {
                  setCoverflowDir(idx > safeCoverflowIndex ? 1 : -1);
                  setCoverflowPulse((p) => p + 1);
                  setCoverflowIndex(idx);
                }}
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
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Output Trajectory */}
        <div className={`lg:col-span-7 ${frostedCardClass} flex flex-col justify-between`}>
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
        <div className={`lg:col-span-5 ${frostedCardClass} flex flex-col justify-between`}>
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
