import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Centered, padded page wrapper used across customer + admin views.
export function PageContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-5xl px-4 py-8 sm:px-6', className)}
      {...props}
    />
  );
}
