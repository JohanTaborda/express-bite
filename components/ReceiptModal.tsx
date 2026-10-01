'use client';

import React from 'react';
import { OrderOutputDTO } from '@/lib/clean-architecture/application/dtos/OrderDTO';

interface ReceiptModalProps {
  order: OrderOutputDTO;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 p-1 rounded-xl bg-stone-100"
          aria-label="Cerrar recibo"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="text-center pb-3 border-b border-stone-200 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-800 mb-2">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-orange-700">
            Comprobante Oficial de Entrega
          </span>
          <h3 className="font-display text-xl font-black text-stone-900">
            Quick-Bite University
          </h3>
          <p className="text-xs text-stone-500 font-medium">NIT 890.902.420-1 • Bienestar Universitario</p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-3 text-xs py-2 border-b border-stone-200">
          <div>
            <span className="text-stone-500 font-bold uppercase text-[11px] block">Orden / Turno:</span>
            <p className="font-black text-stone-900 text-sm">{order.id} ({order.ticketNumber})</p>
          </div>
          <div>
            <span className="text-stone-500 font-bold uppercase text-[11px] block">Fecha y Hora:</span>
            <p className="font-semibold text-stone-800">
              {new Date(order.createdAt).toLocaleDateString('es-CO')} {new Date(order.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <span className="text-stone-500 font-bold uppercase text-[11px] block">Cliente / Carné:</span>
            <p className="font-bold text-stone-900">{order.studentName}</p>
            <p className="text-stone-500 font-mono text-[11px]">ID: {order.studentId}</p>
          </div>
          <div>
            <span className="text-stone-500 font-bold uppercase text-[11px] block">Estación:</span>
            <p className="font-semibold text-stone-800">{order.pickupStation.name}</p>
          </div>
        </div>

        {/* Itemized List */}
        <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div>
                <span className="font-bold text-stone-900">{item.quantity}x {item.productName}</span>
                {item.customizations && (
                  <p className="text-xs text-stone-500 italic mt-0.5">{item.customizations}</p>
                )}
              </div>
              <span className="font-display font-black text-stone-900">{item.formattedSubtotal}</span>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="pt-3 border-t border-stone-200 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-bold text-stone-900">{order.formattedSubtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Descuento Estudiantil ({order.paymentMethod.discountPercentage}%)</span>
              <span>{order.formattedDiscount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-dashed border-stone-300">
            <span>Total Pagado</span>
            <span className="font-display text-lg text-secondary font-black">{order.formattedTotal}</span>
          </div>
          <div className="flex justify-between text-xs text-stone-600 pt-1">
            <span>Método de pago:</span>
            <span className="font-bold text-stone-900">{order.paymentMethod.label}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5 transition-colors border border-stone-200"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Imprimir</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-secondary text-white hover:bg-orange-700 text-xs font-bold transition-colors shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
