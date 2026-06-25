import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { inputClasses } from './Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputClasses, 'min-h-[96px] resize-y', className)}
      {...props}
    />
  );
});
