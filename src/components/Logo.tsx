import logoUrl from '@/assets/logo.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Pixel size of the circular badge. */
  size?: number;
  className?: string;
}

// Circular brand badge. The source PNG has a blurred background around
// the embroidered circle; object-cover + rounded-full frames the circle
// for now. Swap in a pre-cropped asset later (tracked as a follow-up).
export function Logo({ size = 96, className }: LogoProps) {
  return (
    <img
      src={logoUrl}
      width={size}
      height={size}
      alt="Lucy in Stitches"
      className={cn(
        'rounded-full object-cover shadow-warm ring-1 ring-cream-dark/40',
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
