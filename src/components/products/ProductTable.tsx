import React from 'react';
import { Product } from '../../types';

interface ProductTableProps {
  products: Product[];
  filteredProducts: Product[];
  currencySymbol: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, filteredProducts, currencySymbol, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="min-w-[520px] w-full text-sm text-left bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-3 py-3 font-semibold w-[64px]"></th>
            <th className="px-3 py-3 font-semibold min-w-[140px]">Product</th>
            <th className="px-3 py-3 font-semibold min-w-[80px]">Price</th>
            <th className="px-3 py-3 font-semibold min-w-[100px]">Collection</th>
            <th className="px-3 py-3 font-semibold min-w-[80px]">Status</th>
            <th className="px-3 py-3 font-semibold min-w-[80px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                No products found.
              </td>
            </tr>
          ) : (
            filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors h-16">
                <td className="px-3 py-2">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 font-medium text-gray-900 text-sm">{product.name}</td>
                <td className="px-3 py-2 text-sm text-gray-600">{currencySymbol}{product.price.toFixed(2)}</td>
                <td className="px-3 py-2 text-sm">
                  {product.collection ? (
                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {product.collection}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => onEdit(product)} className="text-xs font-semibold text-gray-600 hover:text-gray-900 mr-3">Edit</button>
                  <button onClick={() => onDelete(product)} className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2 px-1">
        {filteredProducts.length} of {products.length} products
      </p>
    </div>
  );
}
