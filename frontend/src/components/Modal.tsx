import type { ComponentProps } from 'react';

export function ModalOverlay({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-black/50 ${className}`}
      {...props}
    />
  );
}

export function ModalContent({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={`m-4 w-full max-w-[480px] rounded-lg bg-surface p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] ${className}`}
      {...props}
    />
  );
}

export function ModalTitle({ className = '', ...props }: ComponentProps<'h2'>) {
  return <h2 className={`mb-2 text-xl text-foreground ${className}`} {...props} />;
}

export function ModalText({ className = '', ...props }: ComponentProps<'p'>) {
  return <p className={`mb-6 text-base text-muted-foreground ${className}`} {...props} />;
}

export function ModalActions({ className = '', ...props }: ComponentProps<'div'>) {
  return <div className={`flex justify-end gap-2 ${className}`} {...props} />;
}
