/**
 * Themed Card Component
 * Consistent card styling across the application
 */

import React from 'react';
import { cn } from '@/lib/theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = cn(
    'bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20',
    hover && 'hover:border-[#1F77FF]/40 hover:shadow-lg hover:shadow-[#1F77FF]/20 transition-all duration-200 cursor-pointer',
    paddingClasses[padding],
    className
  );

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
}
