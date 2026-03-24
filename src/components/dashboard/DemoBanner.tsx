'use client';

import React, { useState, useEffect } from 'react';
import { FlaskConical, X, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const DISMISSED_KEY = 'myshoplink-demo-dismissed';

export function DemoBanner() {
  const { resetDemoData } = useStore();
  const [visible, setVisible] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = window.localStorage.getItem(DISMISSED_KEY);
      setVisible(!dismissed);
    }
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const handleReset = async () => {
    setResetting(true);
    await resetDemoData();
    setResetting(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
          <FlaskConical className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-blue-900">This is demo data</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            The products, orders, and analytics shown are sample data to help you explore the app. Reset it anytime to start fresh with your real store.
          </p>

          {showConfirm ? (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-8 rounded-xl border border-blue-300 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Keep demo
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 h-8 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                {resetting ? 'Resetting…' : 'Yes, reset'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset demo data
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          className="p-1 text-blue-400 hover:text-blue-700 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
