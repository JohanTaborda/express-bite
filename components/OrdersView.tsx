'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { OrderStatus } from '@/lib/clean-architecture/domain/value-objects/OrderStatus';
import { ReceiptModal } from './ReceiptModal';

export function OrdersView() {
  const {
    activeOrder,
    setActiveOrder,
    allOrders,
    refreshOrders,
    showToast,
    setActiveTab,
  } = useCart();

  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Fallback if no active order is selected
  const currentOrder = activeOrder || allOrders[0] || null;

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    if (!currentOrder) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al actualizar estado');
      }
      setActiveOrder(json.data);
      await refreshOrders();
      showToast(`Estado actualizado: ${json.data.statusLabel}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido? Se reembolsará el saldo a tu carné universitario.')) {
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelado por solicitud del estudiante' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al cancelar');
      }
      setActiveOrder(json.data);
      await refreshOrders();
      showToast('Pedido cancelado y saldo reembolsado.');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-stone-400 mb-2">
          receipt_long
        </span>
        <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">
          No tienes pedidos registrados
        </h2>
        <p className="text-sm text-stone-600 max-w-sm mx-auto mb-6">
          Realiza tu primera orden desde el menú para darle seguimiento en vivo.
        </p>
        <button
          onClick={() => setActiveTab('menu-y-catalogo')}
          className="px-6 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-orange-700"
        >
          Ir al Menú
        </button>
      </div>
    );
  }

  // Stepper calculations
  const steps = [
    { number: 1, label: '1. Recibido', sub: 'Comprobado en cocina', status: 'RECEIVED' },
    { number: 2, label: '2. En Proceso', sub: 'Barista preparando', status: 'PREPARING' },
    { number: 3, label: '3. Listo en Barra', sub: 'En mostrador para retiro', status: 'READY' },
    { number: 4, label: '4. Entregado', sub: 'Escaneo completado', status: 'DELIVERED' },
  ];

  const currentStepNumber =
    currentOrder.status === 'RECEIVED'
      ? 1
      : currentOrder.status === 'PREPARING'
      ? 2
      : currentOrder.status === 'READY'
      ? 3
      : currentOrder.status === 'DELIVERED'
      ? 4
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20 flex flex-col gap-6">
      {/* Top Status Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-stone-200">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                  currentOrder.status === 'READY'
                    ? 'bg-emerald-600 text-white'
                    : currentOrder.status === 'CANCELLED'
                    ? 'bg-red-600 text-white'
                    : 'bg-secondary text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                {currentOrder.statusLabel}
              </span>
              <span className="text-xs text-stone-600 font-bold">
                Orden #{currentOrder.id}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-orange-700 font-bold">
                {currentOrder.pickupStation.name}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
              {currentOrder.status === 'READY'
                ? '¡Tu pedido está listo para recoger!'
                : currentOrder.status === 'DELIVERED'
                ? '¡Pedido entregado con éxito! ¡Buen provecho!'
                : currentOrder.status === 'CANCELLED'
                ? 'Pedido Cancelado'
                : '¡Tu pedido está en preparación en cocina!'}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              {currentOrder.status === 'READY' ? (
                <>Acércate ahora mismo a la <strong className="text-stone-900 font-bold">Barra 2 (Entregas Express)</strong> con tu turno <strong className="text-secondary font-display font-black">{currentOrder.ticketNumber}</strong>.</>
              ) : currentOrder.status === 'DELIVERED' ? (
                <>Has acumulado <strong className="text-secondary font-bold">+{currentOrder.loyaltyPoints} Puntos Quick-Bite</strong> en tu carné universitario.</>
              ) : currentOrder.status === 'CANCELLED' ? (
                <>El importe ha sido reintegrado a tu saldo institucional.</>
              ) : (
                <>Estará listo en aproximadamente <strong className="text-secondary font-bold">6 minutos</strong> en el mostrador del <strong className="text-stone-900 font-bold">Edificio B</strong>.</>
              )}
            </p>
          </div>

          {/* Timing Pill */}
          <div className="flex items-center gap-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-200 self-start lg:self-center shrink-0">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-800">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                timer
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                Hora estimada de retiro
              </span>
              <span className="font-display text-lg font-black text-stone-900">
                {new Date(currentOrder.estimatedReadyAt).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-xs text-secondary font-bold">Turno Asignado: {currentOrder.ticketNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-State Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs uppercase text-stone-500 tracking-wider font-extrabold">
              Fases del Pedido en Tiempo Real
            </span>
            <h2 className="font-display text-xl text-stone-900 font-black">
              Progreso del Servicio
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 text-stone-600 text-xs bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200 font-semibold">
            <span className="material-symbols-outlined text-sm text-secondary animate-spin">sync</span>
            <span>Actualización en vivo</span>
          </div>
        </div>

        {/* Stepper Progress Track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st) => {
            const isCompleted = currentStepNumber > st.number;
            const isCurrent = currentStepNumber === st.number;
            return (
              <div
                key={st.number}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-orange-50/60 border-secondary ring-1 ring-secondary shadow-xs'
                    : isCompleted
                    ? 'bg-stone-50 border-stone-200'
                    : 'bg-white border-stone-200 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-secondary text-white animate-pulse shadow-sm'
                      : isCompleted
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-lg font-bold">check</span>
                  ) : (
                    st.number
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-display text-xs sm:text-sm font-bold leading-snug ${
                      isCurrent ? 'text-secondary' : 'text-stone-900'
                    }`}
                  >
                    {st.label}
                  </span>
                  <span className="text-xs text-stone-500">{st.sub}</span>
                  {isCurrent && (
                    <span className="text-[11px] text-secondary font-bold mt-0.5">En preparación</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean Architecture Barista Simulation Station */}
        <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">coffee_maker</span>
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                Simulador Barista (Prueba de Casos de Uso):
              </span>
              <span className="text-xs text-stone-500 font-medium">
                Avanza o actualiza el ciclo de vida del pedido:
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentOrder.status === 'RECEIVED' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('PREPARING')}
                className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-orange-700 transition-colors shadow-xs"
              >
                Pasar a &quot;En Proceso&quot;
              </button>
            )}
            {currentOrder.status === 'PREPARING' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('READY')}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Avanzar a &quot;Listo en Barra&quot;
              </button>
            )}
            {currentOrder.status === 'READY' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('DELIVERED')}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-xs"
              >
                Marcar como &quot;Entregado&quot;
              </button>
            )}
            {currentOrder.canBeCancelled && (
              <button
                disabled={isUpdatingStatus}
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 hover:text-red-700 text-stone-600 border border-stone-300 text-xs font-bold transition-colors"
              >
                Cancelar Orden
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Pick-up Ticket (7 cols) + Actions & History (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Digital Ticket Pass & Station Map */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Digital Retrieval Pass (Ticket Style) */}
          <div className="relative bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex flex-col sm:flex-row">
            {/* Punch notch effect */}
            <div className="hidden sm:block absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-surface border-r border-stone-200 -translate-y-1/2 z-20"></div>
            <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-surface border-l border-stone-200 -translate-y-1/2 z-20"></div>

            {/* Left side: Turn Code & QR */}
            <div className="sm:w-5/12 bg-stone-900 text-white p-6 flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs uppercase tracking-widest text-orange-200 font-bold">
                  Turno de Retiro
                </span>
                <div className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white my-1">
                  {currentOrder.ticketNumber}
                </div>
                <span className="text-xs bg-white/20 text-white px-3 py-0.5 rounded-full font-bold">
                  {currentOrder.pickupStation.name}
                </span>
              </div>

              {/* Styled SVG QR Code */}
              <div className="bg-white p-3 rounded-2xl my-4 shadow-sm">
                <svg className="w-28 h-28 text-stone-900" fill="currentColor" viewBox="0 0 100 100">
                  <rect x="10" y="10" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="16" y="16" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="20" y="20" width="8" height="8" fill="currentColor" />
                  <rect x="62" y="10" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="68" y="16" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="72" y="20" width="8" height="8" fill="currentColor" />
                  <rect x="10" y="62" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="16" y="68" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="20" y="72" width="8" height="8" fill="currentColor" />
                  <rect x="44" y="12" width="8" height="6" fill="currentColor" />
                  <rect x="44" y="22" width="12" height="6" fill="currentColor" />
                  <rect x="44" y="32" width="6" height="8" fill="currentColor" />
                  <rect x="12" y="44" width="8" height="6" fill="currentColor" />
                  <rect x="24" y="44" width="12" height="8" fill="currentColor" />
                  <rect x="42" y="44" width="16" height="16" rx="2" fill="currentColor" />
                  <rect x="64" y="44" width="8" height="12" fill="currentColor" />
                  <rect x="78" y="44" width="12" height="6" fill="currentColor" />
                  <rect x="44" y="66" width="10" height="6" fill="currentColor" />
                  <rect x="60" y="66" width="12" height="12" fill="currentColor" />
                  <rect x="78" y="64" width="12" height="14" fill="currentColor" />
                  <rect x="44" y="78" width="8" height="12" fill="currentColor" />
                  <rect x="66" y="82" width="20" height="8" fill="currentColor" />
                </svg>
              </div>

              <p className="text-xs text-stone-300 font-medium">
                Escanea este código en el mostrador al escuchar tu turno.
              </p>
            </div>

            {/* Right side: Items breakdown */}
            <div className="sm:w-7/12 p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                  <span className="text-xs uppercase tracking-wider text-stone-600 font-black">
                    Detalle de los Productos
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 font-bold text-stone-800">
                    {currentOrder.items.length} {currentOrder.items.length === 1 ? 'artículo' : 'artículos'}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-stone-900 font-black text-xs shrink-0 border border-stone-200">
                          {item.quantity}x
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-bold text-stone-900">
                            {item.productName}
                          </span>
                          {item.customizations && (
                            <span className="text-xs text-stone-500 line-clamp-1">
                              {item.customizations}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-display text-xs sm:text-sm font-black text-stone-900 shrink-0">
                        {item.formattedSubtotal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">badge</span>
                  <span className="text-xs text-stone-900 font-bold">
                    {currentOrder.paymentMethod.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-display text-sm sm:text-base font-black text-stone-900 block">
                    {currentOrder.formattedTotal}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold">Pagado con éxito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campus Station Schematic Layout */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-stone-900 text-xl">pin_drop</span>
                <h3 className="font-display text-base font-bold text-stone-900">
                  Ubicación de Recogida en el Campus
                </h3>
              </div>
              <span className="text-xs font-bold text-orange-800 bg-orange-100 px-3 py-1 rounded-full">
                Piso 1 • Patio Central
              </span>
            </div>

            {/* Architectural schematic */}
            <div className="relative w-full h-44 rounded-2xl bg-stone-100 overflow-hidden p-4 flex flex-col justify-between border border-stone-200">
              <div className="relative z-10 flex items-center justify-between text-xs text-stone-600 font-bold">
                <span className="bg-white px-2.5 py-1 rounded-lg shadow-xs border border-stone-200">
                  Acceso Principal Edificio B
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg shadow-xs border border-stone-200">
                  Conexión a Biblioteca
                </span>
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-2 my-auto text-center">
                <div className="p-2.5 rounded-xl bg-white text-stone-500 text-xs font-semibold border border-stone-200">
                  Barra 1: Almuerzos
                </div>
                <div className="p-3 rounded-2xl bg-secondary text-white shadow-md flex flex-col items-center justify-center transform scale-105 border border-white/20">
                  <div className="flex items-center gap-1.5 text-xs font-black font-display">
                    <span className="material-symbols-outlined text-base">store</span>
                    <span>Barra 2 (Entregas)</span>
                  </div>
                  <span className="text-xs text-orange-100 font-semibold mt-0.5">
                    Turno {currentOrder.ticketNumber} aquí
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white text-stone-500 text-xs font-semibold border border-stone-200">
                  Barra 3: Bebidas Frías
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs text-stone-600 font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="font-bold text-stone-900">Mostrador Express Activado</span>
                </div>
                <span className="text-stone-500">Distancia aproximada: 2 min a pie</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & History (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col gap-3">
            <h3 className="font-display text-base font-bold text-stone-900">Acciones Rápidas</h3>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setShowReceipt(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 transition-all text-left border border-stone-200 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">download</span>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold">Ver Comprobante Digital</span>
                    <span className="text-xs text-stone-500">
                      Recibo oficial del campus
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-stone-400 text-base">chevron_right</span>
              </button>

              <button
                onClick={() => showToast('Retraso de 10 min notificado a la Barra 2.')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 transition-all text-left border border-stone-200 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">schedule</span>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold">Notificar retraso a cafetería</span>
                    <span className="text-xs text-stone-500">
                      Llegaré 5 o 10 min más tarde
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-stone-400 text-base">chevron_right</span>
              </button>

              <button
                onClick={() => showToast('Conectando con el encargado de cafetería...')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 transition-all text-left border border-stone-200 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-stone-700 text-xl">help_outline</span>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold">Soporte en Vivo del Mostrador</span>
                    <span className="text-xs text-stone-500">
                      Kiosco Central Edificio B
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-stone-400 text-base">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Green Points Banner */}
          <div className="bg-emerald-50 p-6 rounded-3xl shadow-xs border border-emerald-200 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-200 text-emerald-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-xs sm:text-sm font-bold text-emerald-900">
                ¡Tu pedido sumó {currentOrder.loyaltyPoints} Puntos Verdes!
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Por haber pedido vaso compostable. Canjea tus puntos acumulados en la cafetería central por snacks gratis.
              </p>
            </div>
          </div>

          {/* All Orders History */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-stone-900">Historial Reciente</h3>
              <span className="text-xs text-stone-500 font-bold">
                {allOrders.length} registros
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
              {allOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setActiveOrder(ord)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                    ord.id === currentOrder.id
                      ? 'bg-orange-50/50 border-secondary ring-1 ring-secondary shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-900 text-xs font-bold">
                      <span className="material-symbols-outlined text-lg">
                        {ord.status === 'DELIVERED' ? 'check_circle' : 'pending'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        Pedido #{ord.id} ({ord.ticketNumber})
                      </span>
                      <span className="text-xs text-stone-500">
                        {ord.items.length} {ord.items.length === 1 ? 'producto' : 'productos'} • {ord.statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-xs sm:text-sm font-black text-stone-900 block">
                      {ord.formattedTotal}
                    </span>
                    <span className="text-xs text-secondary font-bold">
                      {ord.status === 'DELIVERED' ? 'Completado' : 'Ver Turno'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {showReceipt && (
        <ReceiptModal order={currentOrder} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}
