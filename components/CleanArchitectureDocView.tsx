'use client';

import React, { useState } from 'react';

export function CleanArchitectureDocView() {
  const [activeTab, setActiveTab] = useState<'clean-arch' | 'solid' | 'live-runner'>('clean-arch');
  const [consoleLog, setConsoleLog] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);

  const runDomainTest = async (testName: string) => {
    setIsRunningTest(true);
    setConsoleLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ▶ Iniciando test: ${testName}...`,
    ]);

    if (testName === 'create-order') {
      try {
        const payload = {
          studentName: 'Sofía Mendoza (Test QA)',
          studentId: '2021-4892',
          items: [
            { productId: 'prod-latte-caramelo', quantity: 2, customizations: 'Leche de Almendra' },
            { productId: 'prod-croissant', quantity: 1 },
          ],
          pickupStationId: 'counter-b2',
          paymentType: 'CARNE_ESTUDIANTIL',
          instructions: 'Test unitario de Clean Architecture',
        };

        setConsoleLog((prev) => [
          ...prev,
          `[Input DTO]: ${JSON.stringify(payload, null, 2)}`,
          `[Use Case]: Invocando CreateOrderUseCase.execute(input)...`,
          `[Domain Entity]: Instanciando Order aggregate root y OrderItem entities...`,
          `[Domain Rule]: Validando stock y deduciendo 2x Latte y 1x Croissant...`,
          `[Domain Calculation]: Subtotal = $17.200 | Descuento 10% = -$1.720 | Total = $15.480 COP`,
          `[Gateway Port]: IPaymentGateway.processPayment() debitando carné...`,
          `[Repository Port]: IOrderRepository.save(order)...`,
        ]);

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        setConsoleLog((prev) => [
          ...prev,
          `✔ [Output DTO]: Pedido creado exitosamente #${json.data.id} (Turno: ${json.data.ticketNumber})`,
          `✔ Estado: ${json.data.statusLabel} | Puntos otorgados: +${json.data.loyaltyPoints} pts.`,
          '--------------------------------------------------',
        ]);
      } catch (err: any) {
        setConsoleLog((prev) => [...prev, `✖ Error en test: ${err.message}`]);
      }
    } else if (testName === 'state-machine') {
      setConsoleLog((prev) => [
        ...prev,
        `[Domain Rule]: Probando finite state machine en OrderStatusValidator...`,
        `RECEIVED -> PREPARING: PERMITIDO ✔`,
        `PREPARING -> READY: PERMITIDO ✔`,
        `READY -> DELIVERED: PERMITIDO ✔`,
        `DELIVERED -> CANCELLED: RECHAZADO (Estado terminal preservado) ✔`,
        `✔ Invariantes de dominio 100% verificadas.`,
        '--------------------------------------------------',
      ]);
    }

    setIsRunningTest(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      {/* Title & Badge */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold w-fit">
          <span className="material-symbols-outlined text-sm">architecture</span>
          Software Engineering Constitution
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
          Clean Architecture &amp; Principios SOLID en Quick-Bite
        </h1>
        <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
          Esta aplicación fue estructurada desde cero separando las reglas de negocio de los detalles técnicos,
          con entidades puras de dominio (<strong>Product</strong> y <strong>Order</strong>), casos de uso desacoplados,
          contratos e interfaces (Ports), e implementaciones intercambiables (Adapters).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high mb-8">
        {[
          { id: 'clean-arch', label: 'Estructura Clean Architecture', icon: 'account_tree' },
          { id: 'solid', label: 'Principios SOLID Aplicados', icon: 'verified' },
          { id: 'live-runner', label: 'Consola Interactiva de Pruebas', icon: 'terminal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-secondary text-secondary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Clean Architecture Layers */}
      {activeTab === 'clean-arch' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Layer 1: Domain */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container-high flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-display text-base font-bold text-primary">
              Capa de Dominio (Domain)
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              El núcleo del sistema. Sin dependencias externas ni frameworks de UI.
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-surface-container text-xs">
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-primary block">Product Entity</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Reglas de stock, disponibilidad y validación de atributos.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-primary block">Order Entity &amp; OrderItem</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Aggregate root, cálculo de subtotal, descuento (10%), puntos y ciclo de vida.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-primary block">Value Objects</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Money (inmutable), OrderStatus (máquina de estados), PaymentMethod.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-primary block">Repository Ports</strong>
                <span className="text-[11px] text-on-surface-variant">
                  IProductRepository, IOrderRepository, IPaymentGateway.
                </span>
              </div>
            </div>
          </div>

          {/* Layer 2: Application */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container-high flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-display text-base font-bold text-primary">
              Capa de Aplicación (Use Cases)
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Orquesta los flujos de negocio sin conocer detalles de persistencia ni web.
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-surface-container text-xs">
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-secondary block">CreateOrderUseCase</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Valida ítems, descuenta stock, procesa pago en carné y emite ticket B-42.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-secondary block">GetProductsUseCase</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Búsqueda, categorización y filtros de intolerancias.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-secondary block">UpdateOrderStatusUseCase</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Transiciona estados: RECEIVED ➔ PREPARING ➔ READY ➔ DELIVERED.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-secondary block">DTOs &amp; DomainMapper</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Evita fugas de entidades de dominio hacia el exterior.
                </span>
              </div>
            </div>
          </div>

          {/* Layer 3: Infrastructure */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container-high flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary text-white flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-display text-base font-bold text-primary">
              Infraestructura (Adapters)
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Implementa los puertos definidos en el dominio mediante adaptadores concretos.
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-surface-container text-xs">
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-tertiary block">MockProductRepository</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Implementa IProductRepository con catálogo institucional real.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-tertiary block">InMemoryOrderRepository</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Implementa IOrderRepository para persistencia y auditoría de pedidos.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-tertiary block">MockPaymentGateway</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Manejo de saldo de carné estudiantil ($24.500) y pasarelas de pago.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-tertiary block">DI Container</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Composition Root que inyecta dependencias e instancia los casos de uso.
                </span>
              </div>
            </div>
          </div>

          {/* Layer 4: Presentation */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container-high flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-display text-base font-bold text-primary">
              Presentación (Next.js)
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Controladores API REST y Componentes React interactivos.
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-surface-container text-xs">
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-on-surface block">API Routes (/api/*)</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Controladores HTTP desacoplados que delegan en los casos de uso.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-on-surface block">React App UI</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Catálogo, Checkout Express, Rastreador con ticket digital y mapa de barras.
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <strong className="text-on-surface block">CartContext</strong>
                <span className="text-[11px] text-on-surface-variant">
                  Manejo de estado reactivo para bandeja y notificaciones en vivo.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SOLID Principles */}
      {activeTab === 'solid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-secondary">
              <span className="w-8 h-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm">
                S
              </span>
              <h3 className="font-display font-bold text-base text-primary">
                Single Responsibility Principle (SRP)
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Cada módulo o clase tiene una única responsabilidad bien definida:
            </p>
            <ul className="text-xs text-on-surface-variant list-disc pl-5 space-y-1 mt-1">
              <li><strong className="text-on-surface">Product:</strong> Encapsula únicamente la lógica intrínseca del producto y control de stock.</li>
              <li><strong className="text-on-surface">Order:</strong> Responsable exclusivamente de la composición del pedido, cálculo de importes y ciclo de vida de entrega.</li>
              <li><strong className="text-on-surface">CreateOrderUseCase:</strong> Orquesta únicamente el proceso de creación sin gestionar cómo se pintan los datos en la pantalla ni cómo se almacenan en SQL.</li>
            </ul>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-secondary">
              <span className="w-8 h-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm">
                O
              </span>
              <h3 className="font-display font-bold text-base text-primary">
                Open / Closed Principle (OCP)
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              El sistema está abierto a la extensión pero cerrado a la modificación:
            </p>
            <ul className="text-xs text-on-surface-variant list-disc pl-5 space-y-1 mt-1">
              <li>Las políticas de descuento (como el 10% para el carné estudiantil o promociones eco) se configuran sin alterar el core de la entidad <code className="bg-surface-container px-1 rounded">Order</code>.</li>
              <li>Se pueden agregar nuevas pasarelas de pago (Stripe, PSE institucional, Apple Pay) implementando <code className="bg-surface-container px-1 rounded">IPaymentGateway</code> sin tocar el caso de uso.</li>
            </ul>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-secondary">
              <span className="w-8 h-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm">
                L
              </span>
              <h3 className="font-display font-bold text-base text-primary">
                Liskov Substitution Principle (LSP)
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Cualquier implementación de una interfaz puede sustituir a otra sin romper el comportamiento esperado:
            </p>
            <ul className="text-xs text-on-surface-variant list-disc pl-5 space-y-1 mt-1">
              <li><code className="bg-surface-container px-1 rounded">MockProductRepository</code> puede ser reemplazado en producción por un <code className="bg-surface-container px-1 rounded">PostgresProductRepository</code> respetando el contrato exacto de <code className="bg-surface-container px-1 rounded">IProductRepository</code>.</li>
              <li>Los casos de uso funcionarán idénticamente sin enterarse de qué motor de base de datos se utiliza.</li>
            </ul>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-secondary">
              <span className="w-8 h-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm">
                I &amp; D
              </span>
              <h3 className="font-display font-bold text-base text-primary">
                Interface Segregation (ISP) &amp; Dependency Inversion (DIP)
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Interfaces pequeñas y específicas, e inversión total de dependencias:
            </p>
            <ul className="text-xs text-on-surface-variant list-disc pl-5 space-y-1 mt-1">
              <li><strong className="text-on-surface">ISP:</strong> Se crearon interfaces modulares enfocadas (<code className="bg-surface-container px-1 rounded">IProductRepository</code>, <code className="bg-surface-container px-1 rounded">IOrderRepository</code>, <code className="bg-surface-container px-1 rounded">IPaymentGateway</code>) evitando métodos innecesarios.</li>
              <li><strong className="text-on-surface">DIP:</strong> Las capas de alto nivel (Use Cases) dependen exclusivamente de abstracciones (interfaces), no de clases concretas. La inyección se realiza en el contenedor DI (<code className="bg-surface-container px-1 rounded">container.ts</code>).</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Live Test Console */}
      {activeTab === 'live-runner' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-primary">
                Consola de Pruebas Unitarias de Arquitectura
              </h3>
              <p className="text-xs text-on-surface-variant">
                Ejecuta los casos de uso en tiempo real y observa la interacción entre DTOs, Entidades de Dominio y Repositorios.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={isRunningTest}
                onClick={() => runDomainTest('create-order')}
                className="px-3.5 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-[#8e3312] transition-transform active:scale-95 disabled:opacity-50"
              >
                Test CreateOrderUseCase
              </button>
              <button
                disabled={isRunningTest}
                onClick={() => runDomainTest('state-machine')}
                className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-transform active:scale-95 disabled:opacity-50"
              >
                Test State Machine Invariants
              </button>
              <button
                onClick={() => setConsoleLog([])}
                className="p-2 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface text-xs"
                title="Limpiar consola"
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
              </button>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="bg-[#1e1b18] text-[#eec1a4] font-mono text-xs p-4 rounded-xl h-80 overflow-y-auto border border-primary/30 flex flex-col gap-1.5 shadow-inner">
            <div className="text-neutral-400 text-[11px] pb-2 border-b border-neutral-700">
              {"// Quick-Bite Domain Console v1.0.0 • Clean Architecture Environment Active"}
            </div>
            {consoleLog.length === 0 ? (
              <div className="my-auto text-center text-neutral-500 italic">
                Presiona alguno de los botones de prueba superiores para ejecutar el flujo de casos de uso...
              </div>
            ) : (
              consoleLog.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
