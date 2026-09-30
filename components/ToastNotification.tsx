'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export function ToastNotification() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-none">
      <div className="flex items-center gap-2.5 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-2xl shadow-xl border border-white/10 text-xs sm:text-sm font-semibold">
        <span className="material-symbols-outlined text-secondary-fixed text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          notifications_active
        </span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
