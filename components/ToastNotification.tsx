'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export function ToastNotification() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-none">
      <div className="flex items-center gap-3 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-stone-800 text-xs sm:text-sm font-bold">
        <span className="material-symbols-outlined text-orange-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          notifications_active
        </span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
