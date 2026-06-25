/**
 * Tiny className combiner — joins truthy class strings.
 * Kept dependency-free for now; swap for clsx/tailwind-merge if needed.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/** Format a number as USD currency. */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/** Format minutes as "1h 25m" / "45m". */
export function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Format an ISO date string as e.g. "Jun 25, 2026". */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format an ISO date string with time, e.g. "Jun 25, 2026 · 9:00 AM". */
export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)} · ${d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

/** Format an ISO month string ("2026-06-01") as "June 2026". */
export function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
