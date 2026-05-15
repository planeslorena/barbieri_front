'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { adminApi } from '@/app/services/admin';
import type { CategoriaServicioAdmin, ServicioAdmin } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, money } from './adminUtils';

type ServicioFormValues = {
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
  reserva: number;
  visible_cliente: boolean;
  id_categoria_servicio: string;
};

type CategoriaFormValues = {
  nombre: string;
  orden: number;
};

const servicioSchema = yup.object({
  nombre: yup.string().trim().required('El nombre es requerido'),
  descripcion: yup.string().default(''),
  duracion: yup.number().typeError('La duracion es requerida').min(1, 'Debe ser mayor a 0').required(),
  precio: yup.number().typeError('El precio es requerido').min(0, 'No puede ser negativo').required(),
  reserva: yup.number().typeError('La reserva es requerida').min(0, 'No puede ser negativa').required(),
  visible_cliente: yup.boolean().required(),
  id_categoria_servicio: yup.string().default(''),
});

const categoriaSchema = yup.object({
  nombre: yup.string().trim().required('El nombre es requerido'),
  orden: yup.number().typeError('El orden es requerido').min(0, 'No puede ser negativo').required(),
});

export function ServiciosPanel({ servicios, categorias, reloadAll }: CommonPanelProps) {
  const [servicioModal, setServicioModal] = useState<{ show: boolean; data?: ServicioAdmin }>({ show: false });
  const [categoriaModal, setCategoriaModal] = useState<{ show: boolean; data?: CategoriaServicioAdmin }>({ show: false });

  const serviceColumns = useMemo<ColumnDef<ServicioAdmin>[]>(
    () => [
      { header: 'Nombre', accessorKey: 'nombre' },
      { header: 'Duracion', cell: ({ row }) => `${row.original.duracion} min` },
      { header: 'Precio', cell: ({ row }) => money(row.original.precio) },
      { header: 'Reserva', cell: ({ row }) => money(row.original.reserva) },
      { header: 'Categoria', cell: ({ row }) => row.original.categoria?.nombre || 'Sin categoria' },
      { header: 'Cliente', cell: ({ row }) => (row.original.visible_cliente ? 'Visible' : 'Interno') },
    ],
    [],
  );

  const categoryColumns = useMemo<ColumnDef<CategoriaServicioAdmin>[]>(
    () => [
      { header: 'Orden', accessorKey: 'orden' },
      { header: 'Nombre', accessorKey: 'nombre' },
    ],
    [],
  );

  const removeServicio = async (servicio: ServicioAdmin) => {
    const result = await Swal.fire({
      title: 'Eliminar servicio',
      text: servicio.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a18d41',
    });

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
    const result = await Swal.fire({
      title: 'Eliminar categoria',
      text: categoria.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a18d41',
    });

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
      <AdminDataTable
        data={servicios}
        columns={serviceColumns}
        searchPlaceholder="Buscar servicio"
        createLabel="Agregar servicio"
        onCreate={() => setServicioModal({ show: true })}
        onEdit={(row) => setServicioModal({ show: true, data: row })}
        onDelete={removeServicio}
      />

      <AdminDataTable
        data={categorias}
        columns={categoryColumns}
        searchPlaceholder="Buscar categoria"
        createLabel="Agregar categoria"
        onCreate={() => setCategoriaModal({ show: true })}
        onEdit={(row) => setCategoriaModal({ show: true, data: row })}
        onDelete={removeCategoria}
      />

      <ServicioModal
        show={servicioModal.show}
        data={servicioModal.data}
        categorias={categorias}
        onClose={() => setServicioModal({ show: false })}
        onSaved={reloadAll}
      />

      <CategoriaModal
        show={categoriaModal.show}
        data={categoriaModal.data}
        onClose={() => setCategoriaModal({ show: false })}
        onSaved={reloadAll}
      />
    </div>
  );
}

function ServicioModal({
  show,
  data,
  categorias,
  onClose,
  onSaved,
}: {
  show: boolean;
  data?: ServicioAdmin;
  categorias: CategoriaServicioAdmin[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ServicioFormValues>({
    mode: 'onChange',
    resolver: yupResolver(servicioSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      duracion: 30,
      precio: 0,
      reserva: 0,
      visible_cliente: true,
      id_categoria_servicio: '',
    },
  });

  useEffect(() => {
    if (!show) return;

    reset({
      nombre: data?.nombre || '',
      descripcion: data?.descripcion || '',
      duracion: data?.duracion || 30,
      precio: data?.precio || 0,
      reserva: data?.reserva || 0,
      visible_cliente: data?.visible_cliente ?? true,
      id_categoria_servicio: data?.categoria?.id_categoria_servicio?.toString() || '',
    });
  }, [data, reset, show]);

  const submit = handleSubmit(async (values) => {
    try {
      const payload = {
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        duracion: Number(values.duracion),
        precio: Number(values.precio),
        reserva: Number(values.reserva),
        visible_cliente: values.visible_cliente,
        id_categoria_servicio: values.id_categoria_servicio ? Number(values.id_categoria_servicio) : null,
      };

      if (data) await adminApi.updateServicio(data.id_servicio, payload);
      else await adminApi.createServicio(payload);

      await onSaved();
      onClose();
      Swal.fire('Listo', 'Servicio guardado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  });

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{data ? 'Modificar servicio' : 'Agregar servicio'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="servicio-admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <label className="admin-span-2">
              Nombre
              <input className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} {...register('nombre')} />
              {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
            </label>

            <label className="admin-span-2">
              Descripcion
              <textarea className="form-control" {...register('descripcion')} />
            </label>

            <label>
              Duracion
              <input
                className={`form-control ${errors.duracion ? 'is-invalid' : ''}`}
                type="number"
                {...register('duracion')}
              />
              {errors.duracion && <div className="invalid-feedback">{errors.duracion.message}</div>}
            </label>

            <label>
              Precio
              <input
                className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                type="number"
                {...register('precio')}
              />
              {errors.precio && <div className="invalid-feedback">{errors.precio.message}</div>}
            </label>

            <label>
              Reserva
              <input
                className={`form-control ${errors.reserva ? 'is-invalid' : ''}`}
                type="number"
                {...register('reserva')}
              />
              {errors.reserva && <div className="invalid-feedback">{errors.reserva.message}</div>}
            </label>

            <label>
              Categoria
              <select className="form-select" {...register('id_categoria_servicio')}>
                <option value="">Sin categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id_categoria_servicio} value={categoria.id_categoria_servicio}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-check admin-check">
              <input className="form-check-input" type="checkbox" {...register('visible_cliente')} />
              Visible para cliente
            </label>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-light" type="button" onClick={onClose}>
          Cerrar
        </button>
        <button className="btn-style admin-primary-btn" disabled={isSubmitting} form="servicio-admin-form" type="submit">
          Guardar
        </button>
      </Modal.Footer>
    </Modal>
  );
}

function CategoriaModal({
  show,
  data,
  onClose,
  onSaved,
}: {
  show: boolean;
  data?: CategoriaServicioAdmin;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CategoriaFormValues>({
    mode: 'onChange',
    resolver: yupResolver(categoriaSchema),
    defaultValues: {
      nombre: '',
      orden: 0,
    },
  });

  useEffect(() => {
    if (!show) return;

    reset({
      nombre: data?.nombre || '',
      orden: data?.orden || 0,
    });
  }, [data, reset, show]);

  const submit = handleSubmit(async (values) => {
    try {
      const payload = {
        nombre: values.nombre,
        orden: Number(values.orden),
      };

      if (data) await adminApi.updateCategoria(data.id_categoria_servicio, payload);
      else await adminApi.createCategoria(payload);

      await onSaved();
      onClose();
      Swal.fire('Listo', 'Categoria guardada.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  });

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{data ? 'Modificar categoria' : 'Agregar categoria'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="categoria-admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <label>
              Nombre
              <input className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} {...register('nombre')} />
              {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
            </label>

            <label>
              Orden
              <input
                className={`form-control ${errors.orden ? 'is-invalid' : ''}`}
                type="number"
                {...register('orden')}
              />
              {errors.orden && <div className="invalid-feedback">{errors.orden.message}</div>}
            </label>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-light" type="button" onClick={onClose}>
          Cerrar
        </button>
        <button className="btn-style admin-primary-btn" disabled={isSubmitting} form="categoria-admin-form" type="submit">
          Guardar
        </button>
      </Modal.Footer>
    </Modal>
  );
}
