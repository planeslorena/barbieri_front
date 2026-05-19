'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Menu } from '@/app/components/Navbar/navbar';
import { getEstadoPagoTurno, type EstadoPagoTurno } from '@/app/services/turnos';
import './page.css';

const STORAGE_TURNO_KEY = 'ultimo_turno_pago_id';

const fallbackContent = {
  eyebrow: 'Estamos verificando tu pago',
  title: 'Ya casi terminamos',
  text: 'Estamos consultando el estado de tu reserva. En unos segundos tambien podes revisarla desde Mis turnos.',
  icon: 'bi-clock',
  tone: 'pending',
};

function formatTurnoFecha(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));
}

function formatTurnoHora(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getContent(estadoPago: EstadoPagoTurno | null, loadingEstado: boolean) {
  if (loadingEstado) return fallbackContent;

  if (estadoPago?.confirmado && estadoPago.paymentStatus === 'APROBADO') {
    return {
      eyebrow: 'Pago aprobado',
      title: 'Tu turno esta confirmado',
      text: 'Recibimos el pago de la reserva y el turno ya quedo agendado.',
      icon: 'bi-check-circle',
      tone: 'success',
    };
  }

  if (estadoPago?.estado === 'BLOQUEADO' || estadoPago?.paymentStatus === 'PENDIENTE') {
    return {
      eyebrow: 'Pago pendiente',
      title: 'Estamos procesando tu reserva',
      text: 'El turno queda reservado por unos minutos mientras se confirma el pago.',
      icon: 'bi-clock',
      tone: 'pending',
    };
  }

  if (estadoPago?.estado === 'CANCELADO' || ['RECHAZADO', 'CANCELADO', 'REEMBOLSADO'].includes(estadoPago?.paymentStatus || '')) {
    return {
      eyebrow: 'Pago no aprobado',
      title: 'No pudimos confirmar el turno',
      text: 'El pago no se completo. Podes volver a Mis turnos para reservar otro horario.',
      icon: 'bi-x-circle',
      tone: 'error',
    };
  }

  return fallbackContent;
}

export default function ResultadoPago() {
  const searchParams = useSearchParams();
  const [estadoPago, setEstadoPago] = useState<EstadoPagoTurno | null>(null);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [turnoId, setTurnoId] = useState<string | null>(null);

  useEffect(() => {
    const idFromUrl = searchParams.get('external_reference');
    const idFromStorage = sessionStorage.getItem(STORAGE_TURNO_KEY);
    setTurnoId(idFromUrl || idFromStorage);
  }, [searchParams]);

  useEffect(() => {
    if (!turnoId) return;

    const cargarEstado = async () => {
      try {
        setLoadingEstado(true);
        const data = await getEstadoPagoTurno(Number(turnoId), true);
        setEstadoPago(data);

        if (data.confirmado || data.estado === 'CANCELADO') {
          sessionStorage.removeItem(STORAGE_TURNO_KEY);
        }
      } catch {
        setEstadoPago(null);
      } finally {
        setLoadingEstado(false);
      }
    };

    cargarEstado();
  }, [turnoId]);

  const contenido = useMemo(() => getContent(estadoPago, loadingEstado), [estadoPago, loadingEstado]);

  return (
    <>
      <Menu />
      <main className="pago-turno-page">
        <section className={`pago-turno-card pago-turno-${contenido.tone}`}>
          <div className="pago-turno-icon">
            <i className={`bi ${contenido.icon}`}></i>
          </div>

          <div className="pago-turno-heading">
            <span className="turnos-eyebrow">{contenido.eyebrow}</span>
            <h1 className="title">{contenido.title}</h1>
            <p>{contenido.text}</p>
          </div>

          {estadoPago ? (
            <div className="pago-turno-status">
              <strong>Resumen del turno</strong>
              <p>{estadoPago.servicio.nombre}</p>
              <p>{formatTurnoFecha(estadoPago.fechaHora)} a las {formatTurnoHora(estadoPago.fechaHora)}</p>
              <p>Profesional: {estadoPago.profesional.nombre}</p>
            </div>
          ) : (
            <div className="pago-turno-status">
              <strong>Estado del turno</strong>
              <p>
                {turnoId
                  ? 'No pudimos verificar el turno todavia. Revisalo desde Mis turnos en unos segundos.'
                  : 'No recibimos el identificador del turno para verificarlo automaticamente.'}
              </p>
            </div>
          )}

          <div className="pago-turno-actions">
            <Link className="btn-style pago-turno-primary" href="/client">
              Ver mis turnos
            </Link>
            {contenido.tone === 'error' && (
              <Link className="pago-turno-secondary" href="/client">
                Reservar otro horario
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
