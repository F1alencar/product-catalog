import type { ComponentProps } from 'react';

export function Card({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={`rounded-md border border-border bg-surface p-6 ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div className={`mb-4 flex items-center justify-between ${className}`} {...props} />
  );
}

export function CardTitle({ className = '', ...props }: ComponentProps<'h1'>) {
  return <h1 className={`text-2xl text-foreground ${className}`} {...props} />;
}
