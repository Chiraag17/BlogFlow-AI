// components/auth/ArchivalLedgerInput.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sparkles,
  Lock,
  ShieldCheck,
} from 'lucide-react';

const EDITORIAL_DOMAINS = [
  '@gmail.com',
  '@publication.com',
  '@substack.com',
  '@editorial.io',
];

export interface ArchivalLedgerInputProps {
  id: string;
  label: string;
  folioCode: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  statusHint?: string;
  enableDomainChips?: boolean;
  isPassword?: boolean;
  showStrengthTumbler?: boolean;
  compactStrengthTumbler?: boolean;
  matchComparisonValue?: string;
}

export default function ArchivalLedgerInput({
  id,
  label,
  folioCode,
  type = 'text',
  value,
  onChange,
  onValueChange,
  onFocus,
  onBlur,
  placeholder,
  autoComplete,
  disabled = false,
  required = false,
  error,
  icon,
  statusHint,
  enableDomainChips = false,
  isPassword = false,
  showStrengthTumbler = false,
  compactStrengthTumbler = false,
  matchComparisonValue,
}: ArchivalLedgerInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stampTrigger, setStampTrigger] = useState(0);
  const prevLenRef = useRef(value.length);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger micro-press ink-stamp physics on keystroke changes
  useEffect(() => {
    if (value.length !== prevLenRef.current) {
      prevLenRef.current = value.length;
      setStampTrigger((prev) => prev + 1);
    }
  }, [value]);

  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Validation & progress calculation for the bottom Brass Ink-Gauge
  const isEmailValid =
    type === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  const isNameValid = type === 'text' && value.trim().length >= 2;

  // Password cryptographic tumbler checks
  const pwdChecks = [
    { key: 'len', label: '8+ CHARS', met: value.length >= 8 },
    {
      key: 'case',
      label: 'MIXED CASE',
      met: /[a-z]/.test(value) && /[A-Z]/.test(value),
    },
    { key: 'num', label: 'NUMERAL', met: /\d/.test(value) },
    {
      key: 'sym',
      label: 'SYMBOL / 12+',
      met: /[^A-Za-z0-9]/.test(value) || value.length >= 12,
    },
  ];
  const pwdScore = pwdChecks.filter((c) => c.met).length;

  // Confirm password match state
  const hasMatchComparison = matchComparisonValue !== undefined;
  const isConfirmMatching =
    hasMatchComparison &&
    value.length > 0 &&
    value === matchComparisonValue;
  const isConfirmPrefixMatching =
    hasMatchComparison &&
    value.length > 0 &&
    matchComparisonValue.startsWith(value);

  const isFieldValid =
    !error &&
    ((type === 'email' && isEmailValid) ||
      (type === 'text' && isNameValid) ||
      (isPassword && !hasMatchComparison && value.length >= 8) ||
      (isPassword && hasMatchComparison && isConfirmMatching));

  // Calculate bottom ink-gauge fill percentage (0 to 100)
  let gaugePercent = 0;
  if (value.length > 0) {
    if (type === 'email') {
      if (isEmailValid) gaugePercent = 100;
      else if (value.includes('@')) gaugePercent = 68;
      else gaugePercent = Math.min(48, value.length * 6);
    } else if (isPassword && hasMatchComparison) {
      if (isConfirmMatching) gaugePercent = 100;
      else if (matchComparisonValue && matchComparisonValue.length > 0) {
        gaugePercent = Math.min(
          90,
          Math.round((value.length / matchComparisonValue.length) * 85)
        );
      } else {
        gaugePercent = Math.min(60, value.length * 8);
      }
    } else if (isPassword) {
      gaugePercent = Math.min(100, Math.max(value.length * 10, pwdScore * 25));
    } else {
      gaugePercent = isNameValid
        ? Math.min(100, 45 + value.trim().length * 5)
        : Math.min(35, value.length * 15);
    }
  }

  // Domain chip helper for email inputs
  const handleSelectDomain = (domain: string) => {
    if (disabled) return;
    const trimmed = value.trim();
    const atIndex = trimmed.indexOf('@');
    const localPart =
      atIndex !== -1 ? trimmed.slice(0, atIndex) : trimmed || 'editor';
    const nextEmail = `${localPart}${domain}`;

    if (onValueChange) {
      onValueChange(nextEmail);
    } else {
      const syntheticEvent = {
        target: { value: nextEmail },
        currentTarget: { value: nextEmail },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    inputRef.current?.focus();
  };

  // Determine whether domain chips should be visible
  const showDomainRow =
    enableDomainChips &&
    !disabled &&
    (isFocused || (value.length > 0 && !isEmailValid));

  // Determine cipher grade label
  const cipherGradeLabel =
    value.length === 0
      ? 'UNSEALED'
      : pwdScore <= 1
      ? 'DRAFT CIPHER'
      : pwdScore === 2
      ? 'STANDARD SEAL'
      : pwdScore === 3
      ? 'PRESS GRADE'
      : 'VAULT LOCKED';

  return (
    <div className="group relative">
      {/* ============================================================
          ARCHIVAL LEDGER HEADER: FOLIO INDEX + LABEL + TELEMETRY
          ============================================================ */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label
          htmlFor={id}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#18211D] dark:text-[#F3F0E8] cursor-pointer select-none"
        >
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase transition-colors ${
              error
                ? 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
                : isFocused
                ? 'bg-[#C8A15A]/20 text-[#9A732E] dark:text-[#D4AF67] border border-[#C8A15A]/40'
                : isFieldValid
                ? 'bg-[#163F32]/12 dark:bg-[#B8D5C5]/15 text-[#163F32] dark:text-[#B8D5C5] border border-[#163F32]/25 dark:border-[#B8D5C5]/30'
                : 'bg-[#163F32]/6 dark:bg-[#F3F0E8]/8 text-[#68736D] dark:text-[#8E9E95] border border-[#163F32]/10 dark:border-[#F3F0E8]/10'
            }`}
          >
            {folioCode}
          </span>
          <span>{label}</span>
        </label>

        {/* Right Telemetry / Status Readout */}
        <div className="flex items-center gap-2">
          {statusHint && (
            <span
              className={`text-[10px] font-mono tracking-tight transition-colors ${
                isFocused
                  ? 'text-[#C8A15A] dark:text-[#D4AF67] font-semibold'
                  : 'text-[#68736D] dark:text-[#8E9E95]'
              }`}
            >
              {statusHint}
            </span>
          )}

          {/* Contextual Verified / Match / Glyph Counter Badge */}
          {error ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-red-600 dark:text-red-400">
              <AlertCircle size={11} />
              FAULT
            </span>
          ) : isFieldValid ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[#163F32] dark:text-[#B8D5C5]">
              <Check size={11} className="stroke-[2.5]" />
              {hasMatchComparison
                ? 'MATCHED'
                : type === 'email'
                ? 'VERIFIED'
                : isPassword
                ? 'SEALED'
                : 'ENGRAVED'}
            </span>
          ) : (
            <span
              className="text-[10px] font-mono text-[#68736D]/75 dark:text-[#8E9E95]/75"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {String(value.length).padStart(2, '0')} GL
            </span>
          )}
        </div>
      </div>

      {/* ============================================================
          RECESSED ARCHIVAL WELL + 3D BRASS CALIPER CORNERS
          ============================================================ */}
      <motion.div
        key={stampTrigger}
        initial={stampTrigger > 0 ? { scale: 0.996, y: 0.8 } : false}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 700, damping: 28 }}
        className={`relative rounded-lg transition-all duration-200 ${
          error
            ? 'bg-[#FDF6F5] dark:bg-[#221616] border border-red-500/60 dark:border-red-500/50 shadow-[inset_0_1px_3px_rgba(185,28,28,0.08)]'
            : isFocused
            ? 'bg-white dark:bg-[#18241F] border border-[#C8A15A] dark:border-[#D4AF67] shadow-[0_6px_20px_-6px_rgba(200,161,90,0.22),inset_0_1px_2px_rgba(22,63,50,0.05)]'
            : isFieldValid
            ? 'bg-white/95 dark:bg-[#16211C] border border-[#163F32]/35 dark:border-[#B8D5C5]/35 shadow-[inset_0_1px_2px_rgba(22,63,50,0.04)]'
            : 'bg-[#FAF8F2] dark:bg-[#141D19] border border-[#163F32]/16 dark:border-[#F3F0E8]/14 shadow-[inset_0_1px_3px_rgba(24,33,29,0.05)] hover:border-[#163F32]/30 dark:hover:border-[#F3F0E8]/25'
        }`}
      >
        {/* 4 Corner Brass Registration Marks (┌ ┐ └ ┘) */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 rounded-tl-[5px] transition-all duration-200 ${
            error
              ? 'border-red-500 opacity-100'
              : isFocused
              ? 'border-[#C8A15A] dark:border-[#D4AF67] opacity-100 scale-105'
              : isFieldValid
              ? 'border-[#163F32] dark:border-[#B8D5C5] opacity-80'
              : 'border-[#C8A15A]/40 opacity-0 group-hover:opacity-60'
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 rounded-tr-[5px] transition-all duration-200 ${
            error
              ? 'border-red-500 opacity-100'
              : isFocused
              ? 'border-[#C8A15A] dark:border-[#D4AF67] opacity-100 scale-105'
              : isFieldValid
              ? 'border-[#163F32] dark:border-[#B8D5C5] opacity-80'
              : 'border-[#C8A15A]/40 opacity-0 group-hover:opacity-60'
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 rounded-bl-[5px] transition-all duration-200 ${
            error
              ? 'border-red-500 opacity-100'
              : isFocused
              ? 'border-[#C8A15A] dark:border-[#D4AF67] opacity-100 scale-105'
              : isFieldValid
              ? 'border-[#163F32] dark:border-[#B8D5C5] opacity-80'
              : 'border-[#C8A15A]/40 opacity-0 group-hover:opacity-60'
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 rounded-br-[5px] transition-all duration-200 ${
            error
              ? 'border-red-500 opacity-100'
              : isFocused
              ? 'border-[#C8A15A] dark:border-[#D4AF67] opacity-100 scale-105'
              : isFieldValid
              ? 'border-[#163F32] dark:border-[#B8D5C5] opacity-80'
              : 'border-[#C8A15A]/40 opacity-0 group-hover:opacity-60'
          }`}
        />

        {/* Subtle Inner Ledger Rule Line */}
        <div className="relative flex items-center">
          {/* Left Nib / Caliper Icon Slot */}
          {icon && (
            <div
              className={`pl-3.5 pr-2.5 flex items-center justify-center transition-colors select-none ${
                error
                  ? 'text-red-600 dark:text-red-400'
                  : isFocused
                  ? 'text-[#C8A15A] dark:text-[#D4AF67]'
                  : isFieldValid
                  ? 'text-[#163F32] dark:text-[#B8D5C5]'
                  : 'text-[#68736D]/75 dark:text-[#8E9E95]/75'
              }`}
            >
              {icon}
            </div>
          )}

          {/* Input Element */}
          <input
            ref={inputRef}
            id={id}
            type={resolvedType}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            required={required}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            onChange={onChange}
            className={`w-full py-2.5 ${
              icon ? 'pl-1' : 'pl-3.5'
            } ${
              isPassword ? 'pr-24' : 'pr-3.5'
            } bg-transparent text-sm text-[#18211D] dark:text-[#F3F0E8] placeholder:text-[#68736D]/55 dark:placeholder:text-[#8E9E95]/50 focus:outline-none disabled:opacity-60 ${
              isPassword && !showPassword && value.length > 0
                ? 'tracking-[0.18em] font-mono'
                : ''
            }`}
          />

          {/* Mechanical Brass Show/Hide Switch for Password Fields */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              className={`absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-medium tracking-wider uppercase transition-all cursor-pointer select-none ${
                showPassword
                  ? 'bg-[#C8A15A]/20 text-[#8F6824] dark:text-[#D4AF67] border border-[#C8A15A]/45'
                  : 'bg-[#163F32]/6 dark:bg-[#F3F0E8]/8 text-[#68736D] dark:text-[#8E9E95] border border-[#163F32]/12 dark:border-[#F3F0E8]/12 hover:text-[#18211D] dark:hover:text-[#F3F0E8] hover:border-[#C8A15A]/40'
              }`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{showPassword ? 'OPEN' : 'SEAL'}</span>
            </button>
          )}
        </div>

        {/* Bottom Brass Ink-Gauge Progress Line */}
        <div className="relative h-[2px] w-full bg-[#163F32]/8 dark:bg-[#F3F0E8]/8 overflow-hidden rounded-b-lg">
          <motion.div
            initial={false}
            animate={{ width: `${gaugePercent}%` }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`h-full transition-colors duration-300 ${
              error
                ? 'bg-red-500'
                : isFieldValid
                ? 'bg-gradient-to-r from-[#C8A15A] via-[#163F32] to-[#23634E] dark:from-[#D4AF67] dark:via-[#88B8A1] dark:to-[#B8D5C5]'
                : 'bg-gradient-to-r from-[#C8A15A] to-[#DFB970]'
            }`}
          />
        </div>
      </motion.div>

      {/* ============================================================
          QUICK-FILL EDITORIAL DOMAIN CHIPS (FOR EMAIL FIELDS)
          ============================================================ */}
      <AnimatePresence initial={false}>
        {showDomainRow && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pt-2 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#68736D] dark:text-[#8E9E95] mr-0.5">
                <Sparkles size={10} className="text-[#C8A15A] dark:text-[#D4AF67]" />
                Quick Press:
              </span>
              {EDITORIAL_DOMAINS.map((domain) => {
                const isSelected = value.toLowerCase().endsWith(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onMouseDown={(e) => {
                      // Prevent input blur before click registers
                      e.preventDefault();
                      handleSelectDomain(domain);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#163F32] text-[#F7F4EC] dark:bg-[#B8D5C5] dark:text-[#102019] font-semibold'
                        : 'bg-[#163F32]/6 dark:bg-[#F3F0E8]/8 text-[#18211D]/80 dark:text-[#F3F0E8]/80 border border-[#163F32]/12 dark:border-[#F3F0E8]/12 hover:border-[#C8A15A] dark:hover:border-[#D4AF67] hover:text-[#163F32] dark:hover:text-[#D4AF67]'
                    }`}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          TACTILE PASSWORD SECURITY TUMBLER BAR
          ============================================================ */}
      {isPassword && showStrengthTumbler && (
        <div className="mt-2 pt-1.5 px-2.5 py-2 rounded-md bg-[#163F32]/[0.04] dark:bg-[#F3F0E8]/[0.03] border border-[#163F32]/10 dark:border-[#F3F0E8]/10">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="inline-flex items-center gap-1 text-[#68736D] dark:text-[#8E9E95] uppercase tracking-wider">
              <Lock size={10} className="text-[#C8A15A] dark:text-[#D4AF67]" />
              Cipher Tumbler
            </span>
            <span
              className={`font-semibold tracking-wider ${
                pwdScore >= 4
                  ? 'text-[#163F32] dark:text-[#B8D5C5]'
                  : pwdScore >= 2
                  ? 'text-[#A67B32] dark:text-[#D4AF67]'
                  : 'text-[#68736D] dark:text-[#8E9E95]'
              }`}
            >
              {cipherGradeLabel} ({pwdScore}/4)
            </span>
          </div>

          {/* 4-Segment Brass/Emerald Tumbler Pins */}
          <div className="grid grid-cols-4 gap-1.5">
            {pwdChecks.map((check, idx) => (
              <div key={check.key} className="flex flex-col gap-1">
                <div className="h-1.5 rounded-full bg-[#163F32]/12 dark:bg-[#F3F0E8]/12 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: check.met ? '100%' : '0%' }}
                    transition={{ duration: 0.22 }}
                    className={`h-full ${
                      pwdScore === 4
                        ? 'bg-[#163F32] dark:bg-[#B8D5C5]'
                        : idx < 2
                        ? 'bg-[#C8A15A] dark:bg-[#D4AF67]'
                        : 'bg-[#163F32] dark:bg-[#88B8A1]'
                    }`}
                  />
                </div>
                {!compactStrengthTumbler && (
                  <span
                    className={`text-[9px] font-mono tracking-tight truncate transition-colors ${
                      check.met
                        ? 'text-[#18211D] dark:text-[#F3F0E8] font-semibold'
                        : 'text-[#68736D]/65 dark:text-[#8E9E95]/60'
                    }`}
                  >
                    {check.met ? '● ' : '○ '}
                    {check.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          CONFIRM PASSWORD DUAL-SEAL SYNCHRONIZATION READOUT
          ============================================================ */}
      {isPassword && hasMatchComparison && value.length > 0 && (
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono px-1">
          <span className="inline-flex items-center gap-1 text-[#68736D] dark:text-[#8E9E95]">
            <ShieldCheck
              size={11}
              className={
                isConfirmMatching
                  ? 'text-[#163F32] dark:text-[#B8D5C5]'
                  : isConfirmPrefixMatching
                  ? 'text-[#C8A15A] dark:text-[#D4AF67]'
                  : 'text-red-500'
              }
            />
            {isConfirmMatching
              ? 'Dual cryptographic seal synchronized'
              : isConfirmPrefixMatching
              ? 'Aligning tumbler pins with primary cipher…'
              : 'Cipher sequence diverges from primary seal'}
          </span>
          <span
            className={`font-semibold ${
              isConfirmMatching
                ? 'text-[#163F32] dark:text-[#B8D5C5]'
                : isConfirmPrefixMatching
                ? 'text-[#C8A15A] dark:text-[#D4AF67]'
                : 'text-red-500'
            }`}
          >
            {isConfirmMatching ? 'LOCKED' : isConfirmPrefixMatching ? 'SYNCING' : 'MISMATCH'}
          </span>
        </div>
      )}

      {/* ============================================================
          FIELD VALIDATION ERROR MESSAGE
          ============================================================ */}
      {error && (
        <motion.span
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium"
        >
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </motion.span>
      )}
    </div>
  );
}
