import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Placeholder content card with the warm, soft brand look.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('lis-card', className)} {...props} />;
}
