'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { ProductVariant } from '../../types';

interface VariantEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const addVariant = () => {
    onChange([...variants, { name: '', options: [] }]);
  };

  const removeVariant = (i: number) => {
    onChange(variants.filter((_, idx) => idx !== i));
  };

  const updateName = (i: number, name: string) => {
    const next = [...variants];
    next[i] = { ...next[i], name };
    onChange(next);
  };

  const addOption = (i: number, raw: string) => {
    const option = raw.trim();
    if (!option || variants[i].options.includes(option)) return;
    const next = [...variants];
    next[i] = { ...next[i], options: [...next[i].options, option] };
    onChange(next);
  };

  const removeOption = (vi: number, oi: number) => {
    const next = [...variants];
    next[vi] = { ...next[vi], options: next[vi].options.filter((_, idx) => idx !== oi) };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Variants</label>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <Plus className="w-3.5 h-3.5" /> Add variant
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs text-gray-400">
          No variants yet. Add Size, Color, Material, etc.
        </p>
      )}

      {variants.map((variant, vi) => (
        <div key={vi} className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={variant.name}
              onChange={(e) => updateName(vi, e.target.value)}
              placeholder="Variant name (e.g. Size, Color)"
              className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:border-gray-400"
            />
            <button
              type="button"
              onClick={() => removeVariant(vi)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-1.5">
            {variant.options.map((opt, oi) => (
              <span
                key={oi}
                className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700"
              >
                {opt}
                <button
                  type="button"
                  onClick={() => removeOption(vi, oi)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add option + Enter"
              className="h-7 min-w-[120px] rounded-full border border-dashed border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:border-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOption(vi, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  addOption(vi, e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
