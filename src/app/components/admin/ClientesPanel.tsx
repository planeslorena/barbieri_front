'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { adminApi } from '@/app/services/admin';
import type { ClienteAdmin, ObraSocialAdmin } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, calculateAge, formatDateTime } from './adminUtils';

type ClienteFormValues = {
  nombre: string;
  dni: string;
  telefono: string;
  id_obra_social: string;
  numero_obra_social: string;
  fecha_nacimiento: string;
};

const clienteSchema = yup.object({
  nombre: yup.string().trim().required('El nombre es requerido'),
  dni: yup
    .string()
    .required('El DNI es requerido')
    .matches(/^\d+$/, 'El DNI debe contener solo numeros')
    .min(7, 'El DNI debe tener al menos 7 digitos')
    .max(8, 'El DNI no puede tener mas de 8 digitos'),
  telefono: yup
    .string()
    .required('El telefono es requerido')
    .matches(/^\d+$/, 'El telefono debe contener solo numeros'),
  id_obra_social: yup.string().required('La obra social es requerida'),
  numero_obra_social: yup.string().trim().required('El numero de obra social es requerido'),
  fecha_nacimiento: yup.string().required('La fecha de nacimiento es requerida'),
});

export function ClientesPanel({ clientes, reloadAll }: CommonPanelProps) {
  const [modal, setModal] = useState<{ show: boolean; data?: ClienteAdmin; readOnly?: boolean }>({
    show: false,
  });

  const columns = useMemo<ColumnDef<ClienteAdmin>[]>(
    () => [
      { header: 'Nro.', accessorKey: 'id_cliente' },
      { header: 'Nombre', cell: ({ row }) => row.original.usuario?.nombre },
      { header: 'DNI', cell: ({ row }) => row.original.usuario?.dni },
      { header: 'Edad', cell: ({ row }) => calculateAge(row.original.fecha_nacimiento) },
      { header: 'Telefono', cell: ({ row }) => row.original.usuario?.telefono },
      { header: 'Obra social', cell: ({ row }) => row.original.obra_social?.nombre },
      { header: 'Nro. obra social', accessorKey: 'numero_obra_social' },
      {
        header: 'Proximos turnos',
        cell: ({ row }) => row.original.turnos?.filter((turno) => turno.estado === 'CONFIRMADO').length || 0,
      },
    ],
    [],
  );

  const removeCliente = async (cliente: ClienteAdmin) => {
    const result = await Swal.fire({
      title: 'Eliminar paciente',
      text: cliente.usuario.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a18d41',
    });

    if (!result.isConfirmed) return;

    try {
      await adminApi.deleteCliente(cliente.id_cliente);
      await reloadAll();
      Swal.fire('Listo', 'Paciente eliminado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <>
      <AdminDataTable
        data={clientes}
        columns={columns}
        searchPlaceholder="Buscar paciente"
        createLabel="Agregar paciente"
        onCreate={() => setModal({ show: true })}
        onView={(row) => setModal({ show: true, data: row, readOnly: true })}
        onEdit={(row) => setModal({ show: true, data: row })}
        onDelete={removeCliente}
      />

      <ClienteModal
        show={modal.show}
        data={modal.data}
        readOnly={modal.readOnly}
        onClose={() => setModal({ show: false })}
        onSaved={reloadAll}
      />
    </>
  );
}

function ClienteModal({
  show,
  data,
  readOnly,
  onClose,
  onSaved,
}: {
  show: boolean;
  data?: ClienteAdmin;
  readOnly?: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ClienteFormValues>({
    mode: 'onChange',
    resolver: yupResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      dni: '',
      telefono: '',
      id_obra_social: '',
      numero_obra_social: '',
      fecha_nacimiento: '',
    },
  });
  const [obrasSociales, setObrasSociales] = useState<ObraSocialAdmin[]>([]);

  useEffect(() => {
    if (!show) return;

    reset({
      nombre: data?.usuario?.nombre || '',
      dni: data?.usuario?.dni?.toString() || '',
      telefono: data?.usuario?.telefono?.toString() || '',
      id_obra_social: data?.obra_social?.id_obra_social?.toString() || '',
      numero_obra_social: data?.numero_obra_social || '',
      fecha_nacimiento: data?.fecha_nacimiento || '',
    });
  }, [data, reset, show]);

  useEffect(() => {
    if (!show) return;

    adminApi
      .getObrasSociales()
      .then(setObrasSociales)
      .catch(() => setObrasSociales([]));
  }, [show]);

  const submit = handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        dni: Number(values.dni),
        telefono: Number(values.telefono),
        id_obra_social: Number(values.id_obra_social),
      };

      if (data) await adminApi.updateCliente(data.id_cliente, payload);
      else await adminApi.createCliente(payload);

      await onSaved();
      onClose();
      Swal.fire('Listo', 'Paciente guardado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  });

  return (
    <Modal show={show} onHide={onClose} size="lg" scrollable backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{readOnly ? 'Ver paciente' : data ? 'Modificar paciente' : 'Agregar paciente'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="cliente-admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <label>
              Nombre
              <input
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                {...register('nombre')}
              />
              {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
            </label>

            <label>
              DNI
              <input
                className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="number"
                {...register('dni')}
              />
              {errors.dni && <div className="invalid-feedback">{errors.dni.message}</div>}
            </label>

            <label>
              Telefono
              <input
                className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="number"
                {...register('telefono')}
              />
              {errors.telefono && <div className="invalid-feedback">{errors.telefono.message}</div>}
            </label>

            <label>
              Obra social
              <select
                className={`form-control ${errors.id_obra_social ? 'is-invalid' : ''}`}
                disabled={readOnly}
                {...register('id_obra_social')}
              >
                <option value="">Seleccionar</option>
                {obrasSociales.map((obraSocial) => (
                  <option key={obraSocial.id_obra_social} value={obraSocial.id_obra_social}>
                    {obraSocial.nombre}
                  </option>
                ))}
              </select>
              {errors.id_obra_social && <div className="invalid-feedback">{errors.id_obra_social.message}</div>}
            </label>

            <label>
              Numero de obra social
              <input
                className={`form-control ${errors.numero_obra_social ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                {...register('numero_obra_social')}
              />
              {errors.numero_obra_social && (
                <div className="invalid-feedback">{errors.numero_obra_social.message}</div>
              )}
            </label>

            <label>
              Fecha nacimiento
              <input
                className={`form-control ${errors.fecha_nacimiento ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="date"
                {...register('fecha_nacimiento')}
              />
              {errors.fecha_nacimiento && <div className="invalid-feedback">{errors.fecha_nacimiento.message}</div>}
            </label>
          </div>
        </form>

        {data?.turnos?.length ? <h3 className="admin-modal-subtitle">Turnos</h3> : null}
        {data?.turnos?.map((turno) => (
          <div className="admin-list-item" key={turno.id_turno}>
            {formatDateTime(turno.fechaHora)} - {turno.servicio?.nombre} - {turno.estado}
          </div>
        ))}
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-light" type="button" onClick={onClose}>
          Cerrar
        </button>
        {!readOnly && (
          <button className="btn-style admin-primary-btn" disabled={isSubmitting} form="cliente-admin-form" type="submit">
            Guardar
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
