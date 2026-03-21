'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber: string;
  productName: string;
  storeName?: string;
}

export function FloatingWhatsApp({ phoneNumber, productName, storeName = 'our' }: FloatingWhatsAppProps) {
  const handleChatClick = () => {
    const message = encodeURIComponent(`Hi! I want to order: *${productName}*. Please confirm availability. 🙏`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:right-6 z-50 group">
      <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs font-semibold py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
        Chat to Order
        <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 transform rotate-45" />
      </div>
      <button
        onClick={handleChatClick}
        aria-label="Chat to Order on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-105 hover:bg-[#20BE5A] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 sm:h-16 sm:w-16"
      >
        <MessageCircle className="w-8 h-8" strokeWidth={2.5} />
      </button>
    </div>
  );
}
