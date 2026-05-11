'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { adminApi } from '@/app/services/admin';
import type { DisponibilidadServicioAdmin, HorarioAdmin, ProfesionalAdmin, ServicioAdmin } from '@/app/types/admin';
import { DIAS_SEMANA } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, emptyHorario, toTime } from './adminUtils';
export function ProfesionalesPanel({ profesionales, servicios, reloadAll }: CommonPanelProps) {
  const [modal, setModal] = useState<{ show: boolean; data?: ProfesionalAdmin; readOnly?: boolean }>({ show: false });

  const columns = useMemo<ColumnDef<ProfesionalAdmin>[]>(() => [
    { header: 'Nro.', accessorKey: 'id_profesional' },
    { header: 'Nombre', accessorKey: 'nombre' },
    { header: 'DNI', accessorKey: 'dni' },
    { header: 'Telefono', accessorKey: 'telefono' },
    {
      header: 'Servicios',
      cell: ({ row }) => row.original.servicios.map((servicio) => servicio.nombre).join(', ') || 'Sin servicios',
    },
    {
      header: 'Horarios',
      cell: ({ row }) => row.original.horarios.map((h) => `${DIAS_SEMANA[h.dia]} ${toTime(h.hora_inicio)}-${toTime(h.hora_fin)}`).join(' | ') || 'Sin horarios',
    },
  ], []);

  const deleteProfesional = async (profesional: ProfesionalAdmin) => {
    const result = await Swal.fire({
      title: 'Eliminar profesional',
      text: `Seguro que queres dar de baja a ${profesional.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#a18d41',
    });

    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteProfesional(profesional.id_profesional);
      await reloadAll();
      Swal.fire('Listo', 'Profesional eliminado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <>
      <AdminDataTable
        data={profesionales}
        columns={columns}
        searchPlaceholder="Buscar profesional"
        createLabel="Agregar profesional"
        onCreate={() => setModal({ show: true })}
        onView={(row) => setModal({ show: true, data: row, readOnly: true })}
        onEdit={(row) => setModal({ show: true, data: row })}
        onDelete={deleteProfesional}
      />
      <ProfesionalModal
        show={modal.show}
        data={modal.data}
        readOnly={modal.readOnly}
        servicios={servicios}
        onClose={() => setModal({ show: false })}
        onSaved={reloadAll}
      />
    </>
  );
}

function ProfesionalModal({
  show,
  data,
  readOnly,
  servicios,
  onClose,
  onSaved,
}: {
  show: boolean;
  data?: ProfesionalAdmin;
  readOnly?: boolean;
  servicios: ServicioAdmin[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    mail: '',
    telefono: '',
    fecha_nacimiento: '',
    servicios: [] as number[],
    horarios: [emptyHorario] as HorarioAdmin[],
    disponibilidades: [] as DisponibilidadServicioAdmin[],
  });

  useEffect(() => {
    if (!show) return;
    setForm({
      nombre: data?.nombre || '',
      dni: data?.dni?.toString() || '',
      mail: data?.mail || '',
      telefono: data?.telefono?.toString() || '',
      fecha_nacimiento: data?.fecha_nacimiento || '',
      servicios: data?.servicios.map((servicio) => servicio.id_servicio) || [],
      horarios: data?.horarios.length ? data.horarios : [emptyHorario],
      disponibilidades: data?.disponibilidades || [],
    });
  }, [data, show]);

  const setHorario = (index: number, patch: Partial<HorarioAdmin>) => {
    setForm((current) => ({
      ...current,
      horarios: current.horarios.map((horario, i) => (i === index ? { ...horario, ...patch } : horario)),
    }));
  };

  const setDisponibilidad = (index: number, patch: Partial<DisponibilidadServicioAdmin>) => {
    setForm((current) => ({
      ...current,
      disponibilidades: current.disponibilidades.map((disponibilidad, i) => (
        i === index ? { ...disponibilidad, ...patch } : disponibilidad
      )),
    }));
  };

  const submit = async () => {
    try {
      const payload = {
        nombre: form.nombre,
        dni: Number(form.dni),
        mail: form.mail,
        telefono: Number(form.telefono),
        fecha_nacimiento: form.fecha_nacimiento,
        servicios: form.servicios,
        horarios: form.horarios,
        disponibilidades: form.disponibilidades,
      };

      if (data) await adminApi.updateProfesional(data.id_profesional, payload);
      else await adminApi.createProfesional(payload);

      await onSaved();
      onClose();
      Swal.fire('Listo', 'Profesional guardado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" scrollable backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{readOnly ? 'Ver profesional' : data ? 'Modificar profesional' : 'Agregar profesional'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="admin-form-grid">
          <label>Nombre<input className="form-control" value={form.nombre} readOnly={readOnly} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
          <label>DNI<input className="form-control" type="number" value={form.dni} readOnly={readOnly} onChange={(e) => setForm({ ...form, dni: e.target.value })} /></label>
          <label>Email<input className="form-control" type="email" value={form.mail} readOnly={readOnly} onChange={(e) => setForm({ ...form, mail: e.target.value })} /></label>
          <label>Telefono<input className="form-control" type="number" value={form.telefono} readOnly={readOnly} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></label>
          <label>Fecha nacimiento<input className="form-control" type="date" value={form.fecha_nacimiento} readOnly={readOnly} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} /></label>
        </div>

        <h3 className="admin-modal-subtitle">Servicios</h3>
        <div className="admin-checkbox-grid">
          {servicios.map((servicio) => (
            <label key={servicio.id_servicio} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                disabled={readOnly}
                checked={form.servicios.includes(servicio.id_servicio)}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    servicios: event.target.checked
                      ? [...current.servicios, servicio.id_servicio]
                      : current.servicios.filter((id) => id !== servicio.id_servicio),
                  }));
                }}
              />
              <span>{servicio.nombre}</span>
            </label>
          ))}
        </div>

        <h3 className="admin-modal-subtitle">Horarios base</h3>
        {form.horarios.map((horario, index) => (
          <div className="admin-inline-row" key={`horario-${index}`}>
            <select className="form-select" value={horario.dia} disabled={readOnly} onChange={(e) => setHorario(index, { dia: Number(e.target.value) })}>
              {Object.entries(DIAS_SEMANA).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input className="form-control" type="time" value={toTime(horario.hora_inicio)} readOnly={readOnly} onChange={(e) => setHorario(index, { hora_inicio: e.target.value })} />
            <input className="form-control" type="time" value={toTime(horario.hora_fin)} readOnly={readOnly} onChange={(e) => setHorario(index, { hora_fin: e.target.value })} />
            {!readOnly && <button type="button" className="admin-icon-btn admin-icon-danger" onClick={() => setForm({ ...form, horarios: form.horarios.filter((_, i) => i !== index) })}><i className="bi bi-x-lg" /></button>}
          </div>
        ))}
        {!readOnly && <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={() => setForm({ ...form, horarios: [...form.horarios, emptyHorario] })}>Agregar horario</button>}

        <h3 className="admin-modal-subtitle">Disponibilidad por servicio</h3>
        {form.disponibilidades.map((disponibilidad, index) => (
          <div className="admin-inline-row" key={`disp-${index}`}>
            <select className="form-select" value={disponibilidad.id_servicio} disabled={readOnly} onChange={(e) => setDisponibilidad(index, { id_servicio: Number(e.target.value) })}>
              {servicios.map((servicio) => <option key={servicio.id_servicio} value={servicio.id_servicio}>{servicio.nombre}</option>)}
            </select>
            <select className="form-select" value={disponibilidad.dia} disabled={readOnly} onChange={(e) => setDisponibilidad(index, { dia: Number(e.target.value) })}>
              {Object.entries(DIAS_SEMANA).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input className="form-control" type="time" value={toTime(disponibilidad.hora_inicio)} readOnly={readOnly} onChange={(e) => setDisponibilidad(index, { hora_inicio: e.target.value })} />
            <input className="form-control" type="time" value={toTime(disponibilidad.hora_fin)} readOnly={readOnly} onChange={(e) => setDisponibilidad(index, { hora_fin: e.target.value })} />
            {!readOnly && <button type="button" className="admin-icon-btn admin-icon-danger" onClick={() => setForm({ ...form, disponibilidades: form.disponibilidades.filter((_, i) => i !== index) })}><i className="bi bi-x-lg" /></button>}
          </div>
        ))}
        {!readOnly && servicios.length > 0 && (
          <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={() => setForm({ ...form, disponibilidades: [...form.disponibilidades, { ...emptyHorario, id_servicio: servicios[0].id_servicio }] })}>
            Agregar disponibilidad especifica
          </button>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-light" onClick={onClose}>Cerrar</button>
        {!readOnly && <button type="button" className="btn-style admin-primary-btn" onClick={submit}>Guardar</button>}
      </Modal.Footer>
    </Modal>
  );
}
