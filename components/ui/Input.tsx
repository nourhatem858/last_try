/**
 * Themed Input Component
 * Consistent input styling across the application
 */

import React from 'react';
import { cn } from '@/lib/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  icon,
  fullWidth = true,
  className,
  ...props
}: InputProps) {
  const inputClasses = cn(
    'px-4 py-3 rounded-lg transition-all duration-200',
    'bg-[#0A1420] text-white placeholder-[#999999]',
    'focus:ring-2 focus:border-transparent',
    error
      ? 'border border-red-500/50 focus:ring-red-500'
      : 'border border-[#1F77FF]/30 focus:ring-[#1F77FF]',
    icon ? 'pl-10' : '',
    fullWidth ? 'w-full' : '',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-semibold text-white mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]">
            {icon}
          </div>
        )}
        <input className={inputClasses} {...props} />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
