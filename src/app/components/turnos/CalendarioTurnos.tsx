'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDiasDisponibles } from '@/app/services/turnos';
import type { ProfesionalTurno, ServicioTurno } from '@/app/services/turnos';
import { addDays, formatMes, toISODate } from './dateUtils';

interface Props {
  profesional: ProfesionalTurno;
  servicio: ServicioTurno;
  fechaSeleccionada: string;
  onSelect: (fecha: string) => void;
}

const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CalendarioTurnos({ profesional, servicio, fechaSeleccionada, onSelect }: Props) {
  const today = useMemo(() => new Date(), []);
  const minDate = useMemo(() => addDays(today, 1), [today]);
  const maxDate = useMemo(() => addDays(today, 60), [today]);
  const [visibleMonth, setVisibleMonth] = useState(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDias = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const dias = await getDiasDisponibles({
        id_profesional: profesional.id_profesional,
        id_servicio: servicio.id_servicio,
        desde: toISODate(minDate),
        hasta: toISODate(maxDate),
      });
      setDiasDisponibles(dias);
    } catch {
      setError('No pudimos cargar los días disponibles. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [maxDate, minDate, profesional.id_profesional, servicio.id_servicio]);

  useEffect(() => {
    cargarDias();
  }, [cargarDias]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const lastDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = addDays(firstDay, -startOffset);
    const endOffset = 6 - ((lastDay.getDay() + 6) % 7);
    const totalDays = startOffset + lastDay.getDate() + endOffset;

    return Array.from({ length: totalDays }, (_, index) => addDays(gridStart, index));
  }, [visibleMonth]);

  const canGoPrev = visibleMonth > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canGoNext = visibleMonth < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  const disponiblesSet = new Set(diasDisponibles);

  return (
    <div className="turnos-step">
      <div className="turnos-heading">
        <span className="turnos-eyebrow">Paso 3 de 5</span>
        <h1 className="title">Elegí día</h1>
        <p>Mostramos únicamente los días con turnos disponibles para {servicio.nombre}.</p>
      </div>

      {loading ? (
        <p className="turnos-state">Cargando días disponibles...</p>
      ) : error ? (
        <div className="turnos-state">
          <p>{error}</p>
          <button className="btn-style turnos-primary-btn" onClick={cargarDias}>Reintentar</button>
        </div>
      ) : (
        <div className="turnos-calendar">
          <div className="turnos-calendar-header">
            <button className="turnos-icon-btn" disabled={!canGoPrev} onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <strong>{formatMes(visibleMonth)}</strong>
            <button className="turnos-icon-btn" disabled={!canGoNext} onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>

          <div className="turnos-calendar-grid turnos-weekdays">
            {weekdays.map((weekday, index) => <span key={`${weekday}-${index}`}>{weekday}</span>)}
          </div>

          <div className="turnos-calendar-grid">
            {calendarDays.map((date) => {
              const isoDate = toISODate(date);
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isAvailable = disponiblesSet.has(isoDate);
              const isSelected = fechaSeleccionada === isoDate;

              return (
                <button
                  key={isoDate}
                  className={`turnos-day ${isSelected ? 'is-selected' : ''}`}
                  disabled={!isCurrentMonth || !isAvailable}
                  onClick={() => onSelect(isoDate)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
