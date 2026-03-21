'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductCarouselProps {
  images: string[];
  productName: string;
}

export function ProductCarousel({ images, productName }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Zoom State for Flipkart style magnifier
  const [isHovering, setIsHovering] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return; // Only zoom on desktop
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setIsHovering(true);
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)' // Intensely zoom for the magnifier effect
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)'
    });
  };

  return (
    <>
      {/* Flipkart Style Layout: Thumbs on left, Main on right */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full w-full">
        
        {/* Thumbnails - Vertical on Desktop, Horizontal on Mobile */}
        {images.length > 1 && (
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar order-2 lg:order-1 lg:w-20 shrink-0 pb-2 lg:pb-0 lg:max-h-[600px]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => {
                  if (window.innerWidth >= 1024) setCurrentIndex(idx);
                }}
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-16 h-20 md:w-20 md:h-24 lg:w-20 lg:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === idx ? 'border-teal-600' : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300 bg-gray-100'
                }`}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main Image Viewer */}
        <div 
          className="relative flex-1 aspect-[4/5] lg:aspect-auto lg:h-[600px] bg-gray-50 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 order-1 lg:order-2 cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={images[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover lg:object-contain transition-transform duration-100 ease-out"
            style={isHovering ? zoomStyle : { transform: 'scale(1)', transition: 'transform 0.4s ease-out' }}
            priority
          />
          
          {/* Mobile Arrows & Indicators (Hidden on Desktop) */}
          {images.length > 1 && (
            <div className="lg:hidden">
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-sm opacity-90 transition-opacity hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-sm opacity-90 transition-opacity hover:bg-white"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx ? 'bg-teal-600 w-4' : 'bg-white/70 backdrop-blur w-2'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal via Portal */}
      {mounted && isLightboxOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close fullscreen"
            className="absolute top-6 right-6 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full p-4 flex items-center justify-center select-none" onClick={() => setIsLightboxOpen(false)}>
            <div className="relative w-full max-w-5xl aspect-[3/4] md:aspect-auto md:h-[90vh] md:w-auto" onClick={e => e.stopPropagation()}>
              <img
                src={images[currentIndex]}
                alt={productName}
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-6 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-6 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
