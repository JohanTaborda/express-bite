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

  // Quick preset chips for barista notes in Spanish
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
      studentName: 'Johan David Taborda',
      studentId: '2024-1088',
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-primary mb-4">
          <span className="material-symbols-outlined text-4xl text-secondary">shopping_cart</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">
          Tu carrito de compras está vacío
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 leading-relaxed">
          Agrega tus bebidas favoritas, sándwiches o combos estudiantiles desde el catálogo para continuar al checkout.
        </p>
        <button
          onClick={() => setActiveTab('menu-y-catalogo')}
          className="px-6 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-orange-700 transition-transform active:scale-95 shadow-md"
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
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button
            onClick={() => setActiveTab('menu-y-catalogo')}
            className="hover:text-primary transition-colors flex items-center gap-1 font-bold text-stone-700"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Volver al Menú</span>
          </button>
          <span>/</span>
          <span className="text-stone-900 font-bold">Caja y Pago Express</span>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-stone-200 shadow-xs text-xs">
          <span className="material-symbols-outlined text-secondary text-base animate-pulse">timer</span>
          <span className="text-stone-600 font-medium">Turno prioritario en barra:</span>
          <span className="text-secondary font-bold font-display">09:42 min</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-red-600">error</span>
            <span>{errorMessage}</span>
          </div>
          {paymentMethod === 'CARNE_ESTUDIANTIL' && studentBalance < total && (
            <button
              onClick={() => rechargeBalance(20000)}
              className="px-3.5 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold shrink-0 hover:bg-orange-700 shadow-xs"
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
          <section className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h2 className="font-display text-lg font-bold text-stone-900">
                  Punto de Recogida y Entrega
                </h2>
              </div>
              <span className="text-xs bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-bold">
                Campus Central
              </span>
            </div>

            {/* Station Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
              {/* Option 1: Mostrador Express */}
              <div
                onClick={() => setPickupLocation('counter-b2')}
                className={`relative flex flex-col p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  pickupLocation === 'counter-b2'
                    ? 'bg-orange-50/50 border-secondary ring-1 ring-secondary shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-800">
                    <span className="material-symbols-outlined">storefront</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      pickupLocation === 'counter-b2' ? 'bg-secondary text-white' : 'bg-stone-200 text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs font-bold">check</span>
                  </div>
                </div>
                <span className="font-display text-sm font-bold text-stone-900 mb-0.5">
                  Mostrador Express - Barra 2
                </span>
                <span className="text-xs text-stone-600 leading-relaxed">
                  Cafetería Central - Edificio B (Frente a Plazoleta)
                </span>
                <span className="mt-2 text-xs text-secondary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">bolt</span> Fila prioritaria estudiantes
                </span>
              </div>

              {/* Option 2: Smart Locker */}
              <div
                onClick={() => setPickupLocation('locker-04')}
                className={`relative flex flex-col p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  pickupLocation === 'locker-04'
                    ? 'bg-orange-50/50 border-secondary ring-1 ring-secondary shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-xl bg-stone-100 text-stone-800">
                    <span className="material-symbols-outlined">lock_clock</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      pickupLocation === 'locker-04' ? 'bg-secondary text-white' : 'bg-stone-200 text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs font-bold">check</span>
                  </div>
                </div>
                <span className="font-display text-sm font-bold text-stone-900 mb-0.5">
                  Casillero Térmico #04
                </span>
                <span className="text-xs text-stone-600 leading-relaxed">
                  Locker Inteligente Edificio B (Retiro con código QR o Carné)
                </span>
                <span className="mt-2 text-xs text-stone-700 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">thermostat</span> Mantendrá café caliente
                </span>
              </div>
            </div>

            {/* Timing selection */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-xl">schedule</span>
                <div>
                  <p className="text-xs font-bold text-stone-900">Momento de entrega:</p>
                  <p className="text-xs text-stone-500">Cocina operando a ritmo óptimo</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPickupTimeMode('NOW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial ${
                    pickupTimeMode === 'NOW'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Lo antes posible (~10 min)
                </button>
                <button
                  type="button"
                  onClick={() => setPickupTimeMode('SCHEDULED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial ${
                    pickupTimeMode === 'SCHEDULED'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Al salir de clase (11:15 AM)
                </button>
              </div>
            </div>
          </section>

          {/* STEP 2: Payment Method Choice */}
          <section className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h2 className="font-display text-lg font-bold text-stone-900">
                  Método de Pago
                </h2>
              </div>
              <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                <span className="material-symbols-outlined text-sm text-secondary">security</span>
                Conexión Segura SSL
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* METHOD 1: Saldo Carné Universitario */}
              <div
                onClick={() => setPaymentMethod('CARNE_ESTUDIANTIL')}
                className={`rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer border ${
                  paymentMethod === 'CARNE_ESTUDIANTIL'
                    ? 'bg-orange-50/40 border-secondary ring-1 ring-secondary shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-start gap-3.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                      paymentMethod === 'CARNE_ESTUDIANTIL'
                        ? 'bg-secondary text-white'
                        : 'bg-stone-200 text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs font-bold">check</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-lg">badge</span>
                        <span className="font-display text-sm font-bold text-stone-900">
                          Saldo Carné Universitario
                        </span>
                      </div>
                      <span className="text-xs bg-secondary text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Recomendado • 10% Descuento
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Debitado de la cuenta de <strong>Johan David Taborda</strong> (ID: 2024-1088)
                    </p>

                    {/* Balance stats */}
                    <div className="grid grid-cols-3 gap-2.5 mt-3 p-3 bg-white rounded-xl border border-stone-200">
                      <div className="p-1 text-left">
                        <span className="block text-[11px] text-stone-500 font-bold uppercase">Saldo Disponible:</span>
                        <span className="font-display text-xs sm:text-sm text-stone-900 font-extrabold">
                          ${studentBalance.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="p-1 text-left">
                        <span className="block text-[11px] text-stone-500 font-bold uppercase">Debitado en Orden:</span>
                        <span className="font-display text-xs sm:text-sm text-secondary font-extrabold">
                          -${total.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="p-1 text-left bg-stone-50 rounded-lg">
                        <span className="block text-[11px] text-stone-500 font-bold uppercase">Restante:</span>
                        <span className="font-display text-xs sm:text-sm text-stone-900 font-extrabold">
                          ${Math.max(0, studentBalance - total).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-1">
                      <input
                        type="checkbox"
                        id="auto_reload"
                        checked={autoReload}
                        onChange={(e) => setAutoReload(e.target.checked)}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer"
                      />
                      <label htmlFor="auto_reload" className="text-xs text-stone-600 cursor-pointer select-none">
                        Recargar automáticamente $20.000 si el saldo cae bajo $5.000
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* METHOD 2: Tarjeta Débito / Crédito */}
              <div
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer border ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-orange-50/40 border-secondary ring-1 ring-secondary shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'CREDIT_CARD'
                          ? 'bg-secondary text-white'
                          : 'bg-stone-200 text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-stone-800">credit_card</span>
                      <span className="font-display text-sm font-bold text-stone-900">
                        Tarjeta Débito o Crédito
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600 text-xs font-bold">
                    <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">VISA</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">MASTERCARD</span>
                  </div>
                </div>

                {paymentMethod === 'CREDIT_CARD' && (
                  <div className="px-5 pb-5 pt-1 flex flex-col gap-3 border-t border-stone-200">
                    <div>
                      <label className="block text-xs text-stone-600 mb-1 font-bold">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        defaultValue="4000 1234 5678 9010"
                        className="w-full bg-white px-3 py-2 rounded-xl text-xs sm:text-sm text-stone-900 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-secondary/40 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-600 mb-1 font-bold">
                          Fecha de Vencimiento
                        </label>
                        <input
                          type="text"
                          defaultValue="08/28"
                          className="w-full bg-white px-3 py-2 rounded-xl text-xs sm:text-sm text-stone-900 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-secondary/40 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1 font-bold">
                          Código de Seguridad (CVC)
                        </label>
                        <input
                          type="password"
                          defaultValue="382"
                          className="w-full bg-white px-3 py-2 rounded-xl text-xs sm:text-sm text-stone-900 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-secondary/40 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* METHOD 3: Pagos Móviles / QR */}
              <div
                onClick={() => setPaymentMethod('MOBILE_QR')}
                className={`rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer border ${
                  paymentMethod === 'MOBILE_QR'
                    ? 'bg-orange-50/40 border-secondary ring-1 ring-secondary shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'MOBILE_QR'
                          ? 'bg-secondary text-white'
                          : 'bg-stone-200 text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-stone-800">qr_code_scanner</span>
                      <span className="font-display text-sm font-bold text-stone-900">
                        Pagos Móviles QR (Nequi, PSE, Daviplata)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded">Nequi</span>
                    <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded">Daviplata</span>
                  </div>
                </div>

                {paymentMethod === 'MOBILE_QR' && (
                  <div className="px-5 pb-4 pt-1 text-xs text-stone-600 border-t border-stone-200">
                    <div className="p-3 bg-stone-50 rounded-xl flex items-center gap-2.5 border border-stone-200">
                      <span className="material-symbols-outlined text-secondary text-2xl">phonelink_ring</span>
                      <span>Se generará una solicitud de pago instantáneo o código QR a tu aplicación bancaria.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* METHOD 4: Digital Wallets */}
              <div
                onClick={() => setPaymentMethod('DIGITAL_WALLET')}
                className={`rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer border ${
                  paymentMethod === 'DIGITAL_WALLET'
                    ? 'bg-orange-50/40 border-secondary ring-1 ring-secondary shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'DIGITAL_WALLET'
                          ? 'bg-secondary text-white'
                          : 'bg-stone-200 text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-stone-800">account_balance_wallet</span>
                      <span className="font-display text-sm font-bold text-stone-900">
                        Billeteras Digitales
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                    <span>Apple Pay</span>
                    <span className="text-stone-300">•</span>
                    <span>Google Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3: Barista Instructions */}
          <section className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <h2 className="font-display text-lg font-bold text-stone-900">
                Instrucciones para la Cocina o Baristas
              </h2>
            </div>
            <p className="text-xs text-stone-600 mb-3">
              ¿Requieres especificaciones dietéticas, empaque para llevar a clase o cubiertos ecológicos?
            </p>

            <div className="relative">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value.slice(0, 150))}
                rows={2}
                maxLength={150}
                placeholder="Ejemplo: Café con leche deslactosada bien caliente; sándwich prensado sin mayonesa por favor..."
                className="w-full bg-stone-50 p-3.5 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-stone-200 resize-none font-medium"
              ></textarea>
              <span className="absolute bottom-2.5 right-3 text-[11px] text-stone-400 font-medium">
                {instructions.length}/150
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {presetChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAddPreset(chip)}
                  className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-orange-100 hover:text-orange-900 transition-colors border border-stone-200"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Execution Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-secondary">
                  Tu Bandeja
                </span>
                <h3 className="font-display text-lg font-black text-stone-900">
                  Resumen de la Orden
                </h3>
              </div>
              <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            {/* Product Item List */}
            <div className="flex flex-col gap-3 py-3 divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
              {items.map((cartItem) => (
                <div key={cartItem.product.id} className="pt-2.5 first:pt-0 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
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
                      <h4 className="font-display text-xs sm:text-sm font-bold text-stone-900 truncate">
                        {cartItem.product.name}
                      </h4>
                      <span className="font-display text-xs sm:text-sm font-extrabold text-stone-900 shrink-0">
                        ${(cartItem.product.price * cartItem.quantity).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 truncate">
                      {cartItem.customizations || `${cartItem.product.calories} kcal`}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
                        <button
                          onClick={() => updateQuantity(cartItem.product.id, cartItem.quantity - 1)}
                          className="w-4 h-4 text-xs font-bold text-stone-600 hover:text-secondary"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1 text-stone-900">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartItem.product.id, cartItem.quantity + 1)}
                          className="w-4 h-4 text-xs font-bold text-stone-600 hover:text-secondary"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-orange-700 font-bold">
                        {cartItem.product.calories * cartItem.quantity} kcal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="mt-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span className="font-medium">Subtotal Productos</span>
                <span className="font-bold text-stone-900">{formattedSubtotal}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_offer</span>
                  <span>Descuento Carné Estudiantil (10%)</span>
                </span>
                <span>{formattedDiscount}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span className="font-medium">Tarifa Digital del Campus</span>
                <span className="text-emerald-700 font-bold">$0 (Exento)</span>
              </div>
              <div className="my-1 h-0.5 bg-stone-200"></div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="block font-display text-sm font-black text-stone-900">
                    Total a Pagar
                  </span>
                  <span className="text-xs text-stone-500 font-medium">Impuestos de ley incluidos</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-secondary font-black leading-tight">
                    {formattedTotal}
                  </span>
                  <span className="block text-xs text-stone-500 font-bold uppercase">Pesos (COP)</span>
                </div>
              </div>
            </div>

            {/* Loyalty points card */}
            <div className="mt-3 p-3 bg-stone-50 rounded-xl flex items-center justify-between border border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">stars</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-900 leading-tight">
                    Puntos Quick-Bite
                  </span>
                  <span className="text-xs text-stone-500">
                    Nivel Estudiante Frecuente
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-secondary font-display">
                +{Math.floor(total / 100)} pts
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmOrder}
                className="w-full py-4 px-4 rounded-xl bg-secondary text-white font-display text-sm font-black shadow-md hover:bg-orange-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    <span>Procesando pago seguro...</span>
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

              <div className="flex items-center justify-center gap-1.5 text-center text-stone-500 text-xs mt-1">
                <span className="material-symbols-outlined text-xs text-secondary">verified_user</span>
                <span>Garantía: Listo a la hora programada o saldo de cortesía.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
