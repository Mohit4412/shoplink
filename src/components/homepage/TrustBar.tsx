import React from 'react';
import { Shield, Truck, MessageSquare } from 'lucide-react';

export function TrustBar({ badges, reviews }: { badges: string[]; reviews: number }) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6 flex flex-wrap justify-center gap-8">
        {badges.map((badge, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-700">
            {index === 0 && <Shield className="w-6 h-6 text-emerald-600" />}
            {index === 1 && <Truck className="w-6 h-6 text-emerald-600" />}
            {index === 2 && <MessageSquare className="w-6 h-6 text-emerald-600" />}
            <span className="font-medium">{badge}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-bold text-lg">★ {reviews}</span>
          <span>Reviews</span>
        </div>
      </div>
    </section>
  );
}
