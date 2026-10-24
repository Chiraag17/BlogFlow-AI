'use client';

import React, { useMemo, useRef, useState } from 'react';
import { RotateCw, ShieldCheck, Lock, Unlock, CheckCircle2, Sparkles } from 'lucide-react';
import GutenbergTypeBlock3D, { type TypeBlockFace } from '@/components/brand/GutenbergTypeBlock3D';

export interface EditorialPressPass3DProps {
  mode: 'login' | 'register';
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  isPasswordFocused: boolean;
  activeStageIdx: number;
  onSelectStage: (idx: number) => void;
  isSubmitting?: boolean;
  isVerified?: boolean;
}

const STAGES: { num: string; label: string; desc: string; face: TypeBlockFace }[] = [
  { num: '01', label: 'Research', desc: 'Live Tavily primary-source indexing', face: 'loupe' },
  { num: '02', label: 'Draft', desc: 'Gemini long-form H2/H3 manuscript synthesis', face: 'nib' },
  { num: '03', label: 'Review', desc: 'SEO, readability & human editorial gate', face: 'seal' },
  { num: '04', label: 'Publish', desc: 'AES-256 encrypted WordPress REST sync', face: 'section' },
];

export default function EditorialPressPass3D({
  mode,
  name,
  email,
  password,
  confirmPassword,
  isPasswordFocused,
  activeStageIdx,
  onSelectStage,
  isSubmitting = false,
  isVerified = false,
}: EditorialPressPass3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [manualFlip, setManualFlip] = useState<boolean | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hovering: false });

  // Effective flip state: password focus flips to rear cryptographic side (180deg), unless manually toggled
  const isFlipped = manualFlip !== null ? manualFlip : isPasswordFocused;

  // Reset manual flip override whenever password focus changes
  React.useEffect(() => {
    setManualFlip(null);
  }, [isPasswordFocused]);

  // Derive live editor display name & domain from form inputs
  const derivedName = useMemo(() => {
    if (name && name.trim().length > 0) return name.trim();
    if (email && email.includes('@')) {
      const prefix = email.split('@')[0];
      if (prefix) {
        return prefix
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
    if (email && email.trim().length > 0) return email.trim();
    return mode === 'login' ? 'Managing Editor' : 'New Studio Editor';
  }, [name, email, mode]);

  const derivedDomain = useMemo(() => {
    if (email && email.includes('@')) {
      const dom = email.split('@')[1];
      if (dom && dom.trim().length > 0) return `@${dom.trim().toLowerCase()}`;
    }
    return '@editorial.studio';
  }, [email]);

  // Deterministic monospaced Accession Code derived from typed characters
  const accessionCode = useMemo(() => {
    const seedStr = `${name || ''}:${email || 'blogflow'}`;
    let hash = 2026;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash * 31 + seedStr.charCodeAt(i)) % 9000 + 1000;
    }
    return `ACC. 2026 // PRESS-${hash}`;
  }, [name, email]);

  // Live Password Entropy & Cryptographic Lock Metrics
  const entropyChecks = useMemo(() => {
    const lenOk = password.length >= 8;
    const caseOk = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const numSymOk = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const matchOk =
      mode === 'login'
        ? password.length >= 4
        : Boolean(password.length >= 8 && confirmPassword && password === confirmPassword);

    return [
      { code: '01', label: 'Length ≥ 8 chars', passed: lenOk },
      { code: '02', label: 'Mixed Case Entropy', passed: caseOk || (mode === 'login' && password.length >= 6) },
      { code: '03', label: 'Numeric / Cipher Symbol', passed: numSymOk || (mode === 'login' && password.length >= 5) },
      {
        code: '04',
        label: mode === 'login' ? 'Session Token Ready' : 'Confirmation Match',
        passed: matchOk,
      },
    ];
  }, [password, confirmPassword, mode]);

  const passedCount = entropyChecks.filter((c) => c.passed).length;
  const tumblerAngle = isVerified ? 0 : password.length * 24;
  const activityPulse = (name?.length || 0) + email.length + password.length + (confirmPassword?.length || 0);
  const crestFace: TypeBlockFace = isVerified || isFlipped
    ? 'seal'
    : email.length > 0 || (name && name.length > 0)
      ? STAGES[activeStageIdx]?.face || 'nib'
      : 'monogram';

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 14;
    const rx = (0.5 - py) * 12;
    setTilt({ rx, ry, gx: px * 100, gy: py * 100, hovering: true });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, hovering: false });
  };

  const baseRotateY = isFlipped ? 180 : 0;
  const totalRotateY = baseRotateY + (isFlipped ? -tilt.ry : tilt.ry);
  const totalRotateX = tilt.rx;

  return (
    <div className="w-full h-full flex flex-col justify-between relative select-none">
      {/* Top Bar Inside Studio Showcase */}
      <div className="relative z-10 flex items-center justify-between text-xs text-[#F7F4EC]/75 border-b border-[#F7F4EC]/12 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono tracking-wider uppercase text-[11px] text-[#C8A15A]">
            {accessionCode}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setManualFlip(!isFlipped)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#C8A15A]/35 bg-[#C8A15A]/10 text-[11px] font-medium text-[#F7F4EC] hover:border-[#C8A15A] transition-colors cursor-pointer"
          title="Flip 3D Press Credential 180°"
        >
          <RotateCw size={12} className="text-[#C8A15A]" />
          <span>{isFlipped ? 'View Front Identity' : 'Flip Pass (180°)'}</span>
        </button>
      </div>

      {/* Center: 3D Two-Sided Embossed Editorial Press Pass */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="my-auto py-6 flex flex-col items-center justify-center"
        style={{ perspective: '1400px' }}
      >
        <div
          className="relative w-full max-w-[380px] h-[440px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${totalRotateX.toFixed(2)}deg) rotateY(${totalRotateY.toFixed(2)}deg)`,
            transition: tilt.hovering
              ? 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 680ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* ============================================================
              FRONT FACE (0deg): LIVE-ENGRAVED EDITORIAL PRESS CREDENTIAL
              ============================================================ */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#123328] dark:bg-[#131C18] border-2 border-[#C8A15A]/55 p-6 flex flex-col justify-between shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg) translateZ(2px)',
            }}
          >
            {/* Dynamic Brass Foil Specular Sheen */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: tilt.hovering ? 1 : 0.35,
                background: `radial-gradient(300px circle at ${tilt.gx}% ${tilt.gy}%, rgba(200, 161, 90, 0.22), transparent 70%)`,
              }}
            />

            {/* Top Brass Lanyard Clasp Slot + Header */}
            <div>
              <div className="mx-auto w-16 h-2.5 rounded-full bg-[#0A1914] border border-[#C8A15A]/50 mb-5" />
              <div className="flex items-center justify-between border-b border-[#C8A15A]/25 pb-3.5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C8A15A]">
                    Editorial Press Pass
                  </div>
                  <div
                    className="text-base font-semibold text-[#F7F4EC] tracking-tight mt-0.5"
                    style={{ fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif" }}
                  >
                    BlogFlow AI Studio
                  </div>
                </div>
                <GutenbergTypeBlock3D
                  size={36}
                  activeFace={crestFace}
                  activityPulse={activityPulse}
                  interactiveStamp={true}
                />
              </div>
            </div>

            {/* Middle: Live-Engraved Editor Name & Domain */}
            <div className="my-auto py-4 border-y border-[#F7F4EC]/10 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#F7F4EC]/55">
                <span>Credential Holder (Live Engraving)</span>
                <span className="text-[#C8A15A]">{mode === 'login' ? 'LEVEL 04' : 'NEW ISSUE'}</span>
              </div>

              <div
                className="text-2xl sm:text-[28px] leading-tight text-[#F7F4EC] truncate font-normal tracking-tight"
                style={{ fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif" }}
              >
                {derivedName}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#B8D5C5]">
                <span className="truncate max-w-[210px]">{email || 'editor@publication.com'}</span>
                <span className="text-[#C8A15A]">{derivedDomain}</span>
              </div>

              {/* 4-Stage Pipeline Clearance Matrix */}
              <div className="pt-3 grid grid-cols-4 gap-1.5">
                {STAGES.map((st, idx) => {
                  const active = idx === activeStageIdx;
                  return (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => onSelectStage(idx)}
                      className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#C8A15A] bg-[#C8A15A]/20 text-[#F7F4EC]'
                          : 'border-[#F7F4EC]/12 bg-[#0D231B]/60 text-[#F7F4EC]/55 hover:text-[#F7F4EC]'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-[#C8A15A]">{st.num}</div>
                      <div className="text-[11px] font-semibold truncate mt-0.5">{st.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom: Accession Barcode & Embossed Brass Seal */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#F7F4EC]/60">{accessionCode}</div>
                <div className="text-[11px] text-[#B8D5C5] flex items-center gap-1.5">
                  <Sparkles size={11} className="text-[#C8A15A]" />
                  <span>Focus password to flip 180°</span>
                </div>
              </div>

              {/* Embossed Brass Seal */}
              <div className="w-12 h-12 rounded-full border-2 border-[#C8A15A] bg-[#C8A15A]/20 flex flex-col items-center justify-center text-[#C8A15A] shadow-inner">
                <span className="text-[8px] font-mono uppercase tracking-tighter">VALID</span>
                <span className="text-xs font-serif font-bold leading-none">2026</span>
              </div>
            </div>
          </div>

          {/* ============================================================
              REAR FACE (180deg): CRYPTOGRAPHIC SEAL & MECHANICAL TUMBLER
              ============================================================ */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#0E261E] dark:bg-[#101814] border-2 border-[#C8A15A] p-6 flex flex-col justify-between shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(2px)',
            }}
          >
            {/* Top Security Header */}
            <div className="flex items-center justify-between border-b border-[#C8A15A]/25 pb-3.5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C8A15A]">
                  Reverse Side · Security Seal
                </div>
                <div className="text-sm font-semibold text-[#F7F4EC] mt-0.5">
                  AES-256-GCM &amp; Bcrypt Vault
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#C8A15A]/20 border border-[#C8A15A] flex items-center justify-center text-[#C8A15A]">
                {isVerified || passedCount === 4 ? <Lock size={15} /> : <Unlock size={15} />}
              </div>
            </div>

            {/* Center: Mechanical Rotating Brass Lock Cylinder (SVG) */}
            <div className="my-auto flex flex-col items-center justify-center py-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer Calibrated Ring */}
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${tumblerAngle}deg)` }}
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#C8A15A"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    fill="none"
                    stroke="#B8D5C5"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                  />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <line
                      key={deg}
                      x1="60"
                      y1="6"
                      x2="60"
                      y2="16"
                      stroke="#C8A15A"
                      strokeWidth="2.5"
                      transform={`rotate(${deg} 60 60)`}
                    />
                  ))}
                </svg>

                {/* Inner Counter-Rotating Ring */}
                <div
                  className="absolute inset-5 rounded-full border border-[#C8A15A]/60 bg-[#163F32]/80 flex flex-col items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${-tumblerAngle * 0.5}deg)` }}
                >
                  <ShieldCheck size={24} className="text-[#C8A15A]" />
                  <span className="text-[10px] font-mono tabular-nums text-[#F7F4EC] mt-1">
                    {password.length} CHARS
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-[#C8A15A] mt-2">
                {isSubmitting || isVerified
                  ? 'TUMBLER LOCKED · STUDIO AUTHORIZED'
                  : `TUMBLER ROTATION: ${tumblerAngle % 360}°`}
              </div>
            </div>

            {/* Bottom: 4 Live Cryptographic Entropy Bars */}
            <div className="space-y-2 pt-2 border-t border-[#F7F4EC]/12">
              <div className="grid grid-cols-4 gap-1.5">
                {entropyChecks.map((chk) => (
                  <div
                    key={chk.code}
                    className={`h-1.5 rounded-full transition-colors duration-200 ${
                      chk.passed ? 'bg-[#C8A15A]' : 'bg-[#F7F4EC]/15'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {entropyChecks.map((chk) => (
                  <div
                    key={chk.code}
                    className={`flex items-center gap-1.5 text-[11px] font-mono ${
                      chk.passed ? 'text-[#B8D5C5]' : 'text-[#F7F4EC]/45'
                    }`}
                  >
                    <CheckCircle2
                      size={12}
                      className={chk.passed ? 'text-[#C8A15A]' : 'opacity-30'}
                    />
                    <span className="truncate">{chk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stage Description & Attribution */}
      <div className="relative z-10 pt-4 border-t border-[#F7F4EC]/12 flex items-center justify-between gap-4 text-xs">
        <div className="font-mono text-[#F7F4EC]/75 truncate">
          {STAGES[activeStageIdx]?.num}. {STAGES[activeStageIdx]?.desc}
        </div>
        <span className="font-mono text-[11px] text-[#C8A15A] shrink-0">
          {isFlipped ? '180° CRYPTO VIEW' : '0° IDENTITY VIEW'}
        </span>
      </div>
    </div>
  );
}
