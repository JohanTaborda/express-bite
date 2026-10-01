'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-stone-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="flex flex-col gap-2">
            <span className="font-display text-lg font-black text-stone-900">
              Quick-Bite University
            </span>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              Plataforma institucional de pedidos rápidos y alimentación consciente para el campus universitario.
            </p>
            <div className="flex items-center gap-1.5 text-secondary text-xs font-bold mt-2">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Servicio Oficial de Comedores del Campus</span>
            </div>
          </div>

          {/* Schedules */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Horarios de Atención
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-stone-600 font-medium">
              <span>Lunes a Viernes: 07:00 a 20:30</span>
              <span>Sábados: 08:00 a 15:00</span>
              <span>Domingos y Festivos: Cerrado</span>
            </div>
          </div>

          {/* Campus Stations */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Estaciones en el Campus
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-stone-600 font-medium">
              <span>Cafetería Central (Edificio B)</span>
              <span>Espresso Corner Biblioteca</span>
              <span>Snack Bar Polideportivo</span>
              <span>Kiosco Ciencias Médicas</span>
            </div>
          </div>

          {/* Student Support */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Soporte al Estudiante
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-stone-600 font-medium">
              <span className="hover:text-stone-900 cursor-pointer">Preguntas Frecuentes</span>
              <span className="hover:text-stone-900 cursor-pointer">Recarga de Saldo de Carné</span>
              <span className="hover:text-stone-900 cursor-pointer">Soporte Nutricional y Alérgenos</span>
              <span className="hover:text-stone-900 cursor-pointer">Contacto: comedor@quickbite.edu.co</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-medium">
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
