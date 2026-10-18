import React from 'react';
import classNames from 'classnames';

export interface BadgeProps {
  /** Text inside the badge */
  children: React.ReactNode;
  /** Variant defines background color */
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  /** Optional extra class names */
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const base = 'inline-block px-2 py-0.5 rounded-full text-sm font-medium';
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    danger: 'bg-danger-100 text-danger-800',
  }[variant];
  const classes = classNames(base, variantClasses, className);
  return <span className={classes}>{children}</span>;
};
