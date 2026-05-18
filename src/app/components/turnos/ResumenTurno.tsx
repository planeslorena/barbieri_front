'use client';

import type { SeleccionTurno } from './types';
import { formatFechaLarga } from './dateUtils';

interface Props {
  seleccion: SeleccionTurno;
}

const SERVICIO_SIN_NOMBRE = 'Tratamiento';

export default function ResumenTurno({ seleccion }: Props) {
  if (!seleccion.profesional && !seleccion.servicio && !seleccion.fecha && !seleccion.hora) {
    return null;
  }

  return (
    <aside className="turnos-summary">
      <span>Tu selección</span>
      {seleccion.profesional && <p>{seleccion.profesional.nombre}</p>}
      {seleccion.servicio && <p>{seleccion.servicio.nombre || SERVICIO_SIN_NOMBRE}</p>}
      {seleccion.fecha && <p>{formatFechaLarga(seleccion.fecha)}</p>}
      {seleccion.hora && <p>{seleccion.hora}</p>}
    </aside>
  );
}
