'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarItem {
  imageUrl?: string;
  profileUrl?: string;
  name?: string;
  initials?: string;
  role?: string;
  bgGradient?: string;
  accentColor?: string;
}

export interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: (AvatarItem | string)[];
  avatarSize?: number;
}

export function AvatarCircles({
  numPeople,
  className,
  avatarUrls,
  avatarSize = 38,
}: AvatarCirclesProps) {
  return (
    <div className={cn('z-10 flex items-center -space-x-2.5 rtl:space-x-reverse', className)}>
      {avatarUrls.map((item, index) => {
        const isObj = typeof item !== 'string';
        const url = isObj ? item.imageUrl : item;
        const profile = isObj ? item.profileUrl : undefined;
        const name = isObj ? item.name || `Creator ${index + 1}` : `Creator ${index + 1}`;
        const initials = isObj ? item.initials : undefined;
        const bgGradient = isObj
          ? item.bgGradient || 'linear-gradient(135deg, #163F32 0%, #0D261E 100%)'
          : undefined;
        const accentColor = isObj ? item.accentColor || '#E5C98B' : '#E5C98B';

        const BadgeNode = initials ? (
          <div
            key={index}
            style={{
              width: avatarSize,
              height: avatarSize,
              background: bgGradient,
              boxShadow:
                '0 4px 12px rgba(10, 18, 14, 0.25), inset 0 0 0 1px rgba(229, 201, 139, 0.42)',
            }}
            className="group/avatar relative flex items-center justify-center rounded-full border-2 border-[var(--lp-bg,#F7F4EC)] transition-all duration-200 hover:scale-115 hover:z-30 dark:border-[var(--lp-bg,#101714)] select-none"
            title={name}
            aria-label={name}
          >
            {/* Subtle inner engraved brass ring */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[2px] rounded-full border border-[#E5C98B]/30"
            />
            <span
              style={{ color: accentColor }}
              className="font-serif text-[11px] font-semibold tracking-wider leading-none"
            >
              {initials}
            </span>
            {/* Verified creator micro-dot */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[var(--lp-bg,#F7F4EC)] bg-[#C8A15A] dark:border-[var(--lp-bg,#101714)]"
            />
          </div>
        ) : (
          <img
            key={index}
            referrerPolicy="no-referrer"
            className="rounded-full border-2 border-[var(--lp-bg,#ffffff)] bg-[var(--lp-surface,#f8fafc)] object-cover shadow-sm transition-all duration-200 hover:scale-115 hover:z-30 hover:shadow-lg dark:border-[var(--lp-bg,#121a15)]"
            src={url}
            width={avatarSize}
            height={avatarSize}
            style={{ width: avatarSize, height: avatarSize }}
            alt={name}
            title={name}
          />
        );

        if (profile && profile !== '#') {
          return (
            <a
              key={index}
              href={profile}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-block transition-transform duration-200 hover:z-30"
              aria-label={name}
            >
              {BadgeNode}
            </a>
          );
        }

        return (
          <div
            key={index}
            className="relative inline-block transition-transform duration-200 hover:z-30 cursor-pointer"
            aria-label={name}
          >
            {BadgeNode}
          </div>
        );
      })}

      {(numPeople !== undefined && numPeople > 0) && (
        <div
          className="flex items-center justify-center rounded-full border-2 border-[var(--lp-bg,#ffffff)] bg-[var(--lp-primary,#244737)] text-center font-mono text-[10px] font-bold tracking-tight text-white shadow-sm transition-all duration-200 hover:scale-110 hover:z-30 dark:border-[var(--lp-bg,#121a15)] dark:bg-[var(--lp-accent,#c8a15a)] dark:text-[#163f32]"
          style={{ width: avatarSize, height: avatarSize }}
          title={`${numPeople.toLocaleString()}+ creators`}
        >
          +{numPeople >= 1000 ? `${(numPeople / 1000).toFixed(1).replace('.0', '')}k` : numPeople}
        </div>
      )}
    </div>
  );
}

export default AvatarCircles;
