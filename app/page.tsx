'use client';

import React from 'react';
import { CartProvider, useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { CatalogView } from '@/components/CatalogView';
import { CheckoutView } from '@/components/CheckoutView';
import { OrdersView } from '@/components/OrdersView';
import { CleanArchitectureDocView } from '@/components/CleanArchitectureDocView';
import { Footer } from '@/components/Footer';
import { ToastNotification } from '@/components/ToastNotification';

function AppContent() {
  const { activeTab } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="w-full flex-1 pt-20">
        {activeTab === 'menu-y-catalogo' && <CatalogView />}
        {activeTab === 'pagar-y-carrito' && <CheckoutView />}
        {activeTab === 'mis-pedidos' && <OrdersView />}
        {activeTab === 'clean-arch' && <CleanArchitectureDocView />}
      </main>

      <Footer />
      <ToastNotification />
    </div>
  );
}

export default function HomePage() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
