import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Input } from '@/components/form/Input';
import { Textarea } from '@/components/form/Textarea';
import { ConfirmModal } from '@/components/Modal';
import { ImageUploadField } from '@/features/orders/ImageUploadField';
import {
  useAddFeaturedWork,
  useDeleteFeaturedWork,
  useFeaturedWorks,
  type FeaturedWork,
} from '@/features/featured/use-featured';
import { useToastStore } from '@/store/toast-store';

export function AdminFeaturedPage() {
  const { data: works, isLoading } = useFeaturedWorks();
  const addWork = useAddFeaturedWork();
  const deleteWork = useDeleteFeaturedWork();
  const push = useToastStore((s) => s.push);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [toDelete, setToDelete] = useState<FeaturedWork | null>(null);

  const canAdd = !!file && title.trim().length > 0 && !addWork.isPending;

  const handleAdd = () => {
    if (!file || !title.trim()) return;
    addWork.mutate(
      { file, title, description },
      {
        onSuccess: () => {
          setFile(null);
          setTitle('');
          setDescription('');
          push('Photo added to the gallery', 'success');
        },
        onError: (err) =>
          push(err instanceof Error ? err.message : 'Upload failed', 'error'),
      }
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteWork.mutate(
      { id: toDelete.id, imagePath: toDelete.imagePath },
      {
        onSuccess: () => push('Photo removed', 'success'),
        onError: (err) =>
          push(err instanceof Error ? err.message : 'Delete failed', 'error'),
      }
    );
    setToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl">Featured Gallery</h1>
        <p className="font-body text-charcoal-light">
          Photos shown on the public Inspiration page.
        </p>
      </div>

      {/* Upload form */}
      <Card className="max-w-xl">
        <h2 className="mb-4 font-display text-xl">Add a Photo</h2>
        <div className="flex flex-col gap-4">
          <Field label="Photo" required>
            <ImageUploadField file={file} onChange={setFile} />
          </Field>
          <Field label="Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wildflower denim jacket"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short caption for this piece…"
            />
          </Field>
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={!canAdd}>
              {addWork.isPending ? 'Uploading…' : 'Add to Gallery'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Existing works */}
      <div>
        <h2 className="mb-4 font-display text-xl">
          Current Photos {works ? `(${works.length})` : ''}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-white/40"
              />
            ))}
          </div>
        ) : works && works.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {works.map((w) => (
              <div
                key={w.id}
                className="overflow-hidden rounded-xl bg-white/70 shadow-warm"
              >
                <div className="aspect-square overflow-hidden bg-cream-dark">
                  <img
                    src={w.imageUrl}
                    alt={w.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate font-sans text-sm font-medium text-charcoal">
                    {w.title}
                  </p>
                  <button
                    onClick={() => setToDelete(w)}
                    className="mt-1 font-sans text-xs text-mauve-dark hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <p className="font-body text-charcoal-light">
              No photos yet — add your first above.
            </p>
          </Card>
        )}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Remove photo?"
        message={`“${toDelete?.title}” will be removed from the public gallery. This can’t be undone.`}
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
