import React from 'react';

export interface CardProps {
  /** Optional extra class names */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => {
  const classes = `stat-card ${className}`.trim();
  return <div className={classes}>{children}</div>;
};
