'use client';

import React from 'react';
import { OrderOutputDTO } from '@/lib/clean-architecture/application/dtos/OrderDTO';

interface ReceiptModalProps {
  order: OrderOutputDTO;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
          aria-label="Cerrar recibo"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="text-center pb-3 border-b border-surface-container flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-2">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-secondary">
            Comprobante Oficial Campus Dining
          </span>
          <h3 className="font-display text-xl font-bold text-primary">
            Quick-Bite University
          </h3>
          <p className="text-xs text-on-surface-variant">NIT 890.902.420-1 • Bienestar Universitario</p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-surface-container">
          <div>
            <span className="text-outline text-[11px]">Orden / Ticket:</span>
            <p className="font-bold text-on-surface">{order.id} ({order.ticketNumber})</p>
          </div>
          <div>
            <span className="text-outline text-[11px]">Fecha y Hora:</span>
            <p className="font-medium text-on-surface">
              {new Date(order.createdAt).toLocaleDateString('es-CO')} {new Date(order.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <span className="text-outline text-[11px]">Cliente / Carné:</span>
            <p className="font-medium text-on-surface">{order.studentName} ({order.studentId})</p>
          </div>
          <div>
            <span className="text-outline text-[11px]">Estación:</span>
            <p className="font-medium text-on-surface">{order.pickupStation.name}</p>
          </div>
        </div>

        {/* Itemized List */}
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-on-surface">{item.quantity}x {item.productName}</span>
                {item.customizations && (
                  <p className="text-[10px] text-on-surface-variant italic">{item.customizations}</p>
                )}
              </div>
              <span className="font-display font-semibold text-on-surface">{item.formattedSubtotal}</span>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="pt-2 border-t border-surface-container flex flex-col gap-1 text-xs">
          <div className="flex justify-between text-on-surface-variant">
            <span>Subtotal</span>
            <span>{order.formattedSubtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-secondary">
              <span>Descuento Estudiantil ({order.paymentMethod.discountPercentage}%)</span>
              <span>{order.formattedDiscount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-primary pt-1 border-t border-dashed border-surface-container-high">
            <span>Total Pagado</span>
            <span className="font-display text-base text-secondary">{order.formattedTotal}</span>
          </div>
          <div className="flex justify-between text-[11px] text-outline pt-1">
            <span>Método de pago:</span>
            <span className="font-medium text-on-surface">{order.paymentMethod.label}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Imprimir</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-secondary text-white hover:bg-[#8e3312] text-xs font-bold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
