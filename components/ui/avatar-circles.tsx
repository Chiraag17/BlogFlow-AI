'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarItem {
  imageUrl: string;
  profileUrl?: string;
  name?: string;
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
        const url = typeof item === 'string' ? item : item.imageUrl;
        const profile = typeof item === 'string' ? undefined : item.profileUrl;
        const name = typeof item === 'string' ? `Creator ${index + 1}` : (item.name || `Creator ${index + 1}`);

        const ImageNode = (
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
              {ImageNode}
            </a>
          );
        }

        return (
          <div
            key={index}
            className="relative inline-block transition-transform duration-200 hover:z-30 cursor-pointer"
            aria-label={name}
          >
            {ImageNode}
          </div>
        );
      })}

      {(numPeople !== undefined && numPeople > 0) && (
        <div
          className="flex items-center justify-center rounded-full border-2 border-[var(--lp-bg,#ffffff)] bg-[var(--lp-primary,#244737)] text-center text-xs font-bold text-white shadow-sm transition-all duration-200 hover:scale-110 hover:z-30 dark:border-[var(--lp-bg,#121a15)] dark:bg-[var(--lp-accent,#c8a15a)] dark:text-[#163f32]"
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
