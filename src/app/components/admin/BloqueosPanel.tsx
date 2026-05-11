'use client';
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { adminApi } from '@/app/services/admin';
import type { BloqueoAdmin, ProfesionalAdmin } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, today, toTime } from './adminUtils';
export function BloqueosPanel({ profesionales, reloadAll }: CommonPanelProps) {
  const [fecha, setFecha] = useState(today());
  const [bloqueos, setBloqueos] = useState<BloqueoAdmin[]>([]);
  const [modal, setModal] = useState(false);

  const load = async () => {
    setBloqueos(await adminApi.getBloqueos({ desde: fecha, hasta: fecha }));
  };

  useEffect(() => {
    load().catch((error) => Swal.fire('Error', apiMessage(error), 'error'));
  }, [fecha]);

  const columns = useMemo<ColumnDef<BloqueoAdmin>[]>(() => [
    { header: 'Profesional', cell: ({ row }) => row.original.profesional?.nombre || row.original.profesional?.usuario?.nombre || row.original.id_profesional },
    { header: 'Fecha', cell: ({ row }) => row.original.fecha?.slice(0, 10) },
    { header: 'Tipo', accessorKey: 'tipo' },
    { header: 'Horario', cell: ({ row }) => row.original.tipo === 'DIA_COMPLETO' ? 'Todo el dia' : `${toTime(row.original.hora_inicio)}-${toTime(row.original.hora_fin)}` },
    { header: 'Motivo', accessorKey: 'motivo' },
  ], []);

  const remove = async (bloqueo: BloqueoAdmin) => {
    const result = await Swal.fire({ title: 'Eliminar bloqueo', icon: 'warning', showCancelButton: true, confirmButtonColor: '#a18d41' });
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteBloqueo(bloqueo.id);
      await load();
      await reloadAll();
      Swal.fire('Listo', 'Bloqueo eliminado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <>
      <div className="admin-agenda-toolbar">
        <input className="form-control admin-date-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <AdminDataTable data={bloqueos} columns={columns} searchPlaceholder="Buscar bloqueo" createLabel="Agregar bloqueo" onCreate={() => setModal(true)} onDelete={remove} />
      <BloqueoModal show={modal} fecha={fecha} profesionales={profesionales} onClose={() => setModal(false)} onSaved={async () => { await load(); await reloadAll(); }} />
    </>
  );
}

function BloqueoModal({ show, fecha, profesionales, onClose, onSaved }: { show: boolean; fecha: string; profesionales: ProfesionalAdmin[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({ id_profesional: '', fecha, tipo: 'DIA_COMPLETO' as 'DIA_COMPLETO' | 'RANGO_HORARIO', hora_inicio: '09:00', hora_fin: '10:00', motivo: '' });

  useEffect(() => {
    if (show) setForm((current) => ({ ...current, fecha }));
  }, [show, fecha]);

  const submit = async () => {
    try {
      await adminApi.createBloqueo({
        id_profesional: Number(form.id_profesional),
        fecha: form.fecha,
        tipo: form.tipo,
        hora_inicio: form.tipo === 'RANGO_HORARIO' ? form.hora_inicio : undefined,
        hora_fin: form.tipo === 'RANGO_HORARIO' ? form.hora_fin : undefined,
        motivo: form.motivo || undefined,
      });
      await onSaved();
      onClose();
      Swal.fire('Listo', 'Bloqueo creado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton><Modal.Title>Agregar bloqueo</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="admin-form-grid">
          <label>Profesional<select className="form-select" value={form.id_profesional} onChange={(e) => setForm({ ...form, id_profesional: e.target.value })}><option value="">Seleccionar</option>{profesionales.map((prof) => <option key={prof.id_profesional} value={prof.id_profesional}>{prof.nombre}</option>)}</select></label>
          <label>Fecha<input className="form-control" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></label>
          <label>Tipo<select className="form-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as 'DIA_COMPLETO' | 'RANGO_HORARIO' })}><option value="DIA_COMPLETO">Dia completo</option><option value="RANGO_HORARIO">Rango horario</option></select></label>
          {form.tipo === 'RANGO_HORARIO' && <><label>Inicio<input className="form-control" type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} /></label><label>Fin<input className="form-control" type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} /></label></>}
          <label className="admin-span-2">Motivo<textarea className="form-control" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></label>
        </div>
      </Modal.Body>
      <Modal.Footer><button className="btn btn-light" onClick={onClose}>Cerrar</button><button className="btn-style admin-primary-btn" onClick={submit}>Guardar</button></Modal.Footer>
    </Modal>
  );
}
