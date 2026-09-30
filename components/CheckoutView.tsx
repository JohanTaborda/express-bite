'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { PaymentType } from '@/lib/clean-architecture/domain/value-objects/PaymentMethod';
import { CreateOrderInputDTO } from '@/lib/clean-architecture/application/dtos/OrderDTO';

export function CheckoutView() {
  const {
    items,
    updateQuantity,
    subtotal,
    discount,
    total,
    formattedSubtotal,
    formattedDiscount,
    formattedTotal,
    studentBalance,
    rechargeBalance,
    clearCart,
    setActiveOrder,
    setActiveTab,
    refreshOrders,
    showToast,
  } = useCart();

  const [pickupLocation, setPickupLocation] = useState<'counter-b2' | 'locker-04'>('counter-b2');
  const [pickupTimeMode, setPickupTimeMode] = useState<'NOW' | 'SCHEDULED'>('NOW');
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>('CARNE_ESTUDIANTIL');
  const [instructions, setInstructions] = useState<string>('');
  const [autoReload, setAutoReload] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset chips for barista notes
  const presetChips = [
    'Vaso térmico reutilizable propio',
    'Empaque para llevar a clase',
    'Servilletas extra',
    'Sin azúcar añadido',
  ];

  const handleAddPreset = (chip: string) => {
    if (!instructions.includes(chip)) {
      setInstructions((prev) => (prev ? `${prev}, ${chip}` : chip));
    }
  };

  // Submit order through Clean Architecture backend
  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      setErrorMessage('No hay productos en el carrito para procesar.');
      return;
    }

    if (paymentMethod === 'CARNE_ESTUDIANTIL' && studentBalance < total) {
      setErrorMessage(
        `Saldo insuficiente en tu carné universitario ($${studentBalance.toLocaleString('es-CO')}). Por favor recarga o selecciona tarjeta.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: CreateOrderInputDTO = {
      studentName: 'Sofía Mendoza',
      studentId: '2021-4892',
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        customizations: i.customizations,
      })),
      pickupStationId: pickupLocation,
      paymentType: paymentMethod,
      instructions: instructions || undefined,
      pickupTimeMode,
      scheduledTime: pickupTimeMode === 'SCHEDULED' ? '11:15 AM' : undefined,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al procesar el pedido.');
      }

      // Success
      clearCart();
      await refreshOrders();
      setActiveOrder(json.data);
      showToast(`¡Pedido confirmado! Turno asignado: ${json.data.ticketNumber}`);
      setActiveTab('mis-pedidos');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado al crear el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is empty, show welcoming prompt
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-surface-container flex items-center justify-center text-primary mb-4">
          <span className="material-symbols-outlined text-4xl">shopping_cart</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-primary mb-2">
          Tu carrito de compras está vacío
        </h2>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-6">
          Agrega tus bebidas favoritas, sándwiches o combos estudiantiles desde el catálogo para continuar al checkout.
        </p>
        <button
          onClick={() => setActiveTab('menu-y-catalogo')}
          className="px-6 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-[#8e3312] transition-transform active:scale-95 shadow-md"
        >
          Explorar Menú de Cafetería
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      {/* Breadcrumb & Session Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <button
            onClick={() => setActiveTab('menu-y-catalogo')}
            className="hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Volver al Menú</span>
          </button>
          <span>/</span>
          <span className="text-on-surface font-bold">Caja &amp; Checkout Express</span>
        </div>

        <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1 rounded-full border border-surface-container-high text-xs">
          <span className="material-symbols-outlined text-secondary text-sm animate-pulse">timer</span>
          <span className="text-on-surface-variant">Turno prioritario en barra:</span>
          <span className="text-secondary font-bold font-display">09:42 min</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">error</span>
            <span>{errorMessage}</span>
          </div>
          {paymentMethod === 'CARNE_ESTUDIANTIL' && studentBalance < total && (
            <button
              onClick={() => rechargeBalance(20000)}
              className="px-3 py-1 rounded-lg bg-secondary text-white text-xs font-bold shrink-0 hover:bg-[#8e3312]"
            >
              Recargar +$20.000 ahora
            </button>
          )}
        </div>
      )}

      {/* Main 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Methods (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* STEP 1: Campus Pickup Destination */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs border border-surface-container-high">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h2 className="font-display text-lg font-bold text-on-surface">
                  Punto de Recogida &amp; Entrega
                </h2>
              </div>
              <span className="text-xs bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full font-semibold">
                Campus Central
              </span>
            </div>

            {/* Station Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Option 1: Mostrador Express */}
              <label
                onClick={() => setPickupLocation('counter-b2')}
                className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  pickupLocation === 'counter-b2'
                    ? 'bg-surface-container-low border-secondary shadow-xs ring-1 ring-secondary'
                    : 'bg-surface-container-lowest border-surface-container-high hover:border-outline'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-surface-container text-primary">
                    <span className="material-symbols-outlined">storefront</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      pickupLocation === 'counter-b2' ? 'bg-secondary text-white' : 'bg-surface-container text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">check</span>
                  </div>
                </div>
                <span className="font-display text-sm font-bold text-on-surface mb-0.5">
                  Mostrador Express - Barra 2
                </span>
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  Cafetería Central - Edificio B (Frente a Plazoleta)
                </span>
                <span className="mt-2 text-xs text-secondary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">bolt</span> Fila prioritaria estudiantes
                </span>
              </label>

              {/* Option 2: Smart Locker */}
              <label
                onClick={() => setPickupLocation('locker-04')}
                className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  pickupLocation === 'locker-04'
                    ? 'bg-surface-container-low border-secondary shadow-xs ring-1 ring-secondary'
                    : 'bg-surface-container-lowest border-surface-container-high hover:border-outline'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-surface-container text-primary">
                    <span className="material-symbols-outlined">lock_clock</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      pickupLocation === 'locker-04' ? 'bg-secondary text-white' : 'bg-surface-container text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">check</span>
                  </div>
                </div>
                <span className="font-display text-sm font-bold text-on-surface mb-0.5">
                  Casillero Térmico #04
                </span>
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  Locker Inteligente Edif. B (Retira con código QR / Carné)
                </span>
                <span className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">thermostat</span> Mantendrá café caliente
                </span>
              </label>
            </div>

            {/* Timing selection */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">schedule</span>
                <div>
                  <p className="text-xs font-bold text-on-surface">Momento de entrega:</p>
                  <p className="text-[11px] text-on-surface-variant">Cocina operando a ritmo óptimo</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-surface-container-highest p-1 rounded-lg w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPickupTimeMode('NOW')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex-1 sm:flex-initial ${
                    pickupTimeMode === 'NOW'
                      ? 'bg-surface-container-lowest text-secondary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Lo antes posible (~10 min)
                </button>
                <button
                  type="button"
                  onClick={() => setPickupTimeMode('SCHEDULED')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 sm:flex-initial ${
                    pickupTimeMode === 'SCHEDULED'
                      ? 'bg-surface-container-lowest text-secondary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Al salir de clase (11:15 AM)
                </button>
              </div>
            </div>
          </section>

          {/* STEP 2: Payment Method Choice */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs border border-surface-container-high">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h2 className="font-display text-lg font-bold text-on-surface">
                  Método de Pago
                </h2>
              </div>
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-secondary">security</span>
                Conexión Segura SSL
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* METHOD 1: Saldo Carné Universitario (Default & 10% discount) */}
              <div
                onClick={() => setPaymentMethod('CARNE_ESTUDIANTIL')}
                className={`rounded-xl transition-all duration-200 overflow-hidden cursor-pointer border ${
                  paymentMethod === 'CARNE_ESTUDIANTIL'
                    ? 'bg-surface-container-low border-secondary ring-1 ring-secondary'
                    : 'bg-surface-container-lowest border-surface-container-high hover:border-outline'
                }`}
              >
                <div className="p-4 flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                      paymentMethod === 'CARNE_ESTUDIANTIL'
                        ? 'bg-secondary text-white'
                        : 'bg-surface-container text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs font-bold">check</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-secondary">badge</span>
                        <span className="font-display text-sm font-bold text-on-surface">
                          Saldo Carné Universitario
                        </span>
                      </div>
                      <span className="text-[11px] bg-secondary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Recomendado • -10% Dcto
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Debitado de la cuenta de Sofía Mendoza (ID: 2021-4892)
                    </p>

                    {/* Balance stats */}
                    <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-surface-container-lowest rounded-xl border border-surface-container">
                      <div className="p-1 text-left">
                        <span className="block text-[11px] text-on-surface-variant">Saldo disponible:</span>
                        <span className="font-display text-xs sm:text-sm text-primary font-bold">
                          ${studentBalance.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="p-1 text-left">
                        <span className="block text-[11px] text-on-surface-variant">Debitado en orden:</span>
                        <span className="font-display text-xs sm:text-sm text-secondary font-bold">
                          -${total.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="p-1 text-left bg-surface-container-high/60 rounded-lg">
                        <span className="block text-[11px] text-on-surface-variant font-medium">Restante:</span>
                        <span className="font-display text-xs sm:text-sm text-on-surface font-bold">
                          ${Math.max(0, studentBalance - total).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-1">
                      <input
                        type="checkbox"
                        id="auto_reload"
                        checked={autoReload}
                        onChange={(e) => setAutoReload(e.target.checked)}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer"
                      />
                      <label htmlFor="auto_reload" className="text-xs text-on-surface-variant cursor-pointer select-none">
                        Recargar automáticamente $20.000 con débito registrado si el saldo cae bajo $5.000
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* METHOD 2: Tarjeta Débito / Crédito */}
              <div
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`rounded-xl transition-all duration-200 overflow-hidden cursor-pointer border ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-surface-container-low border-secondary ring-1 ring-secondary'
                    : 'bg-surface-container-lowest border-surface-container-high hover:border-outline'
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'CREDIT_CARD'
                          ? 'bg-secondary text-white'
                          : 'bg-surface-container text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">credit_card</span>
                      <span className="font-display text-sm font-semibold text-on-surface">
                        Tarjeta Débito / Crédito
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] font-bold">
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded">VISA</span>
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded">MASTERCARD</span>
                  </div>
                </div>

                {paymentMethod === 'CREDIT_CARD' && (
                  <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-surface-container">
                    <div>
                      <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        defaultValue="4000 1234 5678 9010"
                        className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-xs text-on-surface border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
                          Vencimiento
                        </label>
                        <input
                          type="text"
                          defaultValue="08/28"
                          className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-xs text-on-surface border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
                          CVC
                        </label>
                        <input
                          type="password"
                          defaultValue="382"
                          className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-xs text-on-surface border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* METHOD 3: Pagos Móviles / QR */}
              <div
                onClick={() => setPaymentMethod('MOBILE_QR')}
                className={`rounded-xl transition-all duration-200 overflow-hidden cursor-pointer border ${
                  paymentMethod === 'MOBILE_QR'
                    ? 'bg-surface-container-low border-secondary ring-1 ring-secondary'
                    : 'bg-surface-container-lowest border-surface-container-high hover:border-outline'
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'MOBILE_QR'
                          ? 'bg-secondary text-white'
                          : 'bg-surface-container text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
                      <span className="font-display text-sm font-semibold text-on-surface">
                        Pagos Móviles / QR (Nequi, PSE, Daviplata)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <span className="bg-[#eec1a4]/40 text-primary px-2 py-0.5 rounded">Nequi</span>
                    <span className="bg-[#fe8357]/20 text-secondary px-2 py-0.5 rounded">Daviplata</span>
                  </div>
                </div>

                {paymentMethod === 'MOBILE_QR' && (
                  <div className="px-4 pb-4 pt-1 text-xs text-on-surface-variant border-t border-surface-container">
                    <div className="p-2.5 bg-surface-container-lowest rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-xl">phonelink_ring</span>
                      <span>Se generará la notificación push o cobro instantáneo a tu línea vinculada.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* METHOD 4: Digital Wallets */}
              <div
                onClick={() => setPaymentMethod('DIGITAL_WALLET')}
                className={`rounded-xl transition-all duration-200 overflow-hidden cursor-pointer border ${
                  paymentMethod === 'DIGITAL_WALLET'
                    ? 'bg-surface-container-low border-secondary ring-1 ring-secondary'
                    : 'bg-surface-container-lowest border-surface-container-high hover:border-outline'
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'DIGITAL_WALLET'
                          ? 'bg-secondary text-white'
                          : 'bg-surface-container text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                      <span className="font-display text-sm font-semibold text-on-surface">
                        Billeteras Digitales
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                    <span>Apple Pay</span>
                    <span className="text-outline-variant">•</span>
                    <span>G Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3: Barista Instructions */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs border border-surface-container-high">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <h2 className="font-display text-lg font-bold text-on-surface">
                Instrucciones para la Cocina / Baristas
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">
              ¿Requieres especificaciones térmicas, empaque para llevar a clase o intolerancias?
            </p>

            <div className="relative">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value.slice(0, 150))}
                rows={2}
                maxLength={150}
                placeholder="Ej: Café con leche deslactosada bien caliente; sándwich prensado sin mayonesa..."
                className="w-full bg-surface-container-low p-3 rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container resize-none"
              ></textarea>
              <span className="absolute bottom-2 right-3 text-[10px] text-outline">
                {instructions.length}/150
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {presetChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAddPreset(chip)}
                  className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors border border-surface-container-high"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Execution Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="bg-surface-container-low rounded-2xl p-5 sm:p-6 shadow-xs border border-surface-container flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
                  Tu Bandeja de Hoy
                </span>
                <h3 className="font-display text-lg font-bold text-primary">
                  Resumen del Pedido
                </h3>
              </div>
              <span className="bg-primary text-white text-xs px-2.5 py-1 rounded-full font-bold">
                {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>

            {/* Product Item List */}
            <div className="flex flex-col gap-3 py-3 divide-y divide-surface-container-high max-h-64 overflow-y-auto pr-1">
              {items.map((cartItem) => (
                <div key={cartItem.product.id} className="pt-2 first:pt-0 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high shrink-0 border border-surface-container">
                    <Image
                      src={cartItem.product.imageUrl}
                      alt={cartItem.product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-display text-xs font-bold text-on-surface truncate">
                        {cartItem.product.name}
                      </h4>
                      <span className="font-display text-xs font-bold text-primary shrink-0">
                        ${(cartItem.product.price * cartItem.quantity).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {cartItem.customizations || `${cartItem.product.calories} kcal`}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 bg-surface-container-lowest px-1.5 py-0.5 rounded border border-surface-container-high">
                        <button
                          onClick={() => updateQuantity(cartItem.product.id, cartItem.quantity - 1)}
                          className="w-4 h-4 text-xs font-bold text-on-surface-variant hover:text-secondary"
                        >
                          -
                        </button>
                        <span className="text-[11px] font-bold px-1">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartItem.product.id, cartItem.quantity + 1)}
                          className="w-4 h-4 text-xs font-bold text-on-surface-variant hover:text-secondary"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[10px] text-secondary font-semibold">
                        {cartItem.product.calories * cartItem.quantity} kcal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="mt-3 p-3.5 bg-surface-container-lowest rounded-xl border border-surface-container flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Subtotal Productos</span>
                <span className="font-semibold text-on-surface">{formattedSubtotal}</span>
              </div>
              <div className="flex items-center justify-between text-secondary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">local_offer</span>
                  <span>Descuento Carné Estudiantil (10%)</span>
                </span>
                <span className="font-bold">{formattedDiscount}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Tarifa Servicio Digital Campus</span>
                <span className="text-on-surface-variant font-medium">$0 (Exento)</span>
              </div>
              <div className="my-1 h-0.5 bg-surface-container"></div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="block font-display text-sm font-bold text-on-surface">
                    Total a Pagar
                  </span>
                  <span className="text-[10px] text-on-surface-variant">IVA e impuestos incluidos</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-secondary font-bold leading-tight">
                    {formattedTotal}
                  </span>
                  <span className="block text-[10px] text-on-surface-variant uppercase">COP</span>
                </div>
              </div>
            </div>

            {/* Loyalty points card */}
            <div className="mt-3 p-2.5 bg-surface-container rounded-xl flex items-center justify-between border border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-sm">stars</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    Puntos Quick-Bite
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    Nivel Estudiante Frecuente
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-secondary font-display">
                +{Math.floor(total / 100)} pts
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmOrder}
                className="w-full py-4 px-4 rounded-xl bg-secondary text-white font-display text-sm font-bold shadow-md hover:bg-[#8e3312] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    <span>Procesando cargo seguro...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                      lock
                    </span>
                    <span>Confirmar y Pagar Pedido ({formattedTotal})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-center text-on-surface-variant text-[11px]">
                <span className="material-symbols-outlined text-xs text-secondary">verified_user</span>
                <span>Garantía: Listo a la hora programada o crédito de cortesía.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
