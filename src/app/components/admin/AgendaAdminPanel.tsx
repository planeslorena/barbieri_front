'use client';
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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

function dateFromInput(value: string) {
  return new Date(`${value}T00:00:00`);
}

function dateToInputValue(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(value: string, amount: number) {
  const date = dateFromInput(value);
  date.setDate(date.getDate() + amount);
  return dateToInputValue(date);
}

function getWeekStart(value: string) {
  const date = dateFromInput(value);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return dateToInputValue(date);
}

function getDateKey(value: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return dateToInputValue(new Date(value));
}

function formatDayMonth(value: string) {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
}

const weekDayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function getArgentinaNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value || '00';

  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  };
}

function isPastSlot(fecha: string, hora: string) {
  const now = getArgentinaNow();
  if (fecha < now.date) return true;
  if (fecha > now.date) return false;
  return timeToMinutes(hora) <= now.minutes;
}

function isServicioEliminado(servicio?: ServicioAdmin | null) {
  return !servicio || Boolean(servicio.deletedAt);
}

function getServicioNombre(servicio?: ServicioAdmin | null) {
  return servicio?.nombre || 'Servicio eliminado';
}

function getTurnoStart(turno: TurnoAdmin) {
  return new Date(turno.fechaHora).toTimeString().slice(0, 5);
}

function getTurnoInterval(turno: TurnoAdmin) {
  const start = timeToMinutes(getTurnoStart(turno));
  const end = start + Number(turno.servicio?.duracion || 0);
  return { start, end };
}

function isExtraTurno(turno: TurnoAdmin, profesional?: ProfesionalAdmin) {
  return !isWithinWorkingHours({
    profesional: profesional || turno.profesional,
    fecha: getDateKey(turno.fechaHora),
    hora: getTurnoStart(turno),
    duracion: Number(turno.servicio?.duracion || 0),
  });
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
  if (!profesional?.horarios?.length || !fecha || !hora || !duracion) return false;

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
  const [selectedProfesionalId, setSelectedProfesionalId] = useState('');
  const [turnos, setTurnos] = useState<TurnoAdmin[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoAdmin[]>([]);
  const [modal, setModal] = useState<{ show: boolean; turno?: TurnoAdmin; defaults?: TurnoDefaults }>({ show: false });
  const profesionalesActivos = useMemo(() => profesionales.filter((profesional) => !profesional.deletedAt), [profesionales]);

  useEffect(() => {
    if (!profesionalesActivos.length) {
      setSelectedProfesionalId('');
      return;
    }

    const exists = profesionalesActivos.some((profesional) => profesional.id_profesional === Number(selectedProfesionalId));
    if (!exists) setSelectedProfesionalId(String(profesionalesActivos[0].id_profesional));
  }, [profesionalesActivos, selectedProfesionalId]);

  const selectedProfesional = useMemo(
    () => profesionalesActivos.find((profesional) => profesional.id_profesional === Number(selectedProfesionalId)),
    [profesionalesActivos, selectedProfesionalId],
  );
  const weekStart = useMemo(() => getWeekStart(fecha), [fecha]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const visibleWeekDays = useMemo(() => {
    if (!selectedProfesional) return [];

    return weekDays.filter((weekDay) => {
      const dia = dateFromInput(weekDay).getDay();
      const hasWorkingHours = selectedProfesional.horarios.some((horario) => horario.dia === dia);
      const hasTurnos = turnos.some((turno) => (
        turno.estado !== 'CANCELADO'
        && turno.profesional.id_profesional === selectedProfesional.id_profesional
        && getDateKey(turno.fechaHora) === weekDay
      ));

      return hasWorkingHours || hasTurnos;
    });
  }, [selectedProfesional, turnos, weekDays]);
  const weekEnd = weekDays[6];

  const loadAgenda = async () => {
    if (!selectedProfesional) {
      setTurnos([]);
      setBloqueos([]);
      return;
    }

    const [turnosResp, bloqueosResp] = await Promise.all([
      adminApi.getTurnos({ desde: weekStart, hasta: weekEnd, id_profesional: selectedProfesional.id_profesional }),
      adminApi.getBloqueos({ desde: weekStart, hasta: weekEnd, id_profesional: selectedProfesional.id_profesional }),
    ]);
    setTurnos(turnosResp);
    setBloqueos(bloqueosResp);
  };

  useEffect(() => {
    loadAgenda().catch((error) => Swal.fire('Error', apiMessage(error), 'error'));
  }, [selectedProfesional, weekStart, weekEnd]);

  const slotStep = useMemo(() => {
    const durations = servicios
      .map((servicio) => Number(servicio.duracion))
      .filter((duration) => Number.isFinite(duration) && duration > 0);

    return durations.length ? Math.min(...durations) : 30;
  }, [servicios]);

  const horarios = useMemo(() => {
    const values = new Set<string>();
    const visibleDates = new Set(visibleWeekDays);
    const visibleWeekDayIndexes = new Set(visibleWeekDays.map((weekDay) => dateFromInput(weekDay).getDay()));

    selectedProfesional?.horarios
      .filter((horario) => visibleWeekDayIndexes.has(horario.dia))
      .forEach((horario) => {
        const inicio = timeToMinutes(toTime(horario.hora_inicio));
        const fin = timeToMinutes(toTime(horario.hora_fin));

        for (let minutes = inicio; minutes < fin; minutes += slotStep) {
          values.add(minutesToTime(minutes));
        }
      });

    turnos
      .filter((turno) => turno.estado !== 'CANCELADO')
      .filter((turno) => visibleDates.has(getDateKey(turno.fechaHora)))
      .forEach((turno) => values.add(new Date(turno.fechaHora).toTimeString().slice(0, 5)));

    bloqueos.filter((bloqueo) => visibleDates.has(getDateKey(bloqueo.fecha))).forEach((bloqueo) => {
      if (bloqueo.hora_inicio) values.add(toTime(bloqueo.hora_inicio));
    });
    return Array.from(values).sort();
  }, [selectedProfesional, turnos, bloqueos, slotStep, visibleWeekDays]);

  const turnosPorDia = useMemo(() => {
    const grupos = new Map<string, TurnoAdmin[]>();

    turnos
      .filter((turno) => turno.estado !== 'CANCELADO')
      .forEach((turno) => {
        const fechaTurno = getDateKey(turno.fechaHora);
        const actuales = grupos.get(fechaTurno) || [];
        grupos.set(fechaTurno, [...actuales, turno]);
      });

    return grupos;
  }, [turnos]);

  const bloquesTurnosPorDia = useMemo(() => {
    const bloques = new Map<
      string,
      Array<{ start: number; end: number; turnos: TurnoAdmin[] }>
    >();

    turnosPorDia.forEach((turnosDia, fechaTurno) => {
      const ordenados = [...turnosDia].sort((a, b) => {
        const intervalA = getTurnoInterval(a);
        const intervalB = getTurnoInterval(b);
        return intervalA.start - intervalB.start || a.id_turno - b.id_turno;
      });

      const bloquesDia: Array<{ start: number; end: number; turnos: TurnoAdmin[] }> = [];

      ordenados.forEach((turno) => {
        const interval = getTurnoInterval(turno);
        const ultimoBloque = bloquesDia[bloquesDia.length - 1];

        if (ultimoBloque && interval.start < ultimoBloque.end) {
          ultimoBloque.end = Math.max(ultimoBloque.end, interval.end);
          ultimoBloque.turnos.push(turno);
          return;
        }

        bloquesDia.push({
          start: interval.start,
          end: interval.end,
          turnos: [turno],
        });
      });

      bloques.set(fechaTurno, bloquesDia);
    });

    return bloques;
  }, [turnosPorDia]);

  const getRowSpanForBlock = (start: number, end: number) => {
    const rowsInBlock = horarios.filter((hora) => {
      const minutes = timeToMinutes(hora);
      return minutes >= start && minutes < end;
    });

    return Math.max(rowsInBlock.length, 1);
  };

  const moveWeek = (amount: number) => {
    setFecha(addDays(fecha, amount * 7));
  };

  const refresh = async () => {
    await reloadAll();
    await loadAgenda();
  };

  return (
    <>
      <div className="admin-agenda-toolbar">
        <select className="form-select admin-professional-select" value={selectedProfesionalId} onChange={(e) => setSelectedProfesionalId(e.target.value)}>
          {profesionalesActivos.map((profesional) => (
            <option key={profesional.id_profesional} value={profesional.id_profesional}>{profesional.nombre}</option>
          ))}
        </select>
        <button className="admin-icon-btn" onClick={() => moveWeek(-1)}><i className="bi bi-chevron-left" /></button>
        <input className="form-control admin-date-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button className="admin-icon-btn" onClick={() => moveWeek(1)}><i className="bi bi-chevron-right" /></button>
        <button className="btn-style admin-primary-btn ms-auto" onClick={() => setModal({ show: true, defaults: { fecha, id_profesional: selectedProfesional?.id_profesional } })}>Agregar turno</button>
      </div>

      <div className="admin-agenda-wrap">
        <table className="table admin-agenda-table">
          <thead>
            <tr>
              <th>Horario</th>
              {visibleWeekDays.map((weekDay) => {
                const date = dateFromInput(weekDay);
                return <th key={weekDay}>{weekDayNames[date.getDay()]} {formatDayMonth(weekDay)}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {selectedProfesional && visibleWeekDays.length > 0 && horarios.map((hora) => (
              <tr key={hora}>
                <td className="admin-hour-cell">{hora}</td>
                {visibleWeekDays.map((weekDay) => {
                  const dia = dateFromInput(weekDay).getDay();
                  const horaMinutos = timeToMinutes(hora);
                  const bloqueTurno = bloquesTurnosPorDia
                    .get(weekDay)
                    ?.find((bloque) => horaMinutos >= bloque.start && horaMinutos < bloque.end);

                  if (bloqueTurno) {
                    if (horaMinutos !== bloqueTurno.start) return null;

                    const [turnoPrincipal, ...sobreturnos] = bloqueTurno.turnos;
                    const rowSpan = getRowSpanForBlock(bloqueTurno.start, bloqueTurno.end);
                    const turnoPrincipalExtra = isExtraTurno(turnoPrincipal, selectedProfesional);

                    return (
                      <td
                        key={weekDay}
                        rowSpan={rowSpan}
                        className={`agenda-cell agenda-busy ${sobreturnos.length ? 'agenda-overbooked' : ''}`}
                        onClick={() => setModal({ show: true, turno: turnoPrincipal })}
                      >
                        {turnoPrincipalExtra && <span className="agenda-extra-badge">Extra</span>}
                        <strong>{turnoPrincipal.cliente.usuario.nombre}</strong>
                        <br />
                        <small>Tel: {turnoPrincipal.cliente.usuario.telefono}</small>
                        <br />
                        <small>{getTurnoStart(turnoPrincipal)} - {minutesToTime(getTurnoInterval(turnoPrincipal).end)}</small>
                        <br />
                        <small>
                          {getServicioNombre(turnoPrincipal.servicio)}
                          {isServicioEliminado(turnoPrincipal.servicio) && <span className="agenda-service-deleted">Servicio Eliminado</span>}
                          {' - '}
                          {turnoPrincipal.paymentStatus}
                        </small>
                        {sobreturnos.map((sobreturno) => (
                          <div className="agenda-overbook-item" key={sobreturno.id_turno}>
                            <span>Sobreturno</span>
                            {isExtraTurno(sobreturno, selectedProfesional) && <span className="agenda-extra-badge">Extra</span>}
                            <strong>{sobreturno.cliente.usuario.nombre}</strong>
                            <small>Tel: {sobreturno.cliente.usuario.telefono}</small>
                            <small>
                              {getServicioNombre(sobreturno.servicio)}
                              {isServicioEliminado(sobreturno.servicio) && <span className="agenda-service-deleted">Servicio Eliminado</span>}
                              {' - '}
                              {sobreturno.paymentStatus}
                            </small>
                            <small>{getTurnoStart(sobreturno)} - {minutesToTime(getTurnoInterval(sobreturno).end)}</small>
                          </div>
                        ))}
                      </td>
                    );
                  }

                  const trabaja = selectedProfesional.horarios.some((h) => h.dia === dia && toTime(h.hora_inicio) <= hora && toTime(h.hora_fin) > hora);
                  if (!trabaja) 
                    return <td key={weekDay} className="agenda-cell agenda-out">-</td>;
                  const bloqueado = bloqueos.find((bloqueo) => bloqueo.id_profesional === selectedProfesional.id_profesional && getDateKey(bloqueo.fecha) === weekDay && (bloqueo.tipo === 'DIA_COMPLETO' || (toTime(bloqueo.hora_inicio) <= hora && toTime(bloqueo.hora_fin) > hora)));
                  if (bloqueado) 
                    return (
                      <td key={weekDay} className="agenda-cell agenda-blocked">
                        <span>Bloqueado</span>
                        {bloqueado.motivo && <small>{bloqueado.motivo}</small>}
                      </td>
                    );
                  if (isPastSlot(weekDay, hora)) 
                    return <td key={weekDay} className="agenda-cell agenda-out">-</td>;
                  return <td key={weekDay} className="agenda-cell agenda-free" onClick={() => setModal({ show: true, defaults: { fecha: weekDay, hora, id_profesional: selectedProfesional.id_profesional } })}>Disponible</td>;
                })}
              </tr>
            ))}
            {selectedProfesional && visibleWeekDays.length === 0 && (
              <tr>
                <td className="admin-hour-cell" colSpan={visibleWeekDays.length + 1}>El profesional no atiende esta semana.</td>
              </tr>
            )}
            {!selectedProfesional && (
              <tr>
                <td className="admin-hour-cell" colSpan={visibleWeekDays.length + 1}>No hay profesionales activos cargados.</td>
              </tr>
            )}
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

const turnoSchema = yup.object({
  id_cliente: yup.string().required('Debe seleccionar un cliente'),
  id_profesional: yup.string().required('Debe seleccionar un profesional'),
  id_servicio: yup.string().required('Debe seleccionar un servicio'),
  fecha: yup.string().required('La fecha es requerida'),
  hora: yup.string().required('La hora es requerida'),
  observaciones: yup.string().default(''),
  reserva_pagada: yup.boolean().required(),
});

type TurnoDefaults = Partial<Omit<TurnoFormState, 'id_cliente' | 'id_profesional' | 'id_servicio'> & {
  id_cliente: string | number;
  id_profesional: string | number;
  id_servicio: string | number;
}>;

function TurnoAdminModal({
  show,
  turno,
  defaults,
  clientes,
  profesionales,
  servicios,
  onClose,
  onSaved,
}: {
  show: boolean;
  turno?: TurnoAdmin;
  defaults?: TurnoDefaults;
  clientes: ClienteAdmin[];
  profesionales: ProfesionalAdmin[];
  servicios: ServicioAdmin[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<TurnoFormState>({
    mode: 'onChange',
    resolver: yupResolver(turnoSchema),
    defaultValues: {
      id_cliente: '',
      id_profesional: '',
      id_servicio: '',
      fecha: today(),
      hora: '09:00',
      observaciones: '',
      reserva_pagada: false,
    },
  });

  const formValues = useWatch({ control });
  const locksSlotDefaults = Boolean(!turno && defaults?.id_profesional && defaults?.fecha && defaults?.hora);
  const selectedProfesional = profesionales.find(
    (profesional) => profesional.id_profesional === Number(formValues.id_profesional),
  );
  const serviciosDelProfesional = useMemo(() => {
    if (!selectedProfesional) return turno?.servicio ? [turno.servicio] : [];

    const serviciosAsignados = (selectedProfesional.servicios || []).filter((servicio) => !servicio.deletedAt);
    if (turno?.servicio && !serviciosAsignados.some((servicio) => servicio.id_servicio === turno.servicio.id_servicio)) {
      return [turno.servicio, ...serviciosAsignados];
    }

    return serviciosAsignados;
  }, [selectedProfesional, turno]);
  const selectedService = serviciosDelProfesional.find((servicio) => servicio.id_servicio === Number(formValues.id_servicio))
    || servicios.find((servicio) => servicio.id_servicio === Number(formValues.id_servicio));
  const isExtraTurno = Boolean(
    selectedService
    && !isWithinWorkingHours({
      profesional: selectedProfesional,
      fecha: formValues.fecha || today(),
      hora: formValues.hora || '09:00',
      duracion: selectedService.duracion,
    }),
  );

  useEffect(() => {
    if (!show) return;

    reset({
      id_cliente: turno?.cliente?.id_cliente?.toString() || (defaults?.id_cliente !== undefined ? String(defaults.id_cliente) : ''),
      id_profesional:
        turno?.profesional?.id_profesional?.toString()
        || (defaults?.id_profesional !== undefined ? String(defaults.id_profesional) : ''),
      id_servicio: turno?.servicio?.id_servicio?.toString() || (defaults?.id_servicio !== undefined ? String(defaults.id_servicio) : ''),
      fecha: turno ? new Date(turno.fechaHora).toISOString().slice(0, 10) : defaults?.fecha || today(),
      hora: turno ? new Date(turno.fechaHora).toTimeString().slice(0, 5) : defaults?.hora || '09:00',
      observaciones: turno?.observaciones || '',
      reserva_pagada: turno?.paymentStatus === 'APROBADO',
    });
  }, [defaults, reset, show, turno]);

  useEffect(() => {
    if (!show || turno || !formValues.id_servicio) return;

    const servicioDisponible = serviciosDelProfesional.some(
      (servicio) => servicio.id_servicio === Number(formValues.id_servicio),
    );

    if (!servicioDisponible) {
      setValue('id_servicio', '', { shouldValidate: true });
    }
  }, [formValues.id_servicio, serviciosDelProfesional, setValue, show, turno]);

  const submit = handleSubmit(async (values) => {
    const payload = {
      id_cliente: Number(values.id_cliente),
      id_profesional: Number(values.id_profesional),
      id_servicio: Number(values.id_servicio),
      fecha: values.fecha,
      hora: values.hora,
      observaciones: values.observaciones || undefined,
      forzar_fuera_horario: isExtraTurno,
      reserva_pagada: values.reserva_pagada,
    };

    try {
      await adminApi.createTurno(payload);
      await onSaved();
      onClose();
      Swal.fire('Listo', 'Turno creado sin Mercado Pago.', 'success');
    } catch (error) {
      const message = apiMessage(error);

      if (message.toLowerCase().includes('superpone')) {
        const result = await Swal.fire({
          title: 'Crear sobreturno',
          text: 'El turno se superpone con otro turno existente. Queres guardarlo igual como sobreturno?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Guardar sobreturno',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#a18d41',
        });

        if (!result.isConfirmed) return;

        try {
          await adminApi.createTurno({
            ...payload,
            confirmar_sobreturno: true,
          });
          await onSaved();
          onClose();
          Swal.fire('Listo', 'Sobreturno creado.', 'success');
        } catch (retryError) {
          Swal.fire('Error', apiMessage(retryError), 'error');
        }

        return;
      }

      Swal.fire('Error', message, 'error');
    }
  });

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
      const nextReservaPagada = !formValues.reserva_pagada;
      await adminApi.updateReservaPago(turno.id_turno, nextReservaPagada);
      await onSaved();
      setValue('reserva_pagada', nextReservaPagada);
      Swal.fire('Listo', 'Estado de reserva actualizado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{turno ? 'Ver turno' : 'Agregar turno'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="turno-admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <label>
              Cliente
              <select
                className={`form-select ${errors.id_cliente ? 'is-invalid' : ''}`}
                disabled={!!turno}
                {...register('id_cliente')}
              >
                <option value="">Seleccionar</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id_cliente} value={cliente.id_cliente}>
                    {cliente.usuario.nombre} - DNI {cliente.usuario.dni}
                  </option>
                ))}
              </select>
              {errors.id_cliente && <div className="invalid-feedback">{errors.id_cliente.message}</div>}
            </label>

            <label>
              Profesional
              <select
                className={`form-select ${errors.id_profesional ? 'is-invalid' : ''}`}
                disabled={!!turno || locksSlotDefaults}
                {...register('id_profesional')}
              >
                <option value="">Seleccionar</option>
                {profesionales.map((profesional) => (
                  <option key={profesional.id_profesional} value={profesional.id_profesional}>
                    {profesional.nombre}
                  </option>
                ))}
              </select>
              {errors.id_profesional && <div className="invalid-feedback">{errors.id_profesional.message}</div>}
            </label>

            <label>
              Servicio
              <select
                className={`form-select ${errors.id_servicio ? 'is-invalid' : ''}`}
                disabled={!!turno || !selectedProfesional}
                {...register('id_servicio')}
              >
                <option value="">{selectedProfesional ? 'Seleccionar' : 'Seleccionar profesional'}</option>
                {serviciosDelProfesional.map((servicio) => (
                  <option key={servicio.id_servicio} value={servicio.id_servicio}>
                    {servicio.nombre}
                    {!servicio.visible_cliente ? ' (interno)' : ''}
                  </option>
                ))}
              </select>
              {errors.id_servicio && <div className="invalid-feedback">{errors.id_servicio.message}</div>}
            </label>

            <label>
              Fecha
              <input
                className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
                readOnly={!!turno || locksSlotDefaults}
                type="date"
                {...register('fecha')}
              />
              {errors.fecha && <div className="invalid-feedback">{errors.fecha.message}</div>}
            </label>

            <label>
              Hora
              <input
                className={`form-control ${errors.hora ? 'is-invalid' : ''}`}
                readOnly={!!turno || locksSlotDefaults}
                type="time"
                {...register('hora')}
              />
              {errors.hora && <div className="invalid-feedback">{errors.hora.message}</div>}
            </label>

            <label className="admin-span-2">
              Observaciones
              <textarea className="form-control" readOnly={!!turno} {...register('observaciones')} />
            </label>
          </div>
        </form>

        {selectedService && selectedService.reserva > 0 && <p className="admin-payment-note">Reserva del servicio: {money(selectedService.reserva)}</p>}
        {!turno && isExtraTurno && (
          <p className="admin-payment-note">
            Este turno se guardara como extra porque esta fuera del horario laboral configurado para el profesional.
          </p>
        )}
        <label className="form-check admin-check">
          <input className="form-check-input" disabled={!!turno} type="checkbox" {...register('reserva_pagada')} />
          Reserva pagada
        </label>
        {turno && <div className="admin-list-item">Estado: {turno.estado} | Reserva: {turno.paymentStatus}</div>}
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-light" type="button" onClick={onClose}>
          Cerrar
        </button>
        {turno && turno.servicio.reserva > 0 && (
          <button className="btn btn-outline-secondary" type="button" onClick={updatePago}>
            {formValues.reserva_pagada ? 'Marcar pendiente' : 'Marcar pagada'}
          </button>
        )}
        {turno && turno.estado !== 'CANCELADO' && (
          <button className="btn btn-outline-danger" type="button" onClick={cancelar}>
            Cancelar turno
          </button>
        )}
        {!turno && (
          <button className="btn-style admin-primary-btn" disabled={isSubmitting} form="turno-admin-form" type="submit">
            Guardar turno
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
