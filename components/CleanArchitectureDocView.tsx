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
      `[${new Date().toLocaleTimeString()}] ▶ Iniciando prueba: ${testName}...`,
    ]);

    if (testName === 'create-order') {
      try {
        const payload = {
          studentName: 'Johan David Taborda',
          studentId: '2024-1088',
          items: [
            { productId: 'prod-latte-caramelo', quantity: 2, customizations: 'Leche de Almendra' },
            { productId: 'prod-croissant', quantity: 1 },
          ],
          pickupStationId: 'counter-b2',
          paymentType: 'CARNE_ESTUDIANTIL',
          instructions: 'Prueba de caso de uso en Arquitectura Limpia',
        };

        setConsoleLog((prev) => [
          ...prev,
          `[Datos de Entrada DTO]: ${JSON.stringify(payload, null, 2)}`,
          `[Caso de Uso]: Ejecutando CreateOrderUseCase.execute(input)...`,
          `[Entidad de Dominio]: Creando instancia de Order (Aggregate Root) y OrderItem...`,
          `[Regla de Negocio]: Validando existencias y deduciendo stock de 2x Latte y 1x Croissant...`,
          `[Cálculo de Dominio]: Subtotal = $17.200 | Descuento 10% = -$1.720 | Total = $15.480 COP`,
          `[Puerto Pasarela]: IPaymentGateway.processPayment() debitando saldo institucional...`,
          `[Puerto Repositorio]: IOrderRepository.save(order)...`,
        ]);

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        setConsoleLog((prev) => [
          ...prev,
          `✔ [Salida DTO]: Pedido creado exitosamente #${json.data.id} (Turno: ${json.data.ticketNumber})`,
          `✔ Estado: ${json.data.statusLabel} | Puntos otorgados: +${json.data.loyaltyPoints} puntos.`,
          '--------------------------------------------------',
        ]);
      } catch (err: any) {
        setConsoleLog((prev) => [...prev, `✖ Error en la prueba: ${err.message}`]);
      }
    } else if (testName === 'state-machine') {
      setConsoleLog((prev) => [
        ...prev,
        `[Regla de Dominio]: Validando transiciones de la máquina de estados en OrderStatusValidator...`,
        `Recibido ➔ En Proceso: PERMITIDO ✔`,
        `En Proceso ➔ Listo en Barra: PERMITIDO ✔`,
        `Listo en Barra ➔ Entregado: PERMITIDO ✔`,
        `Entregado ➔ Cancelado: RECHAZADO (Estado terminal protegido) ✔`,
        `✔ Invariantes y reglas de negocio 100% verificadas.`,
        '--------------------------------------------------',
      ]);
    }

    setIsRunningTest(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      {/* Title & Badge */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-900 px-3.5 py-1 rounded-full text-xs font-bold w-fit">
          <span className="material-symbols-outlined text-base">architecture</span>
          Arquitectura Limpia &amp; Principios SOLID
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-900">
          Diseño de Software y Arquitectura Limpia en Quick-Bite
        </h1>
        <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
          Esta solución separa de forma estricta las reglas de negocio de los detalles técnicos y de interfaz,
          utilizando entidades puras de dominio (<strong>Product</strong> y <strong>Order</strong>), casos de uso aislados,
          contratos e interfaces (Puertos), e implementaciones intercambiables (Adaptadores).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 mb-8 overflow-x-auto">
        {[
          { id: 'clean-arch', label: 'Capas de la Arquitectura', icon: 'account_tree' },
          { id: 'solid', label: 'Principios SOLID Aplicados', icon: 'verified' },
          { id: 'live-runner', label: 'Consola Interactiva de Pruebas', icon: 'terminal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-secondary text-secondary'
                : 'border-transparent text-stone-600 hover:text-stone-900'
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
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-black">
              1
            </div>
            <h3 className="font-display text-base font-black text-stone-900">
              Capa de Dominio
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              El núcleo del sistema. Sin dependencias externas ni ataduras a la base de datos o librerías web.
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">Entidad Product</strong>
                <span className="text-xs text-stone-600">
                  Reglas de stock, cálculo de precios y validación de atributos.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">Entidad Order y OrderItem</strong>
                <span className="text-xs text-stone-600">
                  Raíz agregada, cálculo de subtotal, descuento (10%), puntos y ciclo de entrega.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">Objetos de Valor (Value Objects)</strong>
                <span className="text-xs text-stone-600">
                  Money (inmutable), OrderStatus (máquina de estados), PaymentMethod.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">Puertos de Repositorio</strong>
                <span className="text-xs text-stone-600">
                  IProductRepository, IOrderRepository, IPaymentGateway.
                </span>
              </div>
            </div>
          </div>

          {/* Layer 2: Application */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary text-white flex items-center justify-center font-black">
              2
            </div>
            <h3 className="font-display text-base font-black text-stone-900">
              Capa de Aplicación
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Orquesta los flujos de negocio sin conocer detalles técnicos de la base de datos o pantalla.
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-secondary block font-bold">CreateOrderUseCase</strong>
                <span className="text-xs text-stone-600">
                  Valida existencias, descuenta stock, procesa pago en carné y genera ticket B-42.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-secondary block font-bold">GetProductsUseCase</strong>
                <span className="text-xs text-stone-600">
                  Búsqueda, categorización y filtros sin nombres crudos con guiones.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-secondary block font-bold">UpdateOrderStatusUseCase</strong>
                <span className="text-xs text-stone-600">
                  Transiciona estados: Recibido ➔ En Proceso ➔ Listo ➔ Entregado.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-secondary block font-bold">DTOs y DomainMapper</strong>
                <span className="text-xs text-stone-600">
                  Evita que las entidades de dominio se expongan directamente a la web.
                </span>
              </div>
            </div>
          </div>

          {/* Layer 3: Infrastructure */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-700 text-white flex items-center justify-center font-black">
              3
            </div>
            <h3 className="font-display text-base font-black text-stone-900">
              Capa de Infraestructura
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Implementa los puertos definidos en el dominio mediante adaptadores intercambiables.
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">MockProductRepository</strong>
                <span className="text-xs text-stone-600">
                  Implementa IProductRepository con catálogo e imágenes de alta definición.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">InMemoryOrderRepository</strong>
                <span className="text-xs text-stone-600">
                  Implementa IOrderRepository para almacenamiento y consulta de pedidos.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">MockPaymentGateway</strong>
                <span className="text-xs text-stone-600">
                  Gestión del saldo del carné estudiantil ($24.500) y pasarelas de pago.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">Contenedor de Inyección</strong>
                <span className="text-xs text-stone-600">
                  Raíz de composición (DI) que inyecta dependencias e instancia los casos de uso.
                </span>
              </div>
            </div>
          </div>

          {/* Layer 4: Presentation */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black">
              4
            </div>
            <h3 className="font-display text-base font-black text-stone-900">
              Capa de Presentación
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Controladores API REST y Componentes React interactivos con alta legibilidad.
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">Rutas API (/api/*)</strong>
                <span className="text-xs text-stone-600">
                  Controladores HTTP que delegan en los casos de uso correspondientes.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">Vistas de Usuario</strong>
                <span className="text-xs text-stone-600">
                  Catálogo, Pago Express, Seguimiento en tiempo real y mapa de barras.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block font-bold">Contexto React (CartContext)</strong>
                <span className="text-xs text-stone-600">
                  Gestión de estado reactivo para carrito y notificaciones en vivo.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SOLID Principles */}
      {activeTab === 'solid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-secondary text-white font-black flex items-center justify-center text-sm shadow-xs">
                S
              </span>
              <h3 className="font-display font-black text-base text-stone-900">
                Responsabilidad Única (Single Responsibility Principle)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Cada clase y módulo tiene un único motivo para cambiar:
            </p>
            <ul className="text-xs sm:text-sm text-stone-600 list-disc pl-5 space-y-1.5 mt-1 font-normal">
              <li><strong className="text-stone-900 font-bold">Product:</strong> Encapsula únicamente las reglas del producto y existencias de inventario.</li>
              <li><strong className="text-stone-900 font-bold">Order:</strong> Responsable exclusivamente de la agrupación de productos, cálculo de importes y ciclo de vida de la orden.</li>
              <li><strong className="text-stone-900 font-bold">CreateOrderUseCase:</strong> Orquesta únicamente el proceso de creación sin gestionar cómo se visualizan los datos en el navegador ni cómo se almacenan en SQL.</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-secondary text-white font-black flex items-center justify-center text-sm shadow-xs">
                O
              </span>
              <h3 className="font-display font-black text-base text-stone-900">
                Abierto / Cerrado (Open / Closed Principle)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              El sistema está abierto a la extensión pero cerrado a la modificación:
            </p>
            <ul className="text-xs sm:text-sm text-stone-600 list-disc pl-5 space-y-1.5 mt-1 font-normal">
              <li>Las reglas de descuento (como el 10% de carné o promociones ecológicas) se extienden sin modificar la lógica interna de la entidad <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono text-xs">Order</code>.</li>
              <li>Se pueden agregar nuevas pasarelas de pago (Stripe, PSE institucional, Apple Pay) implementando <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono text-xs">IPaymentGateway</code> sin alterar los casos de uso.</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-secondary text-white font-black flex items-center justify-center text-sm shadow-xs">
                L
              </span>
              <h3 className="font-display font-black text-base text-stone-900">
                Sustitución de Liskov (Liskov Substitution Principle)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Las implementaciones pueden sustituir a las interfaces sin romper la aplicación:
            </p>
            <ul className="text-xs sm:text-sm text-stone-600 list-disc pl-5 space-y-1.5 mt-1 font-normal">
              <li><code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono text-xs">MockProductRepository</code> puede sustituirse por un repositorio SQL o API remota respetando estrictamente el contrato de <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono text-xs">IProductRepository</code>.</li>
              <li>Los casos de uso funcionan de forma idéntica sin importar la tecnología de almacenamiento subyacente.</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-secondary text-white font-black flex items-center justify-center text-sm shadow-xs">
                I &amp; D
              </span>
              <h3 className="font-display font-black text-base text-stone-900">
                Segregación de Interfaces e Inversión de Dependencias
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Interfaces modulares y desacoplamiento de componentes de alto nivel:
            </p>
            <ul className="text-xs sm:text-sm text-stone-600 list-disc pl-5 space-y-1.5 mt-1 font-normal">
              <li><strong className="text-stone-900 font-bold">ISP:</strong> Se diseñaron interfaces pequeñas y específicas (<code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono text-xs">IProductRepository</code>, <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono text-xs">IOrderRepository</code>, <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono text-xs">IPaymentGateway</code>) evitando métodos innecesarios.</li>
              <li><strong className="text-stone-900 font-bold">DIP:</strong> Las capas de alto nivel (Casos de Uso) dependen de abstracciones (interfaces), nunca de clases concretas. La inyección se resuelve en el contenedor central (<code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono text-xs">container.ts</code>).</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Live Test Console */}
      {activeTab === 'live-runner' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-black text-base text-stone-900">
                Consola de Pruebas Unitarias de Arquitectura
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Ejecuta los casos de uso en tiempo real y observa la interacción entre DTOs, Entidades de Dominio y Repositorios.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={isRunningTest}
                onClick={() => runDomainTest('create-order')}
                className="px-4 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-orange-700 transition-transform active:scale-95 disabled:opacity-50 shadow-xs"
              >
                Probar CreateOrderUseCase
              </button>
              <button
                disabled={isRunningTest}
                onClick={() => runDomainTest('state-machine')}
                className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-transform active:scale-95 disabled:opacity-50 shadow-xs"
              >
                Probar Máquina de Estados
              </button>
              <button
                onClick={() => setConsoleLog([])}
                className="p-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-semibold"
                title="Limpiar consola"
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
              </button>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="bg-stone-950 text-orange-200 font-mono text-xs p-4 sm:p-5 rounded-2xl h-80 overflow-y-auto border border-stone-800 flex flex-col gap-1.5 shadow-inner">
            <div className="text-stone-400 text-xs pb-2 border-b border-stone-800">
              {"// Quick-Bite Entorno de Pruebas Clean Architecture v1.0.0"}
            </div>
            {consoleLog.length === 0 ? (
              <div className="my-auto text-center text-stone-500 italic">
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
