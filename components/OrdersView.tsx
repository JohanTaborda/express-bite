'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { OrderOutputDTO } from '@/lib/clean-architecture/application/dtos/OrderDTO';
import { OrderStatus } from '@/lib/clean-architecture/domain/value-objects/OrderStatus';
import { ReceiptModal } from './ReceiptModal';

export function OrdersView() {
  const {
    activeOrder,
    setActiveOrder,
    allOrders,
    refreshOrders,
    showToast,
    addItem,
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
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido? Se reembolsará el saldo.')) {
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
      showToast('Pedido cancelado y reembolsado con éxito.');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-2">
          receipt_long
        </span>
        <h2 className="font-display text-2xl font-bold text-primary mb-2">
          No tienes pedidos registrados
        </h2>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
          Realiza tu primera orden desde el menú para darle seguimiento en vivo.
        </p>
        <button
          onClick={() => setActiveTab('menu-y-catalogo')}
          className="px-6 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-[#8e3312]"
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
    { number: 3, label: '3. Listo', sub: 'En mostrador para retiro', status: 'READY' },
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
      <div className="relative overflow-hidden rounded-2xl bg-surface-container p-6 sm:p-8 shadow-xs border border-surface-container-high">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs ${
                  currentOrder.status === 'READY'
                    ? 'bg-[#2E6B47] text-white'
                    : currentOrder.status === 'CANCELLED'
                    ? 'bg-error text-white'
                    : 'bg-secondary text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                {currentOrder.statusLabel}
              </span>
              <span className="text-xs text-on-surface-variant font-semibold">
                Orden #{currentOrder.id}
              </span>
              <span className="text-outline-variant">•</span>
              <span className="text-xs text-secondary font-semibold">
                {currentOrder.pickupStation.name}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight mt-1">
              {currentOrder.status === 'READY'
                ? '¡Tu pedido está listo para recoger!'
                : currentOrder.status === 'DELIVERED'
                ? '¡Pedido entregado con éxito! ¡Buen provecho!'
                : currentOrder.status === 'CANCELLED'
                ? 'Pedido Cancelado'
                : '¡Tu pedido está en marcha en cocina!'}
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              {currentOrder.status === 'READY' ? (
                <>Acércate ahora mismo a la <strong className="text-secondary">Barra 2 (Entregas Express)</strong> con tu turno <strong className="text-primary font-display">{currentOrder.ticketNumber}</strong>.</>
              ) : currentOrder.status === 'DELIVERED' ? (
                <>Has acumulado <strong className="text-secondary">+{currentOrder.loyaltyPoints} Puntos Quick-Bite</strong> en tu carné universitario.</>
              ) : currentOrder.status === 'CANCELLED' ? (
                <>El importe ha sido reintegrado a tu saldo institucional.</>
              ) : (
                <>Estará listo en aproximadamente <strong className="text-secondary">6 minutos</strong> en la <strong className="text-primary">Barra 2 (Entregas Express)</strong>.</>
              )}
            </p>
          </div>

          {/* Timing Pill */}
          <div className="flex items-center gap-3 bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-surface-container-high self-start lg:self-center shrink-0">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                timer
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Hora estimada de retiro
              </span>
              <span className="font-display text-lg font-bold text-on-surface">
                {new Date(currentOrder.estimatedReadyAt).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-[11px] text-secondary font-medium">Turno: {currentOrder.ticketNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-State Stepper */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-xs border border-surface-container-high">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-[11px] uppercase text-on-surface-variant tracking-wider font-bold">
              Fases del Pedido en Tiempo Real
            </span>
            <h2 className="font-display text-xl text-primary font-bold">
              Progreso de la Orden
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 text-on-surface-variant text-xs bg-surface-container px-3 py-1 rounded-full border border-surface-container-high">
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
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-secondary-fixed/30 border-secondary ring-1 ring-secondary shadow-xs'
                    : isCompleted
                    ? 'bg-surface-container-low border-surface-container'
                    : 'bg-surface-container-low/40 border-transparent opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-secondary text-white animate-pulse'
                      : isCompleted
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-lg">check</span>
                  ) : (
                    st.number
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-display text-xs font-bold leading-snug ${
                      isCurrent ? 'text-secondary' : 'text-on-surface'
                    }`}
                  >
                    {st.label}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">{st.sub}</span>
                  {isCurrent && (
                    <span className="text-[10px] text-secondary font-bold mt-0.5">En curso ahora</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean Architecture Barista Simulation Station */}
        <div className="mt-6 pt-5 border-t border-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-surface-container-low/50 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">coffee_maker</span>
            <div>
              <span className="text-xs font-bold text-primary block">
                Simulador Barista (Demostración Clean Architecture):
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Ejecuta las transiciones de estado a través de los casos de uso del dominio:
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentOrder.status === 'RECEIVED' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('PREPARING')}
                className="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-[#8e3312] transition-colors"
              >
                Pasar a &quot;En Proceso&quot;
              </button>
            )}
            {currentOrder.status === 'PREPARING' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('READY')}
                className="px-3 py-1.5 rounded-lg bg-[#2E6B47] text-white text-xs font-bold hover:bg-[#245437] transition-colors"
              >
                Avanzar a &quot;Listo en Barra&quot;
              </button>
            )}
            {currentOrder.status === 'READY' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('DELIVERED')}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors"
              >
                Marcar como &quot;Entregado&quot;
              </button>
            )}
            {currentOrder.canBeCancelled && (
              <button
                disabled={isUpdatingStatus}
                onClick={handleCancelOrder}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-on-surface-variant text-xs font-semibold transition-colors"
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
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-md border border-surface-container-high overflow-hidden flex flex-col sm:flex-row">
            {/* Punch notch effect */}
            <div className="hidden sm:block absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-surface border-r border-surface-container-high -translate-y-1/2 z-20"></div>
            <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-surface border-l border-surface-container-high -translate-y-1/2 z-20"></div>

            {/* Left side: Turn Code & QR */}
            <div className="sm:w-5/12 bg-primary text-white p-6 flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-widest text-primary-fixed-dim font-bold">
                  Turno de Retiro
                </span>
                <div className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white my-1">
                  {currentOrder.ticketNumber}
                </div>
                <span className="text-[11px] bg-primary-container text-white px-2.5 py-0.5 rounded-full font-semibold">
                  {currentOrder.pickupStation.name}
                </span>
              </div>

              {/* Styled SVG QR Code */}
              <div className="bg-white p-2.5 rounded-xl my-4 shadow-xs">
                <svg className="w-28 h-28 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
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

              <p className="text-[11px] text-primary-fixed-dim">
                Presenta este código frente al escáner al escuchar tu turno.
              </p>
            </div>

            {/* Right side: Items breakdown */}
            <div className="sm:w-7/12 p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    Detalle de Preparación
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-container font-semibold">
                    {currentOrder.items.length} {currentOrder.items.length === 1 ? 'artículo' : 'artículos'}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {item.quantity}x
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-on-surface">
                            {item.productName}
                          </span>
                          {item.customizations && (
                            <span className="text-[10px] text-on-surface-variant line-clamp-1">
                              {item.customizations}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-display text-xs font-bold text-on-surface shrink-0">
                        {item.formattedSubtotal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">badge</span>
                  <span className="text-xs text-on-surface font-semibold">
                    {currentOrder.paymentMethod.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-display text-sm font-bold text-primary block">
                    {currentOrder.formattedTotal}
                  </span>
                  <span className="text-[10px] text-secondary font-bold">Pagado con éxito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campus Station Schematic Layout */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-xs border border-surface-container-high flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">pin_drop</span>
                <h3 className="font-display text-base font-bold text-primary">
                  Punto de Recogida en Campus
                </h3>
              </div>
              <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full">
                Piso 1 • Patio Central
              </span>
            </div>

            {/* Architectural schematic */}
            <div className="relative w-full h-44 rounded-xl bg-surface-container overflow-hidden p-4 flex flex-col justify-between border border-surface-container-high">
              <div className="relative z-10 flex items-center justify-between text-[11px] text-on-surface-variant">
                <span className="bg-surface-container-lowest px-2 py-0.5 rounded font-semibold shadow-xs">
                  Acceso Principal Edificio B
                </span>
                <span className="bg-surface-container-lowest px-2 py-0.5 rounded shadow-xs">
                  Conexión a Biblioteca
                </span>
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-2 my-auto text-center">
                <div className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant text-[11px] opacity-60">
                  Barra 1: Almuerzos
                </div>
                <div className="p-2.5 rounded-xl bg-secondary text-white shadow-md flex flex-col items-center justify-center transform scale-105 border border-white/20">
                  <div className="flex items-center gap-1 text-xs font-bold font-display">
                    <span className="material-symbols-outlined text-sm">store</span>
                    <span>Barra 2 (Retiro)</span>
                  </div>
                  <span className="text-[10px] text-secondary-fixed">
                    Tu orden {currentOrder.ticketNumber} aquí
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant text-[11px] opacity-60">
                  Barra 3: Bebidas Frías
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="font-semibold text-on-surface">Mostrador Express Activado</span>
                </div>
                <span className="text-outline">Distancia estimada: 2 min a pie desde Aulario</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & History (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-surface-container-high flex flex-col gap-3">
            <h3 className="font-display text-base font-bold text-primary">Acciones Rápidas</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-all text-left border border-surface-container"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">download</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Ver Comprobante Digital</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Recibo oficial universitario
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-base">chevron_right</span>
              </button>

              <button
                onClick={() => showToast('Retraso de 10 min notificado a la Barra 2.')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-all text-left border border-surface-container"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">schedule</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Notificar retraso a cafetería</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Llegaré 5 o 10 min más tarde
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-base">chevron_right</span>
              </button>

              <button
                onClick={() => showToast('Conectando con el encargado de cafetería...')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-all text-left border border-surface-container"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">help_outline</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Soporte en Vivo del Mostrador</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Kiosco Central Edificio B
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-base">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Green Points Banner */}
          <div className="bg-gradient-to-br from-surface-container-low to-surface-container p-5 rounded-2xl shadow-xs border border-surface-container flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">eco</span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-bold text-on-surface">
                ¡Tu pedido sumó {currentOrder.loyaltyPoints} Puntos Verdes!
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Por haber pedido vaso compostable. Canjea tus puntos acumulados en la cafetería central por snacks gratis.
              </p>
            </div>
          </div>

          {/* All Orders History */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-surface-container-high flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-primary">Historial Reciente</h3>
              <span className="text-xs text-on-surface-variant font-medium">
                {allOrders.length} registros
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {allOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setActiveOrder(ord)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                    ord.id === currentOrder.id
                      ? 'bg-surface-container border-secondary ring-1 ring-secondary'
                      : 'bg-surface-container-low hover:bg-surface-container border-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary text-xs">
                      <span className="material-symbols-outlined text-base">
                        {ord.status === 'DELIVERED' ? 'check_circle' : 'pending'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface">
                        Pedido #{ord.id} ({ord.ticketNumber})
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {ord.items.length} {ord.items.length === 1 ? 'artículo' : 'artículos'} • {ord.statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-xs font-bold text-on-surface block">
                      {ord.formattedTotal}
                    </span>
                    <span className="text-[10px] text-secondary font-semibold">
                      {ord.status === 'DELIVERED' ? 'Completado' : 'Ver turno'}
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
