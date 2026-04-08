import { useState, useRef, FormEvent, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Image as ImageIcon, Star, Trash2, X, Plus } from 'lucide-react';
import { ProductStatus, ProductVariant } from '../../types';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { uploadImage } from '../../utils/upload';
import { VariantEditor } from './VariantEditor';

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  status: ProductStatus;
  images: string[];
  highlights: string;
  collection: string;
  variants: ProductVariant[];
  detailsTitle?: string;
  shippingTitle?: string;
  shippingContent?: string;
  careTitle?: string;
  careContent?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  formData: ProductFormData;
  setFormData: Dispatch<SetStateAction<ProductFormData>>;
  onSubmit: (e: FormEvent) => void | Promise<void>;
  onUpgradeRequired?: () => void;
  currencySymbol: string;
  existingCollections?: string[];
}

export function ProductModal({
  isOpen, isEditMode, onClose, formData, setFormData,
  onSubmit, onUpgradeRequired, currencySymbol, existingCollections = [],
}: ProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const collectionInputRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredCollections = existingCollections.filter(
    (c) => c.toLowerCase().includes(formData.collection.toLowerCase()) && c !== formData.collection
  );

  const handleSubmit = async (e: FormEvent) => {
    try {
      setSubmitError('');
      await onSubmit(e);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message === 'LIMIT_REACHED') { onUpgradeRequired?.(); return; }
      setSubmitError('Unable to save product right now. Please try again.');
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f): f is File => f instanceof File);
    if (!files.length) return;
    setSubmitError('');
    setIsUploadingImages(true);
    try {
      const next = await Promise.all(files.map((f) => uploadImage(f, 'products')));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...next] }));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to upload images right now.');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const makeCover = (i: number) => setFormData((prev) => {
    const imgs = [...prev.images];
    const [sel] = imgs.splice(i, 1);
    return { ...prev, images: [sel, ...imgs] };
  });

  const removeImage = (i: number) =>
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
      <div
        className="bg-white w-full sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxWidth: '900px', maxHeight: '92dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEditMode ? 'Update product details below.' : 'Fill in the details to list your product.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body — two columns on desktop */}
        <form id="product-form" onSubmit={handleSubmit} className="flex flex-col lg:flex-row flex-1 min-h-0">

          {/* LEFT — Images */}
          <div className="lg:w-[280px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 p-5 flex flex-col gap-4 overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Product images</p>

            {/* Upload zone */}
            <div
              className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-200 p-5 text-center transition-colors hover:border-gray-300 hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.images[0] && (
                <img src={formData.images[0]} alt="Cover" className="absolute inset-0 h-full w-full object-cover opacity-30 group-hover:opacity-20 transition-opacity" />
              )}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 group-hover:bg-white transition-colors">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs font-medium text-gray-700">
                  {isUploadingImages ? 'Uploading…' : 'Click to upload'}
                </p>
                <p className="text-[11px] text-gray-400">JPG, PNG, GIF · Multiple allowed</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
            </div>

            {/* Gallery grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {formData.images.map((img, i) => (
                  <div key={`${img}-${i}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img src={img} alt={`Image ${i + 1}`} className="h-24 w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-black/75 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                        <Star className="h-2.5 w-2.5 fill-current" /> Cover
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      {i !== 0 && (
                        <button type="button" onClick={() => makeCover(i)}
                          className="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-gray-800 hover:bg-gray-100">
                          Cover
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(i)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add more tile */}
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Fields */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* Basic info */}
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Basic info</p>
              <Input
                label="Product name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Organic Cotton Tee"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={`Price (${currencySymbol})`}
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <Textarea
                label="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product…"
                maxLength={200}
              />
            </section>

            {/* Organisation */}
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Organisation</p>
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-gray-700">Collection</label>
                <input
                  ref={collectionInputRef}
                  className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={formData.collection}
                  placeholder="e.g. Summer Collection"
                  autoComplete="off"
                  onChange={(e) => { setFormData({ ...formData, collection: e.target.value }); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {showSuggestions && filteredCollections.length > 0 && (
                  <ul className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                    {filteredCollections.map((col) => (
                      <li key={col} onMouseDown={() => { setFormData({ ...formData, collection: col }); setShowSuggestions(false); }}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />{col}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Highlights */}
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Highlights</p>
              <Textarea
                label="Key highlights"
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                placeholder="One highlight per line&#10;e.g. 100% organic cotton&#10;Hand-stitched"
              />
            </section>

            {/* Variants */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Variants</p>
              <VariantEditor
                variants={formData.variants}
                onChange={(variants) => setFormData({ ...formData, variants })}
              />
            </section>

            {/* Product page sections */}
            <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Product page sections</p>
                <p className="mt-1 text-[11px] text-gray-400">Customize accordion labels shown on the product page. Leave content empty to hide.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Details section title" value={formData.detailsTitle ?? ''} onChange={(e) => setFormData({ ...formData, detailsTitle: e.target.value })} placeholder="e.g. Product Details" />
                <Input label="Shipping section title" value={formData.shippingTitle ?? ''} onChange={(e) => setFormData({ ...formData, shippingTitle: e.target.value })} placeholder="e.g. Shipping & Returns" />
              </div>
              <Textarea label="Shipping content" value={formData.shippingContent ?? ''} onChange={(e) => setFormData({ ...formData, shippingContent: e.target.value })} placeholder="One point per line" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Care section title" value={formData.careTitle ?? ''} onChange={(e) => setFormData({ ...formData, careTitle: e.target.value })} placeholder="e.g. Care Instructions" />
              </div>
              <Textarea label="Care content" value={formData.careContent ?? ''} onChange={(e) => setFormData({ ...formData, careContent: e.target.value })} placeholder="One point per line" />
            </section>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          </div>
        </form>

        {/* Sticky footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 shrink-0 bg-white">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImages}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <ImageIcon className="h-4 w-4" />
            {isUploadingImages ? 'Uploading…' : 'Add images'}
          </button>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="product-form" disabled={isUploadingImages}>
              {isEditMode ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
