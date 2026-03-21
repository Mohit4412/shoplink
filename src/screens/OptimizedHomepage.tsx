import React from 'react';
import { useStore } from '../context/StoreContext';
import { ConversionHero } from '../components/homepage/ConversionHero';
import { FeaturedGrid } from '../components/homepage/FeaturedGrid';
import { TrustBar } from '../components/homepage/TrustBar';

export function OptimizedHomepage() {
  const { store, products } = useStore();
  
  return (
    <div className="min-h-screen bg-white">
      <ConversionHero 
        images={[]} 
        headline={store.name} 
        sub={store.tagline} 
        ctaPrimary="Shop Collection" 
        ctaSecondary="Chat on WhatsApp" 
      />
      <FeaturedGrid 
        products={products.filter(p => p.status === 'Active')} 
        quickAdd={true} 
        urgencyBadges={true} 
      />
      <TrustBar 
        badges={["Secure Chat", "Fast Delivery", "24/7 Support"]} 
        reviews={4.9} 
      />
    </div>
  );
}
