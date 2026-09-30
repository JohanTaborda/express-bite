'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container-high mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="flex flex-col gap-2">
            <span className="font-display text-lg font-bold text-primary">
              Quick-Bite University
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Plataforma institucional de pedidos rápidos y alimentación consciente para el campus universitario.
            </p>
            <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold mt-2">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Servicio Oficial Campus Dining</span>
            </div>
          </div>

          {/* Schedules */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Horarios de Atención
            </span>
            <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
              <span>Lunes a Viernes: 07:00 - 20:30</span>
              <span>Sábados: 08:00 - 15:00</span>
              <span>Domingos &amp; Festivos: Cerrado</span>
            </div>
          </div>

          {/* Campus Stations */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Estaciones en Campus
            </span>
            <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
              <span>Cafetería Central (Edif. B)</span>
              <span>Espresso Corner Biblioteca</span>
              <span>Snack Bar Polideportivo</span>
              <span>Kiosco Ciencias Médicas</span>
            </div>
          </div>

          {/* Student Support */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Soporte al Estudiante
            </span>
            <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
              <span>Preguntas Frecuentes</span>
              <span>Recarga de Saldo Carné</span>
              <span>Soporte Alimentario y Alérgenos</span>
              <span>Contacto: comedor@quickbite.edu</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>© 2024 Quick-Bite University. Dirección de Bienestar Estudiantil.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Términos del Servicio</span>
            <span className="hover:underline cursor-pointer">Política de Privacidad</span>
            <span className="hover:underline cursor-pointer">Reglamento de Comedores</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
