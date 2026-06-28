import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Select } from '@/components/form/Select';
import { Textarea } from '@/components/form/Textarea';
import { ImageUploadField } from './ImageUploadField';
import { uploadInspiration } from './upload-inspiration';
import { PRODUCTS } from '@/lib/products';
import { useCartStore, type CartItem } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';
import type { ProductType } from '@/types';

// Edit one cart item in place (product, request, notes, image).
export function CartItemEditModal({
  item,
  onClose,
}: {
  item: CartItem | null;
  onClose: () => void;
}) {
  const update = useCartStore((s) => s.update);
  const push = useToastStore((s) => s.push);

  const [productType, setProductType] = useState<ProductType>(
    item?.productType ?? 'shirt'
  );
  const [embroideryRequest, setEmbroideryRequest] = useState(
    item?.embroideryRequest ?? ''
  );
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [keepImage, setKeepImage] = useState(true);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!item) return null;

  const save = async () => {
    if (!embroideryRequest.trim()) return;
    setBusy(true);
    try {
      let path = keepImage ? item.inspirationImagePath : null;
      let name = keepImage ? item.inspirationImageName : null;
      if (newFile) {
        path = await uploadInspiration(newFile);
        name = newFile.name;
      }
      update(item.id, {
        productType,
        embroideryRequest: embroideryRequest.trim(),
        notes: notes.trim(),
        inspirationImagePath: path,
        inspirationImageName: name,
      });
      push('Item updated', 'success');
      onClose();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const hasExistingImage = keepImage && item.inspirationImageName && !newFile;

  return (
    <Modal
      open={!!item}
      title="Edit item"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!embroideryRequest.trim() || busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Product">
          <Select
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
          >
            {PRODUCTS.map((p) => (
              <option key={p.type} value={p.type}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Embroidery request" required>
          <Textarea
            value={embroideryRequest}
            onChange={(e) => setEmbroideryRequest(e.target.value)}
          />
        </Field>
        <Field label="Notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <Field label="Inspiration image">
          {hasExistingImage ? (
            <div className="flex items-center justify-between rounded-xl border border-cream-dark bg-white/70 p-3">
              <span className="truncate font-sans text-sm text-charcoal">
                {item.inspirationImageName}
              </span>
              <button
                type="button"
                onClick={() => setKeepImage(false)}
                className="font-sans text-xs text-mauve-dark hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <ImageUploadField
              file={newFile}
              onChange={(f) => {
                setNewFile(f);
                if (f) setKeepImage(false);
              }}
            />
          )}
        </Field>
      </div>
    </Modal>
  );
}
