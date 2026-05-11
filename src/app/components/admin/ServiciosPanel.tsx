'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { adminApi } from '@/app/services/admin';
import type { CategoriaServicioAdmin, ServicioAdmin } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, money } from './adminUtils';
export function ServiciosPanel({ servicios, categorias, reloadAll }: CommonPanelProps) {
  const [servicioModal, setServicioModal] = useState<{ show: boolean; data?: ServicioAdmin }>({ show: false });
  const [categoriaModal, setCategoriaModal] = useState<{ show: boolean; data?: CategoriaServicioAdmin }>({ show: false });

  const serviceColumns = useMemo<ColumnDef<ServicioAdmin>[]>(() => [
    { header: 'Nombre', accessorKey: 'nombre' },
    { header: 'Duracion', cell: ({ row }) => `${row.original.duracion} min` },
    { header: 'Precio', cell: ({ row }) => money(row.original.precio) },
    { header: 'Reserva', cell: ({ row }) => money(row.original.reserva) },
    { header: 'Categoria', cell: ({ row }) => row.original.categoria?.nombre || 'Sin categoria' },
    { header: 'Cliente', cell: ({ row }) => row.original.visible_cliente ? 'Visible' : 'Interno' },
  ], []);

  const categoryColumns = useMemo<ColumnDef<CategoriaServicioAdmin>[]>(() => [
    { header: 'Orden', accessorKey: 'orden' },
    { header: 'Nombre', accessorKey: 'nombre' },
  ], []);

  const removeServicio = async (servicio: ServicioAdmin) => {
    const result = await Swal.fire({ title: 'Eliminar servicio', text: servicio.nombre, icon: 'warning', showCancelButton: true, confirmButtonColor: '#a18d41' });
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteServicio(servicio.id_servicio);
      await reloadAll();
      Swal.fire('Listo', 'Servicio eliminado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  const removeCategoria = async (categoria: CategoriaServicioAdmin) => {
    const result = await Swal.fire({ title: 'Eliminar categoria', text: categoria.nombre, icon: 'warning', showCancelButton: true, confirmButtonColor: '#a18d41' });
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteCategoria(categoria.id_categoria_servicio);
      await reloadAll();
      Swal.fire('Listo', 'Categoria eliminada.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <div className="admin-stack">
      <AdminDataTable data={servicios} columns={serviceColumns} searchPlaceholder="Buscar servicio" createLabel="Agregar servicio" onCreate={() => setServicioModal({ show: true })} onEdit={(row) => setServicioModal({ show: true, data: row })} onDelete={removeServicio} />
      <AdminDataTable data={categorias} columns={categoryColumns} searchPlaceholder="Buscar categoria" createLabel="Agregar categoria" onCreate={() => setCategoriaModal({ show: true })} onEdit={(row) => setCategoriaModal({ show: true, data: row })} onDelete={removeCategoria} />
      <ServicioModal show={servicioModal.show} data={servicioModal.data} categorias={categorias} onClose={() => setServicioModal({ show: false })} onSaved={reloadAll} />
      <CategoriaModal show={categoriaModal.show} data={categoriaModal.data} onClose={() => setCategoriaModal({ show: false })} onSaved={reloadAll} />
    </div>
  );
}

function ServicioModal({ show, data, categorias, onClose, onSaved }: { show: boolean; data?: ServicioAdmin; categorias: CategoriaServicioAdmin[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', duracion: '30', precio: '0', reserva: '0', visible_cliente: true, id_categoria_servicio: '' });

  useEffect(() => {
    if (!show) return;
    setForm({
      nombre: data?.nombre || '',
      descripcion: data?.descripcion || '',
      duracion: data?.duracion?.toString() || '30',
      precio: data?.precio?.toString() || '0',
      reserva: data?.reserva?.toString() || '0',
      visible_cliente: data?.visible_cliente ?? true,
      id_categoria_servicio: data?.categoria?.id_categoria_servicio?.toString() || '',
    });
  }, [data, show]);

  const submit = async () => {
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        duracion: Number(form.duracion),
        precio: Number(form.precio),
        reserva: Number(form.reserva),
        visible_cliente: form.visible_cliente,
        id_categoria_servicio: form.id_categoria_servicio ? Number(form.id_categoria_servicio) : null,
      };
      if (data) await adminApi.updateServicio(data.id_servicio, payload);
      else await adminApi.createServicio(payload);
      await onSaved();
      onClose();
      Swal.fire('Listo', 'Servicio guardado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton><Modal.Title>{data ? 'Modificar servicio' : 'Agregar servicio'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="admin-form-grid">
          <label>Nombre<input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
          <label className="admin-span-2">Descripcion<textarea className="form-control" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
          <label>Duracion<input className="form-control" type="number" value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })} /></label>
          <label>Precio<input className="form-control" type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></label>
          <label>Reserva<input className="form-control" type="number" value={form.reserva} onChange={(e) => setForm({ ...form, reserva: e.target.value })} /></label>
          <label>Categoria<select className="form-select" value={form.id_categoria_servicio} onChange={(e) => setForm({ ...form, id_categoria_servicio: e.target.value })}><option value="">Sin categoria</option>{categorias.map((categoria) => <option key={categoria.id_categoria_servicio} value={categoria.id_categoria_servicio}>{categoria.nombre}</option>)}</select></label>
          <label className="form-check admin-check"><input className="form-check-input" type="checkbox" checked={form.visible_cliente} onChange={(e) => setForm({ ...form, visible_cliente: e.target.checked })} />Visible para cliente</label>
        </div>
      </Modal.Body>
      <Modal.Footer><button className="btn btn-light" onClick={onClose}>Cerrar</button><button className="btn-style admin-primary-btn" onClick={submit}>Guardar</button></Modal.Footer>
    </Modal>
  );
}

function CategoriaModal({ show, data, onClose, onSaved }: { show: boolean; data?: CategoriaServicioAdmin; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({ nombre: '', orden: '0' });

  useEffect(() => {
    if (!show) return;
    setForm({ nombre: data?.nombre || '', orden: data?.orden?.toString() || '0' });
  }, [data, show]);

  const submit = async () => {
    try {
      const payload = { nombre: form.nombre, orden: Number(form.orden) };
      if (data) await adminApi.updateCategoria(data.id_categoria_servicio, payload);
      else await adminApi.createCategoria(payload);
      await onSaved();
      onClose();
      Swal.fire('Listo', 'Categoria guardada.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton><Modal.Title>{data ? 'Modificar categoria' : 'Agregar categoria'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="admin-form-grid">
          <label>Nombre<input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
          <label>Orden<input className="form-control" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} /></label>
        </div>
      </Modal.Body>
      <Modal.Footer><button className="btn btn-light" onClick={onClose}>Cerrar</button><button className="btn-style admin-primary-btn" onClick={submit}>Guardar</button></Modal.Footer>
    </Modal>
  );
}

