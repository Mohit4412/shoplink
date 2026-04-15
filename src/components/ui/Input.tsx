import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from './Button';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-[13px] font-medium text-[var(--app-text)]">
            {label}
          </label>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-[13px] text-[var(--app-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          style={error ? undefined : { borderColor: 'var(--app-border)' }}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-1 text-[11px] text-[var(--app-text-muted)]">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-[13px] font-medium text-[var(--app-text)]">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[92px] w-full rounded-xl border bg-white px-3 py-2 text-[13px] text-[var(--app-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          style={error ? undefined : { borderColor: 'var(--app-border)' }}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
