'use client';

import type { ProfesionalTurno } from '@/app/services/turnos';

interface Props {
  profesionales: ProfesionalTurno[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onSelect: (profesional: ProfesionalTurno) => void;
}

export default function SeleccionProfesional({ profesionales, loading, error, onRetry, onSelect }: Props) {
  if (loading) {
    return <p className="turnos-state">Cargando profesionales...</p>;
  }

  if (error) {
    return (
      <div className="turnos-state">
        <p>{error}</p>
        <button className="btn-style turnos-primary-btn" onClick={onRetry}>Reintentar</button>
      </div>
    );
  }

  if (!profesionales.length) {
    return <p className="turnos-state">No hay profesionales disponibles para reservar turnos.</p>;
  }

  return (
    <div className="turnos-step">
      <div className="turnos-heading">
        <span className="turnos-eyebrow">Paso 1 de 5</span>
        <h1 className="title">Elegí profesional</h1>
        <p>Seleccioná con quién querés atenderte para ver sus tratamientos disponibles.</p>
      </div>

      <div className="turnos-list">
        {profesionales.map((profesional) => (
          <button
            key={profesional.id_profesional}
            className="turnos-option"
            onClick={() => onSelect(profesional)}
          >
            <span>
              <strong>{profesional.nombre}</strong>
              <small>{profesional.servicios.length} tratamientos disponibles</small>
            </span>
            <i className="bi bi-arrow-right-short"></i>
          </button>
        ))}
      </div>
    </div>
  );
}
