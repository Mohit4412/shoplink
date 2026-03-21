import React, { useRef } from 'react';
import { Image as ImageIcon, Star, Trash2, Upload } from 'lucide-react';
import { ProductStatus } from '../../types';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { uploadImage } from '../../utils/upload';

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  status: ProductStatus;
  images: string[];
  highlights: string;
  collection: string;
}

interface ProductModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  onUpgradeRequired?: () => void;
  currencySymbol: string;
}

export function ProductModal({ isOpen, isEditMode, onClose, formData, setFormData, onSubmit, onUpgradeRequired, currencySymbol }: ProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = React.useState('');
  const [isUploadingImages, setIsUploadingImages] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      setSubmitError('');
      await onSubmit(e);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message === 'LIMIT_REACHED') {
        onUpgradeRequired?.();
        return;
      }
      setSubmitError('Unable to save product right now. Please try again.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((file): file is File => file instanceof File);
    if (!files.length) return;
    setSubmitError('');
    setIsUploadingImages(true);
    try {
      const nextImages = await Promise.all(files.map((file) => uploadImage(file, 'products')));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...nextImages],
      }));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to upload images right now.');
    } finally {
      setIsUploadingImages(false);
    }

    e.target.value = '';
  };

  const makeCoverImage = (index: number) => {
    setFormData((prev) => {
      const nextImages = [...prev.images];
      const [selected] = nextImages.splice(index, 1);
      return {
        ...prev,
        images: [selected, ...nextImages],
      };
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const coverImage = formData.images[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Product' : 'Add New Product'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          {coverImage ? (
            <img src={coverImage} alt="Cover preview" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-25" />
          ) : null}
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shadow-sm transition-colors group-hover:bg-white">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {isUploadingImages ? 'Uploading images...' : coverImage ? 'Add more product images' : 'Upload product images'}
            </p>
            <p className="mt-1 text-xs text-gray-500">Pick one or multiple images. The first image becomes the cover.</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
        </div>

        {formData.images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Product Gallery</p>
              <p className="text-xs text-gray-500">Tap a thumbnail to manage it. Cover image appears first.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {formData.images.map((image, index) => (
                <div key={`${image}-${index}`} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="relative group flex-1">
                    <img src={image} alt={`Product image ${index + 1}`} className="h-28 w-full object-cover" />
                    {index === 0 && (
                      <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        <Star className="h-3 w-3 fill-current" />
                        Cover
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 p-2 border-t border-gray-100 bg-gray-50/50">
                    <button
                      type="button"
                      onClick={() => makeCoverImage(index)}
                      disabled={index === 0}
                      className="flex-1 rounded-md border border-gray-200 bg-white px-1 py-1.5 text-[10px] font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 truncate shadow-sm"
                    >
                      {index === 0 ? 'Cover Image' : 'Set as Cover'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="shrink-0 flex items-center justify-center w-8 rounded-md border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Product Name"
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
              className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          placeholder="Describe your product..."
          maxLength={200}
        />

        <Input
          label="Collection"
          value={formData.collection}
          onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
          placeholder="e.g. Summer Collection"
        />

        <Textarea
          label="Highlights"
          value={formData.highlights}
          onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
          placeholder="One highlight per line"
        />

        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImages}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploadingImages ? 'Uploading...' : 'Add Images'}
          </Button>
          <Button type="submit" disabled={isUploadingImages}>
            {isEditMode ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
