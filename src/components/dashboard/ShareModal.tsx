import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl: string;
}

export function ShareModal({ isOpen, onClose, storeUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Your Store"
    >
      <div className="space-y-6 flex flex-col items-center text-center">
        <p className="text-sm text-gray-500">
          Scan this QR code or copy the link below to share your store with customers.
        </p>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm inline-block">
          <QRCodeSVG value={storeUrl} size={200} />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Store Link</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={storeUrl} 
              className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:outline-none"
            />
            <Button onClick={handleCopyLink} variant="secondary" className="px-3">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
