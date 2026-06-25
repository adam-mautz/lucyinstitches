import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

// Label + hint/error wrapper for a single form control.
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-sans text-sm font-medium text-charcoal"
      >
        {label}
        {required && <span className="ml-0.5 text-mauve-dark">*</span>}
      </label>
      {children}
      {error ? (
        <p className="font-sans text-xs text-mauve-dark">{error}</p>
      ) : hint ? (
        <p className="font-sans text-xs text-charcoal-light">{hint}</p>
      ) : null}
    </div>
  );
}
