import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { getStoreUrl } from '../../utils/storeUrl';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function ShareModal({ isOpen, onClose, username }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const primaryUrl = getStoreUrl(username);
  const secondaryUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${username}`
    : `https://myshoplink.site/${username}`;

  const handleCopyLink = () => {
    if (!username) return;
    navigator.clipboard.writeText(primaryUrl);
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
          <QRCodeSVG value={primaryUrl} size={200} />
        </div>

        <div className="w-full text-left space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Store Link</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={primaryUrl} 
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-bold text-gray-900 focus:outline-none"
              />
              <Button onClick={handleCopyLink} variant="secondary" className="px-3 shrink-0">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Share the top link — it looks more professional.</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Secondary Link (also works)</label>
            <input 
              type="text" 
              readOnly 
              value={secondaryUrl} 
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-400 focus:outline-none line-through"
              style={{ textDecoration: 'none' }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
