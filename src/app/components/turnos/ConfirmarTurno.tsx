'use client';

import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { crearTurno } from '@/app/services/turnos';
import type { SeleccionTurno } from './types';
import { formatFechaLarga } from './dateUtils';

interface Props {
  seleccion: SeleccionTurno;
  onReset: () => void;
  onSuccess: () => void;
}

export default function ConfirmarTurno({ seleccion, onReset, onSuccess }: Props) {
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmarTurno = async () => {
    if (!seleccion.profesional || !seleccion.servicio || !seleccion.fecha || !seleccion.hora) return;

    try {
      setLoading(true);
      const response = await crearTurno({
        id_profesional: seleccion.profesional.id_profesional,
        id_servicio: seleccion.servicio.id_servicio,
        fecha: seleccion.fecha,
        hora: seleccion.hora,
        observaciones: observaciones.trim() || undefined,
      });

      if (response.pago?.initPoint) {
        sessionStorage.setItem('ultimo_turno_pago_id', String(response.turno.id_turno));

        await Swal.fire({
          title: 'Tu horario queda reservado',
          text: 'Para confirmar el turno tenes que pagar la reserva. Te vamos a redirigir a Mercado Pago.',
          icon: 'info',
          confirmButtonText: 'Pagar reserva',
          confirmButtonColor: '#a18d41',
          allowOutsideClick: false,
        });

        window.location.assign(response.pago.initPoint);
        return;
      }

      await Swal.fire({
        title: 'Tu turno se agendo correctamente',
        text: 'Te esperamos en el consultorio.',
        icon: 'success',
        confirmButtonColor: '#a18d41',
      });

      onReset();
      onSuccess();
    } catch (error) {
      const backendMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;
      const message = Array.isArray(backendMessage)
        ? backendMessage.join(' ')
        : backendMessage;

      Swal.fire({
        title: 'Algo no salio bien',
        text: message || 'El horario puede haberse ocupado. Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#a18d41',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="turnos-step">
      <div className="turnos-heading">
        <span className="turnos-eyebrow">Paso 5 de 5</span>
        <h1 className="title">Confirma tu turno</h1>
        <p>Revisa los datos antes de reservar.</p>
      </div>

      <div className="turnos-confirm-card">
        <p><strong>Profesional:</strong> {seleccion.profesional?.nombre}</p>
        <p><strong>Tratamiento:</strong> {seleccion.servicio?.nombre}</p>
        <p>
          <strong>Reserva:</strong>{' '}
          {seleccion.servicio?.reserva ? `$${seleccion.servicio.reserva}` : 'No requiere pago previo'}
        </p>
        <p><strong>Dia:</strong> {formatFechaLarga(seleccion.fecha)}</p>
        <p><strong>Hora:</strong> {seleccion.hora}</p>
      </div>

      {!!seleccion.servicio?.reserva && (
        <div className="turnos-payment-note">
          <strong>Importante:</strong> este turno se confirma cuando Mercado Pago aprueba la reserva.
        </div>
      )}

      <label className="turnos-label" htmlFor="observaciones">Observaciones</label>
      <textarea
        id="observaciones"
        className="turnos-textarea"
        placeholder="Podes sumar algun comentario para la consulta."
        value={observaciones}
        onChange={(event) => setObservaciones(event.target.value)}
        rows={3}
      />

      <button className="btn-style turnos-primary-btn" disabled={loading} onClick={confirmarTurno}>
        {loading ? 'Confirmando...' : seleccion.servicio?.reserva ? 'Confirmar y pagar reserva' : 'Confirmar turno'}
      </button>
    </div>
  );
}
