import React from 'react';
import { Button } from '../ui/Button';

export function FeaturedGrid({ products, quickAdd, urgencyBadges }: { 
  products: any[]; 
  quickAdd: boolean; 
  urgencyBadges: boolean; 
}) {
  return (
    <section className="py-16 container mx-auto px-6">
      <h2 className="text-3xl font-bold mb-12 text-center">Featured Products</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-lg mb-4" referrerPolicy="no-referrer" />
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4">${product.price}</p>
            {urgencyBadges && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Limited Stock</span>}
            {quickAdd && <Button className="w-full mt-4">Add to Cart</Button>}
          </div>
        ))}
      </div>
    </section>
  );
}
