'use client';
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { adminApi } from '@/app/services/admin';
import type { BloqueoAdmin, ClienteAdmin, ProfesionalAdmin, ServicioAdmin, TurnoAdmin } from '@/app/types/admin';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, money, today, toTime } from './adminUtils';

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function isWithinWorkingHours({
  profesional,
  fecha,
  hora,
  duracion,
}: {
  profesional?: ProfesionalAdmin;
  fecha: string;
  hora: string;
  duracion: number;
}) {
  if (!profesional || !fecha || !hora || !duracion) return false;

  const dia = new Date(`${fecha}T00:00:00`).getDay();
  const inicioTurno = timeToMinutes(hora);
  const finTurno = inicioTurno + duracion;

  return profesional.horarios.some((horario) => {
    if (horario.dia !== dia) return false;

    const inicioHorario = timeToMinutes(toTime(horario.hora_inicio));
    const finHorario = timeToMinutes(toTime(horario.hora_fin));

    return inicioTurno >= inicioHorario && finTurno <= finHorario;
  });
}

export function AgendaAdminPanel({ profesionales, servicios, clientes, reloadAll }: CommonPanelProps) {
  const [fecha, setFecha] = useState(today());
  const [turnos, setTurnos] = useState<TurnoAdmin[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoAdmin[]>([]);
  const [modal, setModal] = useState<{ show: boolean; turno?: TurnoAdmin; defaults?: TurnoDefaults }>({ show: false });

  const loadAgenda = async () => {
    const [turnosResp, bloqueosResp] = await Promise.all([
      adminApi.getTurnos({ desde: fecha, hasta: fecha }),
      adminApi.getBloqueos({ desde: fecha, hasta: fecha }),
    ]);
    setTurnos(turnosResp);
    setBloqueos(bloqueosResp);
  };

  useEffect(() => {
    loadAgenda().catch((error) => Swal.fire('Error', apiMessage(error), 'error'));
  }, [fecha]);

  const dia = new Date(`${fecha}T00:00:00`).getDay();
  const slotStep = useMemo(() => {
    const durations = servicios
      .map((servicio) => Number(servicio.duracion))
      .filter((duration) => Number.isFinite(duration) && duration > 0);

    return durations.length ? Math.min(...durations) : 30;
  }, [servicios]);

  const horarios = useMemo(() => {
    const values = new Set<string>();

    profesionales.forEach((profesional) => {
      profesional.horarios
        .filter((horario) => horario.dia === dia)
        .forEach((horario) => {
          const inicio = timeToMinutes(toTime(horario.hora_inicio));
          const fin = timeToMinutes(toTime(horario.hora_fin));

          for (let minutes = inicio; minutes < fin; minutes += slotStep) {
            values.add(minutesToTime(minutes));
          }
        });
    });

    turnos
      .filter((turno) => turno.estado !== 'CANCELADO')
      .forEach((turno) => values.add(new Date(turno.fechaHora).toTimeString().slice(0, 5)));

    bloqueos.forEach((bloqueo) => {
      if (bloqueo.hora_inicio) values.add(toTime(bloqueo.hora_inicio));
    });
    return Array.from(values).sort();
  }, [profesionales, turnos, bloqueos, dia, slotStep]);

  const moveDay = (amount: number) => {
    const date = new Date(`${fecha}T00:00:00`);
    date.setDate(date.getDate() + amount);
    setFecha(date.toISOString().slice(0, 10));
  };

  const refresh = async () => {
    await reloadAll();
    await loadAgenda();
  };

  return (
    <>
      <div className="admin-agenda-toolbar">
        <button className="admin-icon-btn" onClick={() => moveDay(-1)}><i className="bi bi-chevron-left" /></button>
        <input className="form-control admin-date-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button className="admin-icon-btn" onClick={() => moveDay(1)}><i className="bi bi-chevron-right" /></button>
        <button className="btn-style admin-primary-btn ms-auto" onClick={() => setModal({ show: true, defaults: { fecha } })}>Agregar turno</button>
      </div>

      <div className="admin-agenda-wrap">
        <table className="table admin-agenda-table">
          <thead><tr><th>Horario</th>{profesionales.map((prof) => <th key={prof.id_profesional}>{prof.nombre}</th>)}</tr></thead>
          <tbody>
            {horarios.map((hora) => (
              <tr key={hora}>
                <td className="admin-hour-cell">{hora}</td>
                {profesionales.map((profesional) => {
                  const turno = turnos.find((item) => item.estado !== 'CANCELADO' && item.profesional.id_profesional === profesional.id_profesional && new Date(item.fechaHora).toTimeString().slice(0, 5) === hora);
                  const bloqueado = bloqueos.find((bloqueo) => bloqueo.id_profesional === profesional.id_profesional && (bloqueo.tipo === 'DIA_COMPLETO' || (toTime(bloqueo.hora_inicio) <= hora && toTime(bloqueo.hora_fin) > hora)));
                  const trabaja = profesional.horarios.some((h) => h.dia === dia && toTime(h.hora_inicio) <= hora && toTime(h.hora_fin) > hora);
                  if (turno) {
                    return <td key={profesional.id_profesional} className="agenda-cell agenda-busy" onClick={() => setModal({ show: true, turno })}>{turno.cliente.usuario.nombre}<br /><small>{turno.servicio.nombre} - {turno.paymentStatus}</small></td>;
                  }
                  if (bloqueado) return <td key={profesional.id_profesional} className="agenda-cell agenda-blocked">Bloqueado</td>;
                  if (trabaja) return <td key={profesional.id_profesional} className="agenda-cell agenda-free" onClick={() => setModal({ show: true, defaults: { fecha, hora, id_profesional: profesional.id_profesional } })}>Disponible</td>;
                  return <td key={profesional.id_profesional} className="agenda-cell agenda-out" onClick={() => setModal({ show: true, defaults: { fecha, hora, id_profesional: profesional.id_profesional } })}>Extra</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TurnoAdminModal show={modal.show} turno={modal.turno} defaults={modal.defaults} clientes={clientes} profesionales={profesionales} servicios={servicios} onClose={() => setModal({ show: false })} onSaved={refresh} />
    </>
  );
}

type TurnoFormState = {
  id_cliente: string;
  id_profesional: string;
  id_servicio: string;
  fecha: string;
  hora: string;
  observaciones: string;
  reserva_pagada: boolean;
};

type TurnoDefaults = Partial<Omit<TurnoFormState, 'id_cliente' | 'id_profesional' | 'id_servicio'> & {
  id_cliente: string | number;
  id_profesional: string | number;
  id_servicio: string | number;
}>;

function TurnoAdminModal({ show, turno, defaults, clientes, profesionales, servicios, onClose, onSaved }: { show: boolean; turno?: TurnoAdmin; defaults?: TurnoDefaults; clientes: ClienteAdmin[]; profesionales: ProfesionalAdmin[]; servicios: ServicioAdmin[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<TurnoFormState>({ id_cliente: '', id_profesional: '', id_servicio: '', fecha: today(), hora: '09:00', observaciones: '', reserva_pagada: false });
  const selectedService = servicios.find((servicio) => servicio.id_servicio === Number(form.id_servicio));
  const selectedProfesional = profesionales.find((profesional) => profesional.id_profesional === Number(form.id_profesional));
  const isExtraTurno = Boolean(
    selectedService
    && !isWithinWorkingHours({
      profesional: selectedProfesional,
      fecha: form.fecha,
      hora: form.hora,
      duracion: selectedService.duracion,
    }),
  );

  useEffect(() => {
    if (!show) return;
    setForm({
      id_cliente: turno?.cliente?.id_cliente?.toString() || (defaults?.id_cliente !== undefined ? String(defaults.id_cliente) : ''),
      id_profesional: turno?.profesional?.id_profesional?.toString() || (defaults?.id_profesional !== undefined ? String(defaults.id_profesional) : ''),
      id_servicio: turno?.servicio?.id_servicio?.toString() || (defaults?.id_servicio !== undefined ? String(defaults.id_servicio) : ''),
      fecha: turno ? new Date(turno.fechaHora).toISOString().slice(0, 10) : defaults?.fecha || today(),
      hora: turno ? new Date(turno.fechaHora).toTimeString().slice(0, 5) : defaults?.hora || '09:00',
      observaciones: turno?.observaciones || '',
      reserva_pagada: turno?.paymentStatus === 'APROBADO',
    });
  }, [show, turno, defaults]);

  const submit = async () => {
    try {
      await adminApi.createTurno({
        id_cliente: Number(form.id_cliente),
        id_profesional: Number(form.id_profesional),
        id_servicio: Number(form.id_servicio),
        fecha: form.fecha,
        hora: form.hora,
        observaciones: form.observaciones || undefined,
        forzar_fuera_horario: isExtraTurno,
        reserva_pagada: form.reserva_pagada,
      });
      await onSaved();
      onClose();
      Swal.fire('Listo', 'Turno creado sin Mercado Pago.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  const cancelar = async () => {
    if (!turno) return;
    const result = await Swal.fire({ title: 'Cancelar turno', text: 'Esta accion no usa la regla de 24 hs.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#a18d41' });
    if (!result.isConfirmed) return;
    try {
      await adminApi.cancelarTurno(turno.id_turno);
      await onSaved();
      onClose();
      Swal.fire('Listo', 'Turno cancelado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  const updatePago = async () => {
    if (!turno) return;
    try {
      await adminApi.updateReservaPago(turno.id_turno, !form.reserva_pagada);
      await onSaved();
      setForm({ ...form, reserva_pagada: !form.reserva_pagada });
      Swal.fire('Listo', 'Estado de reserva actualizado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton><Modal.Title>{turno ? 'Ver turno' : 'Agregar turno'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="admin-form-grid">
          <label>Cliente<select className="form-select" value={form.id_cliente} disabled={!!turno} onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}><option value="">Seleccionar</option>{clientes.map((cliente) => <option key={cliente.id_cliente} value={cliente.id_cliente}>{cliente.usuario.nombre} - DNI {cliente.usuario.dni}</option>)}</select></label>
          <label>Profesional<select className="form-select" value={form.id_profesional} disabled={!!turno} onChange={(e) => setForm({ ...form, id_profesional: e.target.value })}><option value="">Seleccionar</option>{profesionales.map((prof) => <option key={prof.id_profesional} value={prof.id_profesional}>{prof.nombre}</option>)}</select></label>
          <label>Servicio<select className="form-select" value={form.id_servicio} disabled={!!turno} onChange={(e) => setForm({ ...form, id_servicio: e.target.value })}><option value="">Seleccionar</option>{servicios.map((servicio) => <option key={servicio.id_servicio} value={servicio.id_servicio}>{servicio.nombre}{!servicio.visible_cliente ? ' (interno)' : ''}</option>)}</select></label>
          <label>Fecha<input className="form-control" type="date" value={form.fecha} readOnly={!!turno} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></label>
          <label>Hora<input className="form-control" type="time" value={form.hora} readOnly={!!turno} onChange={(e) => setForm({ ...form, hora: e.target.value })} /></label>
          <label className="admin-span-2">Observaciones<textarea className="form-control" value={form.observaciones} readOnly={!!turno} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></label>
        </div>
        {selectedService && selectedService.reserva > 0 && <p className="admin-payment-note">Reserva del servicio: {money(selectedService.reserva)}</p>}
        {!turno && isExtraTurno && (
          <p className="admin-payment-note">
            Este turno se guardara como extra porque esta fuera del horario laboral configurado para el profesional.
          </p>
        )}
        <label className="form-check admin-check"><input className="form-check-input" type="checkbox" checked={form.reserva_pagada} disabled={!!turno} onChange={(e) => setForm({ ...form, reserva_pagada: e.target.checked })} />Reserva pagada</label>
        {turno && <div className="admin-list-item">Estado: {turno.estado} | Reserva: {turno.paymentStatus}</div>}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-light" onClick={onClose}>Cerrar</button>
        {turno && turno.servicio.reserva > 0 && <button className="btn btn-outline-secondary" onClick={updatePago}>{form.reserva_pagada ? 'Marcar pendiente' : 'Marcar pagada'}</button>}
        {turno && turno.estado !== 'CANCELADO' && <button className="btn btn-outline-danger" onClick={cancelar}>Cancelar turno</button>}
        {!turno && <button className="btn-style admin-primary-btn" onClick={submit}>Guardar turno</button>}
      </Modal.Footer>
    </Modal>
  );
}

