'use client';

import React from 'react';
import Link from 'next/link';
import { Store } from 'lucide-react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export function AppLogo({ size = 'md', href = '/', className = '' }: AppLogoProps) {
  const iconBox = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const rounded = size === 'sm' ? 'rounded-md' : 'rounded-lg';
  const textSize = size === 'sm' ? 'text-[17px]' : size === 'lg' ? 'text-xl' : 'text-2xl';

  const inner = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${iconBox} ${rounded} bg-[#059669] flex items-center justify-center shadow-sm shrink-0`}>
        <Store className={`${iconSize} text-white`} />
      </div>
      <span className={`font-bold ${textSize} tracking-tight text-gray-900 font-heading`}>
        MyShopLink
      </span>
    </div>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="hover:opacity-90 transition-opacity">
      {inner}
    </Link>
  );
}
