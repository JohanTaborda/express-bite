'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ProductOutputDTO } from '@/lib/clean-architecture/application/dtos/OrderDTO';

const CATEGORIES = [
  { id: 'TODOS', label: 'Todos los Menús', icon: 'restaurant_menu' },
  { id: 'CAFE_ESPECIALIDAD', label: 'Café de Especialidad & Calientes', icon: 'coffee' },
  { id: 'BEBIDAS_FRIAS', label: 'Bebidas Frías & Frappés', icon: 'ac_unit' },
  { id: 'REPOSTERIA', label: 'Bakery & Repostería', icon: 'bakery_dining' },
  { id: 'SANDWICHES_SALADOS', label: 'Sándwiches & Salados', icon: 'lunch_dining' },
  { id: 'COMBOS_ESTUDIANTILES', label: 'Combos Estudiantiles (Ahorro)', icon: 'savings' },
];

export function CatalogView() {
  const {
    items,
    addItem,
    updateQuantity,
    totalItemCount,
    formattedSubtotal,
    formattedTotal,
    studentBalance,
    setActiveTab,
  } = useCart();

  const [products, setProducts] = useState<ProductOutputDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Fetch products from Clean Architecture API route
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'TODOS') {
          params.append('category', selectedCategory);
        }
        if (activeTag) {
          params.append('tag', activeTag);
        }
        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, activeTag]);

  // Client-side search filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Status Notification Ribbon */}
      <div className="w-full bg-surface-container-high px-4 sm:px-6 lg:px-8 py-2 text-on-surface-variant flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F4EC] text-[#2E6B47] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2E6B47] animate-pulse"></span>
            Cocina en Flujo Rápido (Espera &lt; 8 min)
          </span>
          <span className="hidden md:inline text-on-surface-variant">
            Punto de retiro activo: Mostrador A (Express &amp; Pickup)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-1 text-tertiary font-medium">
            <span className="material-symbols-outlined text-sm">bolt</span>
            Flash Pick-up: Ordena antes de las 11:45 para retiro sin fila
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container font-semibold text-primary">
            Edif. B • Piso 1
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Header */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="text-xs uppercase tracking-wider font-bold">
                Temporada de Parciales • Campus Vital
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-primary font-extrabold tracking-tight">
              ¡Hola, Sofía! ¿Qué se te antoja para recargar hoy?
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant">
              Pide desde tu móvil, salta la fila entre clases y aprovecha tu 10% de descuento con carné.
            </p>
          </div>

          {/* Station Selector */}
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl border border-surface-container shadow-xs self-start lg:self-center">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-xl">store</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant font-medium">Ubicación elegida</span>
              <span className="text-sm font-bold text-primary font-display">Cafetería Central - Edif. B</span>
            </div>
          </div>
        </section>

        {/* Search Bar & Instant Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-6">
          <div className="lg:col-span-8 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar café de especialidad, bocadillos, combos o intolerancias..."
              className="w-full pl-11 pr-20 py-3 bg-surface-container-lowest rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs border border-surface-container-high transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="lg:col-span-4 flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'Express', label: 'Express (< 5m)', icon: 'bolt', color: 'text-secondary' },
              { id: 'Vegetariano', label: 'Vegetariano', icon: 'eco', color: 'text-[#2E6B47]' },
              { id: 'Populares', label: 'Populares', icon: 'star', color: 'text-tertiary' },
            ].map((chip) => {
              const isActive = activeTag === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveTag(isActive ? null : chip.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold shadow-xs border transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border-surface-container-high'
                  }`}
                >
                  <span className={`material-symbols-outlined text-sm ${isActive ? 'text-white' : chip.color}`}>
                    {chip.icon}
                  </span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills Slider */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Explorar por Estación &amp; Tipo
            </span>
            <span className="text-xs text-secondary font-medium">
              {filteredProducts.length} opciones disponibles
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shadow-xs border ${
                    isSelected
                      ? 'bg-secondary text-white border-secondary font-bold'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Split Content: Catalog Main Grid (8 cols) + Sticky Order Tray (4 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-8 flex flex-col gap-8">
            {/* Promotional Hero Card: "Combo Parciales" */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-secondary text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/20">
              <div className="relative z-10 flex flex-col gap-2 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase text-primary-fixed self-start">
                  <span className="material-symbols-outlined text-sm">school</span>
                  Especial Semana de Parciales
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight">
                  Combo Parciales: Despierta tu Máximo Potencial
                </h2>
                <p className="text-xs sm:text-sm text-on-primary-container leading-relaxed">
                  Café Latte Grande (16 oz) con leche de almendra o entera + Croissant recién salido del horno con almendras tostadas.
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-white">$8.800</span>
                    <span className="line-through text-on-primary-container text-xs">$11.000</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-white text-[11px] font-bold">
                    -20% Saldo Carné
                  </span>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      const promo = products.find((p) => p.id === 'prod-combo-parciales');
                      if (promo) {
                        addItem(promo);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface text-primary hover:bg-white transition-transform active:scale-95 text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-md"
                  >
                    <span className="material-symbols-outlined text-base text-secondary">
                      add_shopping_cart
                    </span>
                    Agregar a mi Bandeja
                  </button>
                </div>
              </div>

              <div className="relative w-full md:w-64 h-48 rounded-xl overflow-hidden shadow-inner shrink-0 border border-white/10">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRvRwwmYM8qzBnOAKJpW1t4QKp4CyPRlxb4d0Tqpb3d0Yo5oxS4HogPGoDE9m2xrdyN54cJqOpvGIs1y1D5Hvz5EuNJHHi3VWJhrpqo5d2WtrDJKELBTNk1q8u2vXSjgI6XdK_D3JMj9NKTBqMx8b7B8IYLvdFFxl2bLjNY5dv00UHmomy-0-c3CMfyuwN_FkfuHvW6VFAGDxmHWHABbP_B_7u6Oue8egufysBhY-5DjXM65Zmw0AN"
                  alt="Combo Parciales Latte y Croissant"
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm text-[11px]">
                  Listo en 3 min
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl text-primary font-bold">
                    Menú Diario del Campus
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Preparación en vivo con ingredientes locales y opciones de personalización
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant">
                  Ordenado por: <strong className="text-primary font-semibold">Popularidad</strong>
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-64 rounded-2xl bg-surface-container animate-pulse border border-surface-container-high"
                    ></div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-surface-container">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">
                    search_off
                  </span>
                  <p className="text-sm font-semibold text-on-surface">
                    No se encontraron productos con los filtros aplicados.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('TODOS');
                      setActiveTag(null);
                      setSearchQuery('');
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 border border-surface-container-high flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container with Badges */}
                        <div className="relative w-full h-44 overflow-hidden bg-surface-container">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 400px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          {product.isPopular && (
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-secondary text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">
                                local_fire_department
                              </span>
                              Más pedido
                            </div>
                          )}
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-on-surface text-[11px] font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-secondary">
                              schedule
                            </span>
                            {product.preparationTimeMinutes} min
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                            <span>{product.calories} kcal</span>
                            {product.dietaryBadge && (
                              <span className="font-semibold text-[#2E6B47]">
                                {product.dietaryBadge}
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-base font-bold text-primary leading-snug">
                            {product.name}
                          </h4>
                          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer with Price and Add Action */}
                      <div className="px-4 pb-4 pt-1 flex items-center justify-between mt-auto border-t border-surface-container/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-outline font-medium">
                            Precio Campus
                          </span>
                          <span className="font-display text-lg font-bold text-on-surface">
                            {product.formattedPrice}
                          </span>
                        </div>
                        <button
                          onClick={() => addItem(product)}
                          className="w-10 h-10 rounded-xl bg-secondary text-white hover:bg-[#8e3312] transition-colors flex items-center justify-center shadow-xs active:scale-90"
                          title="Agregar a la bandeja"
                          aria-label={`Agregar ${product.name}`}
                        >
                          <span className="material-symbols-outlined text-xl">add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Eco Pledge Banner */}
            <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">compost</span>
                </div>
                <div>
                  <h5 className="font-display text-sm font-bold text-primary">
                    Campus Consciente: Menos Huella, Mejor Sabor
                  </h5>
                  <p className="text-xs text-on-surface-variant">
                    Trae tu termo reutilizable y recibe un 10% adicional de descuento en cualquier café.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('clean-arch')}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest whitespace-nowrap"
              >
                Ver Arquitectura
              </button>
            </div>
          </div>

          {/* Sticky Mini Tray Drawer (4 cols) */}
          <aside className="xl:col-span-4 sticky top-24">
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container-high flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-secondary text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shopping_bag
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-primary">
                      Tu Pedido en Curso
                    </h3>
                    <span className="text-[11px] text-on-surface-variant">
                      Cafetería Central (Edif. B)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">
                  {totalItemCount} {totalItemCount === 1 ? 'ítem' : 'ítems'}
                </span>
              </div>

              {/* Prep time widget */}
              <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-surface-container">
                <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">timer</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    Tiempo estimado de preparación
                  </span>
                  <span className="text-xs font-bold text-primary font-display">
                    Listo en aprox. 8 - 12 min
                  </span>
                </div>
              </div>

              {/* Tray Item List */}
              {items.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-outline-variant">
                    lunch_dining
                  </span>
                  <p className="text-xs">Tu bandeja está vacía.</p>
                  <p className="text-[11px] text-outline">
                    Selecciona productos del menú para armar tu pedido express.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 divide-y divide-surface-container">
                  {items.map((cartItem) => (
                    <div
                      key={cartItem.product.id}
                      className="pt-2 first:pt-0 flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col flex-grow">
                        <span className="text-xs font-bold text-on-surface leading-tight">
                          {cartItem.product.name}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {cartItem.customizations || `${cartItem.product.calories} kcal`}
                        </span>
                        <span className="font-display text-xs font-bold text-primary mt-0.5">
                          ${(cartItem.product.price * cartItem.quantity).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-lg border border-surface-container">
                        <button
                          onClick={() => updateQuantity(cartItem.product.id, cartItem.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-on-surface-variant hover:text-secondary text-xs font-bold"
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-on-surface min-w-[16px] text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.product.id, cartItem.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-on-surface-variant hover:text-secondary text-xs font-bold"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculation Breakdown */}
              <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant pt-2 border-t border-surface-container">
                <div className="flex items-center justify-between">
                  <span>Subtotal productos</span>
                  <span className="font-semibold text-on-surface">{formattedSubtotal}</span>
                </div>
                <div className="flex items-center justify-between text-[#2E6B47]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">local_offer</span>
                    Descuento Carné (10%)
                  </span>
                  <span className="font-bold">Aplicable en Checkout</span>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-surface-container text-sm font-bold text-on-surface">
                  <span className="font-display">Total Estimado</span>
                  <span className="font-display text-lg text-secondary">{formattedTotal}</span>
                </div>
              </div>

              {/* Student Card Balance Hint */}
              <div className="flex items-center justify-between bg-primary/5 p-2.5 rounded-xl text-xs text-primary border border-primary/10">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">credit_card</span>
                  <span>Saldo carné:</span>
                </div>
                <span className="font-bold font-display">
                  ${studentBalance.toLocaleString('es-CO')}
                </span>
              </div>

              {/* Main CTA */}
              <button
                disabled={items.length === 0}
                onClick={() => setActiveTab('pagar-y-carrito')}
                className="w-full py-3.5 px-4 rounded-xl bg-secondary text-white hover:bg-[#8e3312] transition-transform active:scale-[0.98] font-display font-bold text-sm flex items-center justify-between shadow-md disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>Ir a Pagar y Checkout</span>
                <span>{formattedTotal}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
