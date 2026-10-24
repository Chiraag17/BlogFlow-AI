'use client';

import React, { useEffect, useState } from 'react';

export type TypeBlockFace = 'monogram' | 'loupe' | 'nib' | 'seal' | 'section';

export interface GutenbergTypeBlock3DProps {
  /** Pixel width/height of the 3D cube (default 34) */
  size?: number;
  /** Controlled or initial active face */
  activeFace?: TypeBlockFace;
  /** Optional scroll percentage (0..100) to impart mechanical rotational offset */
  scrollPct?: number;
  /** Optional keystroke / activity pulse counter to trigger subtle mechanical indexing */
  activityPulse?: number;
  /** Whether clicking cycles the 3D block face & triggers a letterpress stamp (default true) */
  interactiveStamp?: boolean;
  /** Optional callback when user clicks/stamps the 3D block */
  onStampFace?: (nextFace: TypeBlockFace) => void;
  /** Optional className for wrapper */
  className?: string;
}

const FACE_ORDER: TypeBlockFace[] = ['monogram', 'loupe', 'nib', 'seal', 'section'];

const FACE_ROTATIONS: Record<TypeBlockFace, { rx: number; ry: number; rz: number; label: string }> = {
  monogram: { rx: -10, ry: -16, rz: 0, label: 'BF · Monogram' },
  loupe: { rx: -8, ry: 78, rz: 0, label: '01 · Research Loupe' },
  nib: { rx: -8, ry: -102, rz: 0, label: '02 · Drafting Nib' },
  seal: { rx: -78, ry: -12, rz: 0, label: '03 · Approval Seal' },
  section: { rx: -10, ry: 166, rz: 0, label: '04 · Section Folio' },
};

export default function GutenbergTypeBlock3D({
  size = 34,
  activeFace = 'monogram',
  scrollPct = 0,
  activityPulse = 0,
  interactiveStamp = true,
  onStampFace,
  className = '',
}: GutenbergTypeBlock3DProps) {
  const [internalFace, setInternalFace] = useState<TypeBlockFace>(activeFace);
  const [hoverAngles, setHoverAngles] = useState<{ rx: number; ry: number; hovering: boolean }>({
    rx: 0,
    ry: 0,
    hovering: false,
  });
  const [stamping, setStamping] = useState(false);
  const [stampRippleKey, setStampRippleKey] = useState(0);
  const [mountTumble, setMountTumble] = useState(true);

  // Sync controlled activeFace prop changes with a brief stamp pulse
  useEffect(() => {
    setInternalFace(activeFace);
  }, [activeFace]);

  // Initial entrance 3D tumble settling onto the front face
  useEffect(() => {
    const timer = setTimeout(() => {
      setMountTumble(false);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Trigger a subtle mechanical press when activityPulse increments
  useEffect(() => {
    if (activityPulse <= 0) return;
    setStamping(true);
    const t = setTimeout(() => setStamping(false), 180);
    return () => clearTimeout(t);
  }, [activityPulse]);

  const half = Math.round(size / 2);
  const base = FACE_ROTATIONS[internalFace] || FACE_ROTATIONS.monogram;

  // Scroll imparts a gentle calibrated vernier rotation along Y/X
  const scrollYaw = (scrollPct % 25) * 0.55;
  const scrollPitch = Math.sin((scrollPct / 100) * Math.PI * 2) * 5;

  // Activity pulse imparts a subtle 12-degree mechanical tick
  const pulseYaw = (activityPulse % 4) * 4;

  const finalRx = mountTumble
    ? 65
    : base.rx + hoverAngles.rx + scrollPitch + (stamping ? 8 : 0);
  const finalRy = mountTumble
    ? -195
    : base.ry + hoverAngles.ry + scrollYaw + pulseYaw;
  const finalRz = mountTumble ? -18 : base.rz;
  const finalTz = stamping ? -6 : hoverAngles.hovering ? 3 : 0;
  const finalScale = stamping ? 0.91 : hoverAngles.hovering ? 1.06 : 1;

  const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setHoverAngles({
      rx: -ny * 38,
      ry: nx * 46,
      hovering: true,
    });
  };

  const handlePointerLeave = () => {
    setHoverAngles({ rx: 0, ry: 0, hovering: false });
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!interactiveStamp) return;
    // If inside a link and user clicks directly on the 3D cube, still allow navigation unless shift/alt or onStampFace is used,
    // while cycling the 3D face and firing the ink-stamp animation
    const currentIdx = FACE_ORDER.indexOf(internalFace);
    const nextFace = FACE_ORDER[(currentIdx + 1) % FACE_ORDER.length];
    setInternalFace(nextFace);
    setStamping(true);
    setStampRippleKey((k) => k + 1);
    onStampFace?.(nextFace);
    setTimeout(() => setStamping(false), 240);
    // Do not call e.preventDefault() so parent <Link> navigation still works seamlessly
    void e;
  };

  const faceCommonStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: `${Math.max(4, Math.round(size * 0.16))}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    userSelect: 'none',
  };

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        perspective: `${size * 9}px`,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      title={`${base.label} — Hover to inspect 3D Gutenberg Type-Block`}
      aria-hidden="true"
    >
      {/* Expanding Brushed-Brass Letterpress Ink Stamp Ripple */}
      {stampRippleKey > 0 && (
        <span
          key={stampRippleKey}
          className="pointer-events-none absolute inset-0 rounded-md border border-[#C8A15A] animate-ping"
          style={{ animationDuration: '480ms', animationIterationCount: 1 }}
        />
      )}

      {/* Ambient Brass Pedestal Shadow */}
      <span
        className="pointer-events-none absolute -bottom-1 inset-x-1 h-1.5 rounded-full transition-all duration-200"
        style={{
          background: 'radial-gradient(closest-side, rgba(200, 161, 90, 0.48), transparent)',
          transform: stamping ? 'scaleX(1.18)' : hoverAngles.hovering ? 'scaleX(0.88)' : 'scaleX(1)',
          opacity: stamping ? 0.95 : 0.6,
        }}
      />

      {/* 6-Faced preserve-3d Movable-Type Brass Block */}
      <span
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `translateZ(${finalTz}px) rotateX(${finalRx.toFixed(1)}deg) rotateY(${finalRy.toFixed(1)}deg) rotateZ(${finalRz.toFixed(1)}deg) scale(${finalScale})`,
          transition: hoverAngles.hovering
            ? 'transform 140ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* 1. FRONT FACE (0deg): Raised 'B' Gutenberg Serif Monogram + Alignment Nick */}
        <span
          style={{
            ...faceCommonStyle,
            transform: `rotateY(0deg) translateZ(${half}px)`,
            background: 'linear-gradient(145deg, #184537 0%, #0E2920 65%, #091B15 100%)',
            border: '1.5px solid #C8A15A',
            boxShadow: 'inset 0 1px 2px rgba(229, 201, 139, 0.45), inset 0 -2px 4px rgba(0,0,0,0.6)',
          }}
        >
          {/* Corner Foundry Studs */}
          <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#C8A15A]/70" />
          <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#C8A15A]/70" />
          {/* Raised Relief Serif 'B' */}
          <span
            style={{
              fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
              fontSize: `${Math.round(size * 0.56)}px`,
              fontWeight: 700,
              lineHeight: 1,
              color: '#F7F4EC',
              textShadow: '0 1px 0 #C8A15A, 0 2px 4px rgba(0,0,0,0.65)',
              letterSpacing: '-0.03em',
            }}
          >
            B
          </span>
          {/* Signature Gutenberg Type Alignment Nick on Bottom Bevel */}
          <span
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full bg-[#C8A15A]"
            style={{ width: `${Math.max(8, Math.round(size * 0.32))}px`, height: '2.5px' }}
          />
        </span>

        {/* 2. RIGHT FACE (+90deg Y): Brushed-Brass Fountain Pen Nib (Drafting) */}
        <span
          style={{
            ...faceCommonStyle,
            transform: `rotateY(90deg) translateZ(${half}px)`,
            background: 'linear-gradient(135deg, #D9B772 0%, #C8A15A 52%, #8F6D2E 100%)',
            border: '1.5px solid #F7F4EC',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.45)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            style={{ width: `${Math.round(size * 0.6)}px`, height: `${Math.round(size * 0.6)}px` }}
          >
            <path
              d="M12 3L18 14L15 21H9L6 14L12 3Z"
              stroke="#0E2920"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <line x1="12" y1="3" x2="12" y2="13" stroke="#0E2920" strokeWidth="1.8" />
            <circle cx="12" cy="14" r="2" fill="#0E2920" />
          </svg>
        </span>

        {/* 3. BACK FACE (180deg Y): Editorial Section Mark '§' (Content Architecture) */}
        <span
          style={{
            ...faceCommonStyle,
            transform: `rotateY(180deg) translateZ(${half}px)`,
            background: 'linear-gradient(145deg, #123328 0%, #0A1D16 100%)',
            border: '1.5px solid #C8A15A',
          }}
        >
          <span
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: `${Math.round(size * 0.56)}px`,
              fontWeight: 700,
              lineHeight: 1,
              color: '#C8A15A',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            §
          </span>
        </span>

        {/* 4. LEFT FACE (-90deg Y): Calibrated Optical Loupe (Research & Citations) */}
        <span
          style={{
            ...faceCommonStyle,
            transform: `rotateY(-90deg) translateZ(${half}px)`,
            background: 'linear-gradient(135deg, #163F32 0%, #0D261E 100%)',
            border: '1.5px solid #C8A15A',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            style={{ width: `${Math.round(size * 0.58)}px`, height: `${Math.round(size * 0.58)}px` }}
          >
            <circle cx="10.5" cy="10.5" r="6.5" stroke="#C8A15A" strokeWidth="2.2" />
            <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" stroke="#F7F4EC" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="10.5" cy="10.5" r="2" fill="#F7F4EC" />
          </svg>
        </span>

        {/* 5. TOP FACE (+90deg X): Fluted Brass Approval Seal (Editorial Gate & Security) */}
        <span
          style={{
            ...faceCommonStyle,
            transform: `rotateX(90deg) translateZ(${half}px)`,
            background: 'radial-gradient(circle at 50% 50%, #E5C98B 0%, #C8A15A 65%, #8A6829 100%)',
            border: '1.5px solid #163F32',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            style={{ width: `${Math.round(size * 0.62)}px`, height: `${Math.round(size * 0.62)}px` }}
          >
            <circle cx="12" cy="12" r="8" stroke="#0E2920" strokeWidth="1.8" strokeDasharray="3 2" />
            <path d="M8.5 12.5L11 15L15.8 9.5" stroke="#0E2920" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        {/* 6. BOTTOM FACE (-90deg X): Cast Foundry Base Plate */}
        <span
          style={{
            ...faceCommonStyle,
            transform: `rotateX(-90deg) translateZ(${half}px)`,
            background: '#091510',
            border: '1.5px solid rgba(200, 161, 90, 0.55)',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: `${Math.max(7, Math.round(size * 0.24))}px`,
              fontWeight: 700,
              color: '#C8A15A',
              letterSpacing: '0.06em',
            }}
          >
            1450
          </span>
        </span>
      </span>
    </span>
  );
}
