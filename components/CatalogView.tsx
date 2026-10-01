'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ProductOutputDTO } from '@/lib/clean-architecture/application/dtos/OrderDTO';

const CATEGORIES = [
  { id: 'TODOS', label: 'Todos los Menús', icon: 'restaurant_menu' },
  { id: 'CAFE_ESPECIALIDAD', label: 'Café de Especialidad', icon: 'coffee' },
  { id: 'BEBIDAS_FRIAS', label: 'Bebidas Frías y Frappés', icon: 'ac_unit' },
  { id: 'REPOSTERIA', label: 'Bakery y Repostería', icon: 'bakery_dining' },
  { id: 'SANDWICHES_SALADOS', label: 'Sándwiches y Salados', icon: 'lunch_dining' },
  { id: 'COMBOS_ESTUDIANTILES', label: 'Combos Estudiantiles', icon: 'savings' },
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
        p.categoryLabel.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface">
      {/* Top Status Notification Ribbon */}
      <div className="w-full bg-white border-b border-surface-container-high px-4 sm:px-6 lg:px-8 py-2.5 text-on-surface-variant flex items-center justify-between flex-wrap gap-2 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Cocina en Flujo Rápido (Espera estimada menor a 8 min)
          </span>
          <span className="hidden md:inline text-stone-600 font-medium">
            Punto de entrega activo: Mostrador Principal Barra 2 (Edificio B)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1 text-secondary font-semibold">
            <span className="material-symbols-outlined text-base">bolt</span>
            Retiro prioritario para estudiantes
          </span>
          <span className="px-2.5 py-1 rounded-md bg-stone-100 font-bold text-stone-800 border border-stone-200">
            Edificio B • Piso 1
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Header */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-orange-700">
                Temporada Universitaria • Campus Activo
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-stone-900 font-black tracking-tight">
              ¡Hola, Johan David! ¿Qué deseas ordenar hoy?
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
              Realiza tu pedido sin filas entre bloques académicos. Obtén un <strong className="text-stone-900 font-bold">10% de descuento automático</strong> pagando con tu carné universitario.
            </p>
          </div>

          {/* Station Selector */}
          <div className="flex items-center gap-3.5 bg-white px-4 py-3 rounded-2xl border border-stone-200 shadow-sm self-start lg:self-center">
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">store</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-stone-500 font-medium">Estación de entrega</span>
              <span className="text-sm font-bold text-stone-900 font-display">Cafetería Central - Edificio B</span>
            </div>
          </div>
        </section>

        {/* Search Bar & Instant Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-6">
          <div className="lg:col-span-8 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xl pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar café de especialidad, sándwiches, repostería o combos..."
              className="w-full pl-11 pr-20 py-3 bg-white rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-xs border border-stone-200 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 text-xs font-semibold px-2 py-1 rounded bg-stone-100"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="lg:col-span-4 flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'Express', label: 'Express (menos de 5 min)', icon: 'bolt', color: 'text-orange-700' },
              { id: 'Vegetariano', label: 'Vegetariano', icon: 'eco', color: 'text-emerald-700' },
              { id: 'Populares', label: 'Más Populares', icon: 'star', color: 'text-amber-700' },
            ].map((chip) => {
              const isActive = activeTag === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveTag(isActive ? null : chip.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-xs border transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  <span className={`material-symbols-outlined text-base ${isActive ? 'text-white' : chip.color}`}>
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
            <span className="text-xs uppercase tracking-wider text-stone-600 font-extrabold">
              Explorar por Categoría
            </span>
            <span className="text-xs text-orange-700 font-bold">
              {filteredProducts.length} productos disponibles
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shadow-xs border ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-primary to-orange-900 text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-800">
              <div className="relative z-10 flex flex-col gap-2 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase text-amber-200 self-start">
                  <span className="material-symbols-outlined text-sm">school</span>
                  Especial Temporada Académica
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-black leading-tight text-white">
                  Combo Parciales: Latte Grande + Croissant Almendras
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal">
                  Café Latte Grande (16 oz) con leche a elección más Croissant recién horneado con láminas de almendras tostadas.
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-black text-white">$8.800</span>
                    <span className="line-through text-stone-300 text-xs">$11.000</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-secondary text-white text-xs font-extrabold">
                    -20% con Carné
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
                    className="px-5 py-3 rounded-xl bg-white text-stone-900 hover:bg-stone-100 transition-transform active:scale-95 text-xs sm:text-sm font-black inline-flex items-center gap-2 shadow-md"
                  >
                    <span className="material-symbols-outlined text-lg text-secondary">
                      add_shopping_cart
                    </span>
                    <span>Agregar a mi Bandeja</span>
                  </button>
                </div>
              </div>

              <div className="relative w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/20">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRvRwwmYM8qzBnOAKJpW1t4QKp4CyPRlxb4d0Tqpb3d0Yo5oxS4HogPGoDE9m2xrdyN54cJqOpvGIs1y1D5Hvz5EuNJHHi3VWJhrpqo5d2WtrDJKELBTNk1q8u2vXSjgI6XdK_D3JMj9NKTBqMx8b7B8IYLvdFFxl2bLjNY5dv00UHmomy-0-c3CMfyuwN_FkfuHvW6VFAGDxmHWHABbP_B_7u6Oue8egufysBhY-5DjXM65Zmw0AN"
                  alt="Combo Parciales Café con Croissant"
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 text-white backdrop-blur-sm text-xs font-bold">
                  Listo en 3 min
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl text-stone-900 font-extrabold">
                    Catálogo de Productos
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Alimentos y bebidas de preparación artesanal en el campus
                  </p>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Ordenado por: <strong className="text-stone-900 font-bold">Popularidad</strong>
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-64 rounded-2xl bg-white border border-stone-200 animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 shadow-xs">
                  <span className="material-symbols-outlined text-5xl text-stone-400 mb-2">
                    search_off
                  </span>
                  <p className="text-base font-bold text-stone-900">
                    No se encontraron productos con los filtros seleccionados.
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Prueba cambiando el término de búsqueda o seleccionando otra categoría.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('TODOS');
                      setActiveTag(null);
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-orange-700 transition-colors"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 border border-stone-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container with Badges */}
                        <div className="relative w-full h-48 overflow-hidden bg-stone-100">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 400px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          {product.isPopular && (
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-secondary text-white text-xs font-bold shadow-xs flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">
                                local_fire_department
                              </span>
                              Más Pedido
                            </div>
                          )}
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-stone-800 text-xs font-bold flex items-center gap-1 shadow-xs">
                            <span className="material-symbols-outlined text-xs text-secondary">
                              schedule
                            </span>
                            {product.preparationTimeMinutes} min
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                              {product.categoryLabel}
                            </span>
                            <span className="text-stone-500 font-semibold">{product.calories} kcal</span>
                          </div>

                          <h4 className="font-display text-base font-bold text-stone-900 leading-snug">
                            {product.name}
                          </h4>

                          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>

                          {product.dietaryBadge && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                                {product.dietaryBadge}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer with Price and Add Action */}
                      <div className="px-5 pb-5 pt-3 flex items-center justify-between mt-auto border-t border-stone-100">
                        <div className="flex flex-col">
                          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                            Precio Campus
                          </span>
                          <span className="font-display text-lg font-black text-stone-900">
                            {product.formattedPrice}
                          </span>
                        </div>
                        <button
                          onClick={() => addItem(product)}
                          className="px-4 py-2.5 rounded-xl bg-secondary text-white hover:bg-orange-700 transition-colors flex items-center gap-1.5 shadow-xs active:scale-95 text-xs font-bold"
                          title="Agregar a la bandeja"
                          aria-label={`Agregar ${product.name}`}
                        >
                          <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                          <span>Agregar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Eco Pledge Banner */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">compost</span>
                </div>
                <div>
                  <h5 className="font-display text-sm font-bold text-stone-900">
                    Campus Consciente: Trae tu Termo Propio
                  </h5>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Recibe un 10% adicional de descuento en cualquier café al presentar tu termo reutilizable en la barra.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('clean-arch')}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold hover:bg-stone-200 transition-colors whitespace-nowrap"
              >
                Ver Arquitectura
              </button>
            </div>
          </div>

          {/* Sticky Mini Tray Drawer (4 cols) */}
          <aside className="xl:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <span
                    className="material-symbols-outlined text-secondary text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shopping_bag
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-stone-900">
                      Tu Bandeja Actual
                    </h3>
                    <span className="text-xs text-stone-500 font-medium">
                      Cafetería Central (Edificio B)
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-900 font-bold text-xs">
                  {totalItemCount} {totalItemCount === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              {/* Prep time widget */}
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">timer</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-stone-600 font-medium">
                    Tiempo estimado de preparación
                  </span>
                  <span className="text-xs font-bold text-stone-900 font-display">
                    Listo en aprox. 8 a 12 minutos
                  </span>
                </div>
              </div>

              {/* Tray Item List */}
              {items.length === 0 ? (
                <div className="py-8 text-center text-stone-500 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-stone-300">
                    lunch_dining
                  </span>
                  <p className="text-sm font-semibold text-stone-700">Tu bandeja está vacía.</p>
                  <p className="text-xs text-stone-500">
                    Selecciona productos del menú para armar tu pedido express.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 divide-y divide-stone-100">
                  {items.map((cartItem) => (
                    <div
                      key={cartItem.product.id}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col flex-grow">
                        <span className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
                          {cartItem.product.name}
                        </span>
                        <span className="text-xs text-stone-500">
                          {cartItem.customizations || `${cartItem.product.calories} kcal`}
                        </span>
                        <span className="font-display text-xs font-bold text-secondary mt-0.5">
                          ${(cartItem.product.price * cartItem.quantity).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                        <button
                          onClick={() => updateQuantity(cartItem.product.id, cartItem.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-600 hover:text-secondary text-sm font-bold"
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-stone-900 min-w-[16px] text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.product.id, cartItem.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-600 hover:text-secondary text-sm font-bold"
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
              <div className="flex flex-col gap-2 text-xs text-stone-600 pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span>Subtotal productos</span>
                  <span className="font-bold text-stone-900">{formattedSubtotal}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">local_offer</span>
                    Descuento Carné (10%)
                  </span>
                  <span>Aplicable al pagar</span>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span className="font-display">Total Estimado</span>
                  <span className="font-display text-xl text-secondary font-black">{formattedTotal}</span>
                </div>
              </div>

              {/* Student Card Balance Hint */}
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl text-xs text-stone-800 border border-stone-200">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-secondary">credit_card</span>
                  <span className="font-medium">Saldo carné:</span>
                </div>
                <span className="font-bold font-display text-secondary">
                  ${studentBalance.toLocaleString('es-CO')}
                </span>
              </div>

              {/* Main CTA */}
              <button
                disabled={items.length === 0}
                onClick={() => setActiveTab('pagar-y-carrito')}
                className="w-full py-3.5 px-4 rounded-xl bg-secondary text-white hover:bg-orange-700 transition-transform active:scale-[0.98] font-display font-bold text-sm flex items-center justify-between shadow-md disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>Continuar a Pagar</span>
                <span className="font-black">{formattedTotal}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
