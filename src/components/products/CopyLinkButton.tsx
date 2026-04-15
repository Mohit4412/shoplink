'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { getProductShareUrl } from '../../utils/productSlug';

interface CopyLinkButtonProps {
  username: string;
  productId: string;
  /** Visual variant — 'icon' for table rows, 'full' for mobile cards */
  variant?: 'icon' | 'full';
}

export function CopyLinkButton({ username, productId, variant = 'icon' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getProductShareUrl(username, productId);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers / non-HTTPS
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold transition-colors border-r ${
          copied
            ? 'text-emerald-700 bg-[#e8f2eb]'
            : 'text-[#4f80ff] hover:bg-[#eef3ff]'
        }`}
        style={{ borderColor: 'var(--app-border)' }}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy product link'}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
        copied
          ? 'bg-[#e8f2eb] text-emerald-700'
          : 'bg-[#eef3ff] text-[#4f80ff] hover:bg-[#e5edff]'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Link'}
    </button>
  );
}
