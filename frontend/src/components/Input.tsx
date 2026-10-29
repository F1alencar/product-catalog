import type { ComponentProps } from 'react';

const fieldBase =
  'w-full rounded-sm border bg-surface p-2 text-base text-foreground focus:outline-none focus:ring-2';

const fieldState = {
  normal: 'border-border focus:border-primary focus:ring-primary/10',
  error: 'border-error focus:border-error focus:ring-error-background',
} as const;

interface FieldProps {
  $hasError?: boolean;
  className?: string;
}

interface InputProps extends ComponentProps<'input'>, FieldProps {}

export function Input({ $hasError, className = '', ...props }: InputProps) {
  return (
    <input
      className={`${fieldBase} ${fieldState[$hasError ? 'error' : 'normal']} disabled:cursor-not-allowed disabled:bg-background ${className}`}
      {...props}
    />
  );
}

interface TextAreaProps extends ComponentProps<'textarea'>, FieldProps {}

export function TextArea({ $hasError, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`${fieldBase} ${fieldState[$hasError ? 'error' : 'normal']} min-h-20 resize-y font-[inherit] ${className}`}
      {...props}
    />
  );
}

export function Label({ className = '', ...props }: ComponentProps<'label'>) {
  return (
    <label
      className={`mb-1 block text-sm font-semibold text-foreground ${className}`}
      {...props}
    />
  );
}

export function FieldError({ className = '', ...props }: ComponentProps<'span'>) {
  return <span className={`mt-1 block text-sm text-error ${className}`} {...props} />;
}

export function FormGroup({ className = '', ...props }: ComponentProps<'div'>) {
  return <div className={`mb-4 ${className}`} {...props} />;
}
