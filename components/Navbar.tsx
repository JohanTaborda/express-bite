'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart, ActiveTab } from '@/context/CartContext';

export function Navbar() {
  const {
    activeTab,
    setActiveTab,
    totalItemCount,
    studentBalance,
    rechargeBalance,
    activeOrder,
  } = useCart();

  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const navLinks: { id: ActiveTab; label: string; badge?: number | string }[] = [
    { id: 'menu-y-catalogo', label: 'Menú y Catálogo' },
    {
      id: 'mis-pedidos',
      label: 'Mis Pedidos',
      badge: activeOrder && activeOrder.status !== 'DELIVERED' ? activeOrder.ticketNumber : undefined,
    },
    {
      id: 'pagar-y-carrito',
      label: 'Pagar y Carrito',
      badge: totalItemCount > 0 ? totalItemCount : undefined,
    },
    {
      id: 'clean-arch',
      label: 'Arquitectura & SOLID',
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-surface-container-high shadow-xs">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand & Campus Status */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab('menu-y-catalogo')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-container-lowest p-1 shadow-xs flex items-center justify-center border border-surface-container-high group-hover:scale-105 transition-transform overflow-hidden relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx_YAMt9Oz_SgOiVwgC4yb88T9HTtaFtiDdLfuV_P7ZNdYHHpdjo1pR-BN7QnCSJdehXIuV9675cFqeqiZA5_co-LUfybdWcphnKVYPbWDPxBxjzWKycFhdm4Gvn0a0UStd9NpqfwJwYDm_pm9lWoXh0_1BmLSrPnVwvgCCrTbfCf492kqqyxyEp2b6BlVLlY--oIc1_W-t28ysdUw3HmdGnkA9hJmFXfvP_FKahkYSCuUmtV6GdQG"
                  alt="Quick-Bite University Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-primary leading-tight">
                  Quick-Bite
                </span>
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  University Dining
                </span>
              </div>
            </button>

            {/* Campus Station Live Indicator */}
            <div className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container">
              <span className="material-symbols-outlined text-primary text-lg">storefront</span>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface font-semibold">
                  Cafetería Central - Edificio B
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="text-[11px] text-secondary font-medium">
                    Abierto • Espera aprox. 8 min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low/70 p-1 rounded-xl border border-surface-container">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all relative flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? 'bg-secondary text-white'
                          : 'bg-secondary text-white'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Student Balance & Cart & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Balance Pill */}
            <button
              onClick={() => setShowRechargeModal(true)}
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded-full border border-surface-container text-left group"
              title="Click para recargar saldo"
            >
              <span className="material-symbols-outlined text-secondary text-base group-hover:scale-110 transition-transform">
                account_balance_wallet
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                <span className="text-[11px] text-on-surface-variant font-medium hidden sm:inline">
                  Carné:
                </span>
                <span className="text-xs sm:text-sm font-bold text-secondary font-display">
                  ${studentBalance.toLocaleString('es-CO')}
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-xs hidden sm:inline">
                add_circle
              </span>
            </button>

            {/* Shopping Bag CTA */}
            <button
              onClick={() => setActiveTab('pagar-y-carrito')}
              className="relative p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-center border border-surface-container"
              aria-label="Ver carrito"
            >
              <span className="material-symbols-outlined text-xl text-primary">shopping_bag</span>
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs animate-scale">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-surface-container-high">
              <div className="w-10 h-10 rounded-full overflow-hidden relative ring-2 ring-primary/20 shrink-0 bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-xs">
                JD
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-on-surface leading-tight">
                  Johan David Taborda
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Carné #2024-1088 • Campus Central
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-surface-container-high bg-surface-container-lowest px-2 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-container text-white'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-secondary text-white font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Quick Balance Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-xl border border-surface-container-high flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                <h3 className="font-display font-bold text-lg">Recarga de Saldo Carné</h3>
              </div>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-sm text-on-surface-variant">
              Saldo actual: <strong className="text-secondary">${studentBalance.toLocaleString('es-CO')}</strong>
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[10000, 20000, 50000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    rechargeBalance(amount);
                    setShowRechargeModal(false);
                  }}
                  className="py-3 px-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-display font-bold text-sm text-primary border border-surface-container-high transition-all active:scale-95 text-center"
                >
                  +${amount.toLocaleString('es-CO')}
                </button>
              ))}
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
              <p>
                <strong>Beneficio universitario:</strong> Pagar con tu carné institucional otorga un{' '}
                <strong className="text-secondary">10% de descuento automático</strong> en cada pedido.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
