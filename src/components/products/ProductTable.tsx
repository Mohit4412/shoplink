import React from 'react';
import { Card } from '../ui/Card';
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
    <Card className="hidden md:block overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 font-medium w-24">Image</th>
            <th className="px-6 py-4 font-medium">Product Name</th>
            <th className="px-6 py-4 font-medium">Price</th>
            <th className="px-6 py-4 font-medium">Collection</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                No products found. Click "Add Product" to create one.
              </td>
            </tr>
          ) : (
            filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-gray-600">{currencySymbol}{product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-500">
                  {product.collection ? (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {product.collection}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onEdit(product)} className="text-brand- hover:text-brand- font-medium mr-4">Edit</button>
                  <button onClick={() => onDelete(product)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
        <span>Showing 1 to {filteredProducts.length} of {products.length} products</span>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">&lt;</button>
          <button className="px-3 py-1 border border-gray-300 rounded bg-gray-100 font-medium text-gray-900">1</button>
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">&gt;</button>
        </div>
      </div>
    </Card>
  );
}
