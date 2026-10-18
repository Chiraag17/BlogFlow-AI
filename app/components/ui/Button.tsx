import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as Next.js Link when true and href provided */
  asLink?: boolean;
  href?: string;
  /** Additional class names */
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  asLink = false,
  href,
  children,
  className = '',
  ...rest
}) => {
  const base = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const classes = `${base} ${variantClass} ${sizeClass} ${className}`.trim();

  if (asLink && href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};
