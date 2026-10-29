import type { ComponentProps } from 'react';

const variants = {
  primary: 'border-transparent bg-primary text-white hover:bg-primary-hover',
  danger: 'border-transparent bg-danger text-white hover:bg-danger-hover',
  ghost: 'border-border bg-transparent text-foreground hover:bg-background',
} as const;

interface ButtonProps extends ComponentProps<'button'> {
  $variant?: keyof typeof variants;
}

export function Button({ $variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[$variant]} ${className}`}
      {...props}
    />
  );
}
