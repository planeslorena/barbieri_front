'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Menu } from '@/app/components/Navbar/navbar';
import { getEstadoPagoTurno, type EstadoPagoTurno } from '@/app/services/turnos';
import './page.css';

const mensajes = {
  exitoso: {
    eyebrow: 'Pago aprobado',
    title: 'Tu reserva fue pagada',
    text: 'Mercado Pago aprobo el pago. Estamos verificando si el webhook ya confirmo tu turno.',
    icon: 'bi-check-circle',
    tone: 'success',
  },
  fallido: {
    eyebrow: 'Pago no aprobado',
    title: 'No pudimos confirmar el turno',
    text: 'El pago fue rechazado o cancelado. El horario no queda confirmado y vas a poder intentar reservar nuevamente.',
    icon: 'bi-x-circle',
    tone: 'error',
  },
  pendiente: {
    eyebrow: 'Pago pendiente',
    title: 'Tu pago esta pendiente',
    text: 'El turno queda bloqueado por unos minutos. Cuando Mercado Pago apruebe el pago, se confirmara automaticamente.',
    icon: 'bi-clock',
    tone: 'pending',
  },
};

export default function ResultadoPago() {
  const params = useParams<{ resultado: string }>();
  const searchParams = useSearchParams();
  const [estadoPago, setEstadoPago] = useState<EstadoPagoTurno | null>(null);
  const [loadingEstado, setLoadingEstado] = useState(false);

  const resultado = params.resultado as keyof typeof mensajes;
  const contenido = mensajes[resultado] || mensajes.pendiente;
  const turnoId = searchParams.get('external_reference');
  const status = searchParams.get('status');
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');

  useEffect(() => {
    if (!turnoId) return;

    const cargarEstado = async () => {
      try {
        setLoadingEstado(true);
        const data = await getEstadoPagoTurno(Number(turnoId), true);
        setEstadoPago(data);
      } catch {
        setEstadoPago(null);
      } finally {
        setLoadingEstado(false);
      }
    };

    cargarEstado();
  }, [turnoId]);

  const mensajeConfirmacion = useMemo(() => {
    if (loadingEstado) return 'Estamos consultando el estado final del turno.';
    if (!turnoId) return 'No recibimos el identificador del turno para verificarlo automaticamente.';
    if (!estadoPago) return 'No pudimos verificar el turno todavia. Revisalo desde Mis turnos en unos segundos.';
    if (estadoPago.confirmado) return 'El turno figura confirmado en el sistema.';
    if (estadoPago.estado === 'BLOQUEADO') return 'El turno sigue bloqueado mientras se termina de procesar el pago.';
    return 'El turno no figura confirmado en el sistema.';
  }, [estadoPago, loadingEstado, turnoId]);

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

          <div className="pago-turno-status">
            <strong>Estado del turno</strong>
            <p>{mensajeConfirmacion}</p>
          </div>

          <div className="pago-turno-detail">
            {status && (
              <p><strong>Estado informado:</strong> {status}</p>
            )}
            {estadoPago?.paymentStatus && (
              <p><strong>Pago en sistema:</strong> {estadoPago.paymentStatus}</p>
            )}
            {paymentId && (
              <p><strong>ID de pago:</strong> {paymentId}</p>
            )}
            {turnoId && (
              <p><strong>Turno:</strong> #{turnoId}</p>
            )}
          </div>

          <div className="pago-turno-actions">
            <Link className="btn-style pago-turno-primary" href="/client">
              Ver mis turnos
            </Link>
            {resultado !== 'exitoso' && (
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
