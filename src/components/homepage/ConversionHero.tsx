import React from 'react';
import { Button } from '../ui/Button';

export function ConversionHero({ images, headline, sub, ctaPrimary, ctaSecondary }: { 
  images: string[]; 
  headline: string; 
  sub: string; 
  ctaPrimary: string; 
  ctaSecondary: string; 
}) {
  return (
    <section className="relative h-[70vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
      {images.length > 0 && (
        <img src={images[0]} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
      )}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">{headline}</h1>
        <p className="text-xl md:text-2xl mb-8">{sub}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">{ctaPrimary}</Button>
          <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900">{ctaSecondary}</Button>
        </div>
      </div>
    </section>
  );
}
