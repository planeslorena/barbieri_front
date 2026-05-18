'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { adminApi } from '@/app/services/admin';
import type { UsuarioAdmin } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage } from './adminUtils';

type AdministradorFormValues = {
  nombre: string;
  dni: string;
  mail: string;
  telefono: string;
  codigo: string;
  confirmar_codigo: string;
};

const codigoSchema = yup
  .string()
  .trim()
  .matches(/^\d*$/, 'El codigo debe contener solo numeros');

function administradorSchema(isEdit: boolean) {
  return yup.object({
    nombre: yup.string().trim().required('El nombre es requerido'),
    dni: yup
      .string()
      .required('El DNI es requerido')
      .matches(/^\d+$/, 'El DNI debe contener solo numeros')
      .min(7, 'El DNI debe tener al menos 7 digitos')
      .max(8, 'El DNI no puede tener mas de 8 digitos'),
    mail: yup.string().trim().email('Ingrese un email valido').required('El email es requerido'),
    telefono: yup
      .string()
      .required('El telefono es requerido')
      .matches(/^\d+$/, 'El telefono debe contener solo numeros'),
    codigo: isEdit
      ? codigoSchema.default('')
      : codigoSchema.required('El codigo de acceso es requerido').matches(/^\d+$/, 'El codigo debe contener solo numeros'),
    confirmar_codigo: yup.string().default('').test('matches-code', 'Los codigos no coinciden', function (value) {
      const codigo = this.parent.codigo;
      if (!codigo && isEdit) return true;
      return value === codigo;
    }),
  });
}

export function AdministradoresPanel({ administradores, reloadAll }: CommonPanelProps) {
  const [modal, setModal] = useState<{ show: boolean; data?: UsuarioAdmin; readOnly?: boolean }>({ show: false });

  const columns = useMemo<ColumnDef<UsuarioAdmin>[]>(
    () => [
      { header: 'Nro.', accessorKey: 'id_usuario' },
      { header: 'Nombre', accessorKey: 'nombre' },
      { header: 'DNI', accessorKey: 'dni' },
      { header: 'Email', accessorKey: 'mail' },
      { header: 'Telefono', accessorKey: 'telefono' },
      { header: 'Estado', cell: ({ row }) => (row.original.deletedAt ? 'Deshabilitado' : 'Activo') },
    ],
    [],
  );

  const removeAdministrador = async (administrador: UsuarioAdmin) => {
    const result = await Swal.fire({
      title: 'Deshabilitar administrador',
      text: `Seguro que queres deshabilitar a ${administrador.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Deshabilitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#a18d41',
    });

    if (!result.isConfirmed) return;

    try {
      await adminApi.deleteAdministrador(administrador.id_usuario);
      await reloadAll();
      Swal.fire('Listo', 'Administrador deshabilitado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  const restoreAdministrador = async (administrador: UsuarioAdmin) => {
    const result = await Swal.fire({
      title: 'Reactivar administrador',
      text: `Seguro que queres volver a habilitar a ${administrador.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Reactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#a18d41',
    });

    if (!result.isConfirmed) return;

    try {
      await adminApi.restoreAdministrador(administrador.id_usuario);
      await reloadAll();
      Swal.fire('Listo', 'Administrador reactivado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <>
      <AdminDataTable
        data={administradores}
        columns={columns}
        searchPlaceholder="Buscar administrador"
        createLabel="Agregar administrador"
        isDeleted={(row) => Boolean(row.deletedAt)}
        onCreate={() => setModal({ show: true })}
        onView={(row) => setModal({ show: true, data: row, readOnly: true })}
        onEdit={(row) => setModal({ show: true, data: row })}
        onDelete={removeAdministrador}
        onRestore={restoreAdministrador}
      />

      {modal.show && (
        <AdministradorModal
          key={modal.data?.id_usuario ?? 'new-admin'}
          show={modal.show}
          data={modal.data}
          readOnly={modal.readOnly}
          onClose={() => setModal({ show: false })}
          onSaved={reloadAll}
        />
      )}
    </>
  );
}

function AdministradorModal({
  show,
  data,
  readOnly,
  onClose,
  onSaved,
}: {
  show: boolean;
  data?: UsuarioAdmin;
  readOnly?: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<AdministradorFormValues>({
    mode: 'onChange',
    resolver: yupResolver(administradorSchema(Boolean(data))),
    defaultValues: {
      nombre: '',
      dni: '',
      mail: '',
      telefono: '',
      codigo: '',
      confirmar_codigo: '',
    },
  });

  useEffect(() => {
    if (!show) return;

    reset({
      nombre: data?.nombre || '',
      dni: data?.dni?.toString() || '',
      mail: data?.mail || '',
      telefono: data?.telefono?.toString() || '',
      codigo: '',
      confirmar_codigo: '',
    });
  }, [data, reset, show]);

  const submit = handleSubmit(async (values) => {
    try {
      const payload = {
        nombre: values.nombre,
        dni: Number(values.dni),
        mail: values.mail,
        telefono: Number(values.telefono),
        ...(values.codigo ? { codigo: Number(values.codigo) } : {}),
      };

      if (data) await adminApi.updateAdministrador(data.id_usuario, payload);
      else await adminApi.createAdministrador(payload);

      await onSaved();
      onClose();
      Swal.fire('Listo', 'Administrador guardado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  });

  return (
    <Modal show={show} onHide={onClose} size="lg" scrollable backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{readOnly ? 'Ver administrador' : data ? 'Modificar administrador' : 'Agregar administrador'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="administrador-admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <label>
              Nombre
              <input className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} readOnly={readOnly} {...register('nombre')} />
              {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
            </label>

            <label>
              DNI
              <input className={`form-control ${errors.dni ? 'is-invalid' : ''}`} readOnly={readOnly} type="number" {...register('dni')} />
              {errors.dni && <div className="invalid-feedback">{errors.dni.message}</div>}
            </label>

            <label>
              Email
              <input className={`form-control ${errors.mail ? 'is-invalid' : ''}`} readOnly={readOnly} type="email" {...register('mail')} />
              {errors.mail && <div className="invalid-feedback">{errors.mail.message}</div>}
            </label>

            <label>
              Telefono
              <input className={`form-control ${errors.telefono ? 'is-invalid' : ''}`} readOnly={readOnly} type="number" {...register('telefono')} />
              {errors.telefono && <div className="invalid-feedback">{errors.telefono.message}</div>}
            </label>

            {!readOnly && (
              <>
                <label>
                  {data ? 'Nuevo codigo de acceso' : 'Codigo de acceso'}
                  <input className={`form-control ${errors.codigo ? 'is-invalid' : ''}`} type="number" {...register('codigo')} />
                  {errors.codigo && <div className="invalid-feedback">{errors.codigo.message}</div>}
                </label>

                <label>
                  Confirmar codigo
                  <input className={`form-control ${errors.confirmar_codigo ? 'is-invalid' : ''}`} type="number" {...register('confirmar_codigo')} />
                  {errors.confirmar_codigo && <div className="invalid-feedback">{errors.confirmar_codigo.message}</div>}
                </label>
              </>
            )}
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-light" type="button" onClick={onClose}>
          Cerrar
        </button>
        {!readOnly && (
          <button className="btn-style admin-primary-btn" disabled={isSubmitting} form="administrador-admin-form" type="submit">
            Guardar
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
