import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand- disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-zinc-950 text-white hover:bg-zinc-800': variant === 'primary',
            'bg-[var(--app-panel-muted)] text-[var(--app-text)] hover:bg-[#ece9e4]': variant === 'secondary',
            'border bg-[var(--app-panel)] hover:bg-[var(--app-panel-muted)] text-[var(--app-text-muted)]': variant === 'outline',
            'hover:bg-[var(--app-panel-muted)] text-[var(--app-text-muted)]': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-4 py-2': size === 'md',
            'h-12 px-8 text-lg': size === 'lg',
          },
          className
        )}
        style={variant === 'outline' ? { borderColor: 'var(--app-border)' } : undefined}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
