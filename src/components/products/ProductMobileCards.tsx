import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductMobileCardsProps {
  filteredProducts: Product[];
  currencySymbol: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductMobileCards({ filteredProducts, currencySymbol, onEdit, onDelete }: ProductMobileCardsProps) {
  if (filteredProducts.length === 0) {
    return (
      <div className="sm:hidden text-center py-12 text-sm text-gray-400">
        No products found.
      </div>
    );
  }

  return (
    <div className="sm:hidden divide-y divide-gray-100">
      {filteredProducts.map((product) => (
        <div key={product.id} className="flex items-center gap-3 py-3">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">{currencySymbol}{product.price.toFixed(2)}</span>
              {product.collection && (
                <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium truncate max-w-[80px]">
                  {product.collection}
                </span>
              )}
              <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {product.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
