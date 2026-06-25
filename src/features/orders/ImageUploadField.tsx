import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface ImageUploadFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

// Client-side validated inspiration-image picker with preview.
// Enforces type + size limits before any upload (Phase 2 wires Storage).
export function ImageUploadField({ file, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    setError(null);
    const f = files?.[0];
    if (!f) return;

    if (!ACCEPTED.includes(f.type)) {
      setError('Please choose a JPG, PNG, GIF, or WebP image.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('That image is over 5MB — please choose a smaller file.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    onChange(f);
  };

  const clear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {previewUrl && file ? (
        <div className="flex items-center gap-4 rounded-xl border border-cream-dark bg-white/70 p-3">
          <img
            src={previewUrl}
            alt="Inspiration preview"
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-sm text-charcoal">
              {file.name}
            </p>
            <p className="font-sans text-xs text-charcoal-light">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="font-sans text-xs text-mauve-dark hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-cream-dark bg-white/50 px-4 py-8 text-center transition hover:border-slate-blue hover:bg-white/70'
          )}
        >
          <span className="font-sans text-sm font-medium text-charcoal">
            Add an inspiration image
          </span>
          <span className="font-sans text-xs text-charcoal-light">
            Optional · JPG, PNG, GIF, WebP · up to 5MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="font-sans text-xs text-mauve-dark">{error}</p>}
    </div>
  );
}
