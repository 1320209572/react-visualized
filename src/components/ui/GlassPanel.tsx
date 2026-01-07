import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'stack' | 'heap';
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            "glass-panel rounded-xl overflow-hidden transition-all duration-300",
            variant === 'stack' && "border-purple-500/20 hover:border-purple-500/40 shadow-purple-900/10",
            variant === 'heap' && "border-cyan-500/20 hover:border-cyan-500/40 shadow-cyan-900/10",
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
