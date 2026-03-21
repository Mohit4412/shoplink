import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductMobileCardsProps {
  filteredProducts: Product[];
  currencySymbol: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductMobileCards({ filteredProducts, currencySymbol, onEdit, onDelete }: ProductMobileCardsProps) {
  return (
    <div className="md:hidden space-y-4">
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          No products found.
        </div>
      ) : (
        filteredProducts.map((product) => (
          <Card key={product.id} className="p-4 flex flex-col gap-4">
            <div className="flex gap-4">
              <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-gray-600 mt-1">{currencySymbol}{product.price.toFixed(2)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                  {product.collection && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {product.collection}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-gray-100 pt-3">
              <Button variant="outline" className="flex-1" onClick={() => onEdit(product)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => onDelete(product)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
