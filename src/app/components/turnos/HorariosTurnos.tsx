'use client';

import { useCallback, useEffect, useState } from 'react';
import { getHorariosDisponibles } from '@/app/services/turnos';
import type { ProfesionalTurno, ServicioTurno } from '@/app/services/turnos';
import { formatFechaLarga } from './dateUtils';

interface Props {
  profesional: ProfesionalTurno;
  servicio: ServicioTurno;
  fecha: string;
  horaSeleccionada: string;
  onSelect: (hora: string) => void;
}

export default function HorariosTurnos({ profesional, servicio, fecha, horaSeleccionada, onSelect }: Props) {
  const [horarios, setHorarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarHorarios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getHorariosDisponibles({
        id_profesional: profesional.id_profesional,
        id_servicio: servicio.id_servicio,
        fecha,
      });
      setHorarios(data);
    } catch {
      setError('No pudimos cargar los horarios disponibles. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [fecha, profesional.id_profesional, servicio.id_servicio]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  return (
    <div className="turnos-step">
      <div className="turnos-heading">
        <span className="turnos-eyebrow">Paso 4 de 5</span>
        <h1 className="title">Elegí horario</h1>
        <p>{formatFechaLarga(fecha)} con {profesional.nombre}.</p>
      </div>

      {loading ? (
        <p className="turnos-state">Cargando horarios disponibles...</p>
      ) : error ? (
        <div className="turnos-state">
          <p>{error}</p>
          <button className="btn-style turnos-primary-btn" onClick={cargarHorarios}>Reintentar</button>
        </div>
      ) : horarios.length ? (
        <div className="turnos-hours">
          {horarios.map((hora) => (
            <button
              key={hora}
              className={`turnos-hour ${horaSeleccionada === hora ? 'is-selected' : ''}`}
              onClick={() => onSelect(hora)}
            >
              {hora}
            </button>
          ))}
        </div>
      ) : (
        <p className="turnos-state">No hay horarios disponibles para este día.</p>
      )}
    </div>
  );
}
