'use client';

import type { TurnoCliente } from '@/app/services/turnos';

interface Props {
  turnos: TurnoCliente[];
  loading: boolean;
  error: string;
  cancelandoTurnoId?: number | null;
  onRetry: () => void;
  onReservar: () => void;
  onCancelar: (idTurno: number) => void;
}

const formatTurnoFecha = (fechaHora: string) =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(fechaHora));

const formatTurnoHora = (fechaHora: string) =>
  new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fechaHora));

const puedeCancelar = (fechaHora: string) => {
  const diffMs = new Date(fechaHora).getTime() - Date.now();
  return diffMs >= 24 * 60 * 60 * 1000;
};

export default function MisTurnos({
  turnos,
  loading,
  error,
  cancelandoTurnoId = null,
  onRetry,
  onReservar,
  onCancelar,
}: Props) {
  return (
    <section className="mis-turnos-card">
      <button className="turnos-refresh-btn" onClick={onRetry} aria-label="Actualizar turnos">
        <i className="bi bi-arrow-clockwise"></i>
      </button>

      <div className="turnos-heading mis-turnos-heading">
        <span className="turnos-eyebrow">Agenda</span>
        <h1 className="title">Mis turnos</h1>
        <p>Consultá tus próximas reservas o agendá una nueva atención.</p>
      </div>

      <div className="mis-turnos-actions">
        <button className="btn-style turnos-primary-btn mis-turnos-new-btn" onClick={onReservar}>
          Reservar nuevo turno
        </button>
      </div>

      {loading ? (
        <p className="turnos-state">Cargando tus turnos...</p>
      ) : error ? (
        <div className="turnos-state">
          <p>{error}</p>
          <button className="btn-style turnos-primary-btn" onClick={onRetry}>Reintentar</button>
        </div>
      ) : turnos.length ? (
        <div className="mis-turnos-list">
          {turnos.map((turno) => {
            const cancelable = puedeCancelar(turno.fechaHora);

            return (
              <article className="mis-turnos-item" key={turno.id_turno}>
                <div className="mis-turnos-main">
                  <div>
                    <strong>{turno.servicio.nombre}</strong>
                    <span>{turno.profesional.nombre}</span>
                  </div>
                  <div className="mis-turnos-date">
                    <span>{formatTurnoFecha(turno.fechaHora)}</span>
                    <strong>{formatTurnoHora(turno.fechaHora)}</strong>
                  </div>
                </div>

                <button
                  className="mis-turnos-cancel-btn"
                  disabled={!cancelable || cancelandoTurnoId === turno.id_turno}
                  onClick={() => onCancelar(turno.id_turno)}
                  title={cancelable ? 'Cancelar turno' : 'Solo se puede cancelar con 24 hs de anticipacion'}
                >
                  {cancelandoTurnoId === turno.id_turno ? 'Cancelando...' : 'Cancelar'}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="turnos-state">Todavia no tenes proximos turnos agendados.</p>
      )}
    </section>
  );
}
