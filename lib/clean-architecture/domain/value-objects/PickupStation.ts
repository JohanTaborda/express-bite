export type PickupStationType = 'COUNTER' | 'SMART_LOCKER';

export interface PickupStation {
  id: string;
  type: PickupStationType;
  name: string;
  building: string;
  floor: string;
  notes?: string;
  estimatedWaitMinutes: number;
}

export const CAMPUS_STATIONS: PickupStation[] = [
  {
    id: 'counter-b2',
    type: 'COUNTER',
    name: 'Mostrador Express - Barra 2',
    building: 'Cafetería Central - Edificio B',
    floor: 'Piso 1 (Frente a Plazoleta)',
    notes: 'Fila prioritaria estudiantes y docentes',
    estimatedWaitMinutes: 6,
  },
  {
    id: 'locker-04',
    type: 'SMART_LOCKER',
    name: 'Casillero Térmico #04',
    building: 'Edificio B (Acceso Biblioteca)',
    floor: 'Piso 1',
    notes: 'Retiro automatizado con código QR / Carné',
    estimatedWaitMinutes: 8,
  },
];
