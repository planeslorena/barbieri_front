import type { ProfesionalTurno, ServicioTurno } from '@/app/services/turnos';

export type PasoTurno = 'profesional' | 'servicio' | 'fecha' | 'horario' | 'confirmacion';

export interface SeleccionTurno {
  profesional: ProfesionalTurno | null;
  servicio: ServicioTurno | null;
  fecha: string;
  hora: string;
}
