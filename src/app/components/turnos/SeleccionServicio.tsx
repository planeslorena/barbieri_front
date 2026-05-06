'use client';

import type { ProfesionalTurno, ServicioTurno } from '@/app/services/turnos';

interface Props {
  profesional: ProfesionalTurno;
  onSelect: (servicio: ServicioTurno) => void;
}

export default function SeleccionServicio({ profesional, onSelect }: Props) {
  return (
    <div className="turnos-step">
      <div className="turnos-heading">
        <span className="turnos-eyebrow">Paso 2 de 5</span>
        <h1 className="title">Elegi tratamiento</h1>
        <p>Estos son los servicios disponibles con {profesional.nombre}.</p>
      </div>

      {!profesional.servicios.length ? (
        <p className="turnos-state">No hay servicios disponibles para este profesional.</p>
      ) : (
        <div className="turnos-list">
          {profesional.servicios.map((servicio) => (
            <button
              key={servicio.id_servicio}
              className="turnos-option"
              onClick={() => onSelect(servicio)}
            >
              <span>
                <strong>{servicio.nombre}</strong>
                <small>{servicio.duracion} min - Reserva ${servicio.reserva}</small>
              </span>
              <i className="bi bi-arrow-right-short"></i>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
