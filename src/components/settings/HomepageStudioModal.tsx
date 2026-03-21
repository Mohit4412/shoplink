import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface HomepageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HomepageStudioModal({ isOpen, onClose }: HomepageStudioModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Homepage Studio</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">Welcome to the Homepage Studio! Here you can customize your store's homepage layout, colors, and more.</p>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          Studio Editor Placeholder
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
