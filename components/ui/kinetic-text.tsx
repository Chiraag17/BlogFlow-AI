'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type As = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'em';

export type KineticTextProps = React.HTMLAttributes<HTMLElement> & {
  text: string;
  as?: As;
  className?: string;
  style?: React.CSSProperties;
};

export function KineticText({
  text,
  as: Tag = 'h1',
  className = '',
  style,
  ...rest
}: KineticTextProps) {
  const mergedStyle = {
    '--hover-padding': 'calc(1em / 14)',
    '--text-stroke-width': 'calc(1em * 125 / 6000)',
    ...(style as React.CSSProperties | undefined),
  } as React.CSSProperties;

  // Split into words so that natural flex line wraps don't cut words awkwardly
  const words = text.split(' ');

  return (
    <Tag
      {...rest}
      className={cn('inline-flex flex-wrap font-[300] kinetic-text-root', className)}
      style={mergedStyle}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex whitespace-nowrap">
          {word.split('').map((letter, letterIndex) => (
            <span
              key={letterIndex}
              aria-hidden="true"
              className="kinetic-char [will-change:font-weight,-webkit-text-stroke-width,padding] [-webkit-text-stroke-color:transparent] [-webkit-text-stroke-width:var(--text-stroke-width)] [transition:font-weight_0.35s_ease,_-webkit-text-stroke-color_0.35s_ease,_padding_0.35s_ease] hover:[padding-inline:var(--hover-padding)] hover:font-[900] hover:[-webkit-text-stroke-color:currentColor] hover:[-webkit-text-stroke-width:calc(var(--text-stroke-width)*2)] has-[+span+span:hover]:font-[400] has-[+span:hover]:[padding-inline:var(--hover-padding)] has-[+span:hover]:font-[600] [:hover+&]:[padding-inline:var(--hover-padding)] [:hover+&]:font-[600] [:hover+span+&]:font-[400]"
            >
              {letter}
            </span>
          ))}
          {wordIndex < words.length - 1 && (
            <span className="inline-block" aria-hidden="true">
              &nbsp;
            </span>
          )}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </Tag>
  );
}

export default KineticText;
