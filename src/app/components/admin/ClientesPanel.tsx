'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { adminApi } from '@/app/services/admin';
import type { ClienteAdmin } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, formatDateTime } from './adminUtils';
export function ClientesPanel({ clientes, reloadAll }: CommonPanelProps) {
  const [modal, setModal] = useState<{ show: boolean; data?: ClienteAdmin; readOnly?: boolean }>({ show: false });
  const columns = useMemo<ColumnDef<ClienteAdmin>[]>(() => [
    { header: 'Nro.', accessorKey: 'id_cliente' },
    { header: 'Nombre', cell: ({ row }) => row.original.usuario?.nombre },
    { header: 'DNI', cell: ({ row }) => row.original.usuario?.dni },
    { header: 'Telefono', cell: ({ row }) => row.original.usuario?.telefono },
    { header: 'Email', cell: ({ row }) => row.original.usuario?.mail },
    { header: 'Proximos turnos', cell: ({ row }) => row.original.turnos?.filter((turno) => turno.estado === 'CONFIRMADO').length || 0 },
  ], []);

  const removeCliente = async (cliente: ClienteAdmin) => {
    const result = await Swal.fire({ title: 'Eliminar cliente', text: cliente.usuario.nombre, icon: 'warning', showCancelButton: true, confirmButtonColor: '#a18d41' });
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteCliente(cliente.id_cliente);
      await reloadAll();
      Swal.fire('Listo', 'Cliente eliminado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <>
      <AdminDataTable data={clientes} columns={columns} searchPlaceholder="Buscar cliente" createLabel="Agregar cliente" onCreate={() => setModal({ show: true })} onView={(row) => setModal({ show: true, data: row, readOnly: true })} onEdit={(row) => setModal({ show: true, data: row })} onDelete={removeCliente} />
      <ClienteModal show={modal.show} data={modal.data} readOnly={modal.readOnly} onClose={() => setModal({ show: false })} onSaved={reloadAll} />
    </>
  );
}

function ClienteModal({ show, data, readOnly, onClose, onSaved }: { show: boolean; data?: ClienteAdmin; readOnly?: boolean; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({ nombre: '', dni: '', mail: '', telefono: '', fecha_nacimiento: '' });

  useEffect(() => {
    if (!show) return;
    setForm({
      nombre: data?.usuario?.nombre || '',
      dni: data?.usuario?.dni?.toString() || '',
      mail: data?.usuario?.mail || '',
      telefono: data?.usuario?.telefono?.toString() || '',
      fecha_nacimiento: data?.fecha_nacimiento || '',
    });
  }, [data, show]);

  const submit = async () => {
    try {
      const payload = { ...form, dni: Number(form.dni), telefono: Number(form.telefono) };
      if (data) await adminApi.updateCliente(data.id_cliente, payload);
      else await adminApi.createCliente(payload);
      await onSaved();
      onClose();
      Swal.fire('Listo', 'Cliente guardado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" scrollable backdrop="static">
      <Modal.Header closeButton><Modal.Title>{readOnly ? 'Ver cliente' : data ? 'Modificar cliente' : 'Agregar cliente'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="admin-form-grid">
          <label>Nombre<input className="form-control" value={form.nombre} readOnly={readOnly} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
          <label>DNI<input className="form-control" type="number" value={form.dni} readOnly={readOnly} onChange={(e) => setForm({ ...form, dni: e.target.value })} /></label>
          <label>Email<input className="form-control" type="email" value={form.mail} readOnly={readOnly} onChange={(e) => setForm({ ...form, mail: e.target.value })} /></label>
          <label>Telefono<input className="form-control" type="number" value={form.telefono} readOnly={readOnly} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></label>
          <label>Fecha nacimiento<input className="form-control" type="date" value={form.fecha_nacimiento} readOnly={readOnly} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} /></label>
        </div>
        {data?.turnos?.length ? <h3 className="admin-modal-subtitle">Turnos</h3> : null}
        {data?.turnos?.map((turno) => (
          <div className="admin-list-item" key={turno.id_turno}>{formatDateTime(turno.fechaHora)} - {turno.servicio?.nombre} - {turno.estado}</div>
        ))}
      </Modal.Body>
      <Modal.Footer><button className="btn btn-light" onClick={onClose}>Cerrar</button>{!readOnly && <button className="btn-style admin-primary-btn" onClick={submit}>Guardar</button>}</Modal.Footer>
    </Modal>
  );
}

