'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { adminApi } from '@/app/services/admin';
import type { ClienteAdmin, ObraSocialAdmin, TurnoAdmin } from '@/app/types/admin';
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

const TURNOS_PREVIEW_LIMIT = 5;

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
  numero_obra_social: yup.string().trim(),
  fecha_nacimiento: yup.string().required('La fecha de nacimiento es requerida'),
});

function sortTurnosDesc(turnos: TurnoAdmin[]) {
  return [...turnos].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
}

function getProfesionalNombre(turno: TurnoAdmin) {
  return turno.profesional?.nombre || turno.profesional?.usuario?.nombre || 'Profesional no informado';
}

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

      {modal.show && (
        <ClienteModal
          key={modal.data?.id_cliente ?? 'new-cliente'}
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
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<ClienteFormValues>({
    mode: 'onChange',
    resolver: yupResolver(clienteSchema) as Resolver<ClienteFormValues>,
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
  const [obraSocialQuery, setObraSocialQuery] = useState(data?.obra_social?.nombre || '');
  const [showObraSocialOptions, setShowObraSocialOptions] = useState(false);
  const selectedObraSocialId = useWatch({ control, name: 'id_obra_social' });
  const selectedObraSocial = useMemo(
    () => obrasSociales.find((obraSocial) => obraSocial.id_obra_social === Number(selectedObraSocialId)),
    [obrasSociales, selectedObraSocialId],
  );
  const filteredObrasSociales = useMemo(() => {
    const query = obraSocialQuery.trim().toLowerCase();
    if (!query) return obrasSociales;

    return obrasSociales.filter((obraSocial) => obraSocial.nombre.toLowerCase().includes(query));
  }, [obraSocialQuery, obrasSociales]);
  const isParticular = selectedObraSocial?.nombre.trim().toLowerCase() === 'particular';
  const [showAllTurnos, setShowAllTurnos] = useState(false);
  const turnosOrdenados = useMemo(() => sortTurnosDesc(data?.turnos || []), [data?.turnos]);
  const turnosVisibles = showAllTurnos ? turnosOrdenados : turnosOrdenados.slice(0, TURNOS_PREVIEW_LIMIT);
  const hasHiddenTurnos = turnosOrdenados.length > TURNOS_PREVIEW_LIMIT;

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

  const selectObraSocial = (obraSocial: ObraSocialAdmin) => {
    setObraSocialQuery(obraSocial.nombre);
    setValue('id_obra_social', obraSocial.id_obra_social.toString(), {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (obraSocial.nombre.trim().toLowerCase() === 'particular') {
      setValue('numero_obra_social', '', { shouldDirty: true, shouldValidate: true });
    }

    setShowObraSocialOptions(false);
  };

  const submit = handleSubmit(async (values) => {
    try {
      if (!isParticular && !values.numero_obra_social.trim()) {
        setError('numero_obra_social', {
          type: 'manual',
          message: 'El numero de obra social es requerido',
        });
        return;
      }

      const payload = {
        ...values,
        dni: Number(values.dni),
        telefono: Number(values.telefono),
        id_obra_social: Number(values.id_obra_social),
        numero_obra_social: isParticular ? null : values.numero_obra_social.trim(),
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
              <input type="hidden" {...register('id_obra_social')} />
              <input
                autoComplete="off"
                className={`form-control ${errors.id_obra_social ? 'is-invalid' : ''}`}
                disabled={readOnly}
                onBlur={() => window.setTimeout(() => setShowObraSocialOptions(false), 120)}
                onChange={(event) => {
                  setObraSocialQuery(event.target.value);
                  setValue('id_obra_social', '', { shouldValidate: true });
                  setShowObraSocialOptions(true);
                }}
                onFocus={() => !readOnly && setShowObraSocialOptions(true)}
                placeholder="Buscar obra social o prepaga"
                value={obraSocialQuery}
              />
              {showObraSocialOptions && !readOnly && (
                <div className="obra-social-options admin-obra-social-options">
                  {filteredObrasSociales.map((obraSocial) => (
                    <button
                      key={obraSocial.id_obra_social}
                      className="obra-social-option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectObraSocial(obraSocial)}
                      type="button"
                    >
                      {obraSocial.nombre}
                    </button>
                  ))}
                  {!filteredObrasSociales.length && (
                    <span className="obra-social-empty">No hay resultados</span>
                  )}
                </div>
              )}
              {errors.id_obra_social && <div className="invalid-feedback">{errors.id_obra_social.message}</div>}
            </label>

            {!isParticular && (
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
            )}

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

        {turnosOrdenados.length ? <h3 className="admin-modal-subtitle">Turnos</h3> : null}
        {turnosVisibles.map((turno) => (
          <div className="admin-list-item admin-turno-list-item" key={turno.id_turno}>
            <strong>{formatDateTime(turno.fechaHora)}</strong>
            <span>{turno.servicio?.nombre || 'Servicio no informado'}</span>
            <small>Profesional: {getProfesionalNombre(turno)}</small>
            <small>Estado: {turno.estado}</small>
          </div>
        ))}
        {hasHiddenTurnos && (
          <button
            className="btn btn-outline-secondary btn-sm mt-2"
            type="button"
            onClick={() => setShowAllTurnos((current) => !current)}
          >
            {showAllTurnos ? 'Ver menos' : `Ver mas (${turnosOrdenados.length - TURNOS_PREVIEW_LIMIT})`}
          </button>
        )}
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
