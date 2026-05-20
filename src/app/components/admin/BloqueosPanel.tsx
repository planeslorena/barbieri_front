'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { yupResolver } from '@hookform/resolvers/yup';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { adminApi } from '@/app/services/admin';
import type { BloqueoAdmin, ProfesionalAdmin } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, today, toTime } from './adminUtils';

type BloqueosApi = {
  getBloqueos: typeof adminApi.getBloqueos;
  createBloqueo: typeof adminApi.createBloqueo;
  deleteBloqueo: typeof adminApi.deleteBloqueo;
};

type BloqueoFormValues = {
  id_profesional: string;
  fecha: string;
  tipo: 'DIA_COMPLETO' | 'RANGO_HORARIO';
  hora_inicio: string | undefined;
  hora_fin: string | undefined;
  motivo: string;
};

const TODOS_LOS_PROFESIONALES = 'TODOS';

const bloqueoSchema = yup.object({
  id_profesional: yup.string().required('Debe seleccionar un profesional'),
  fecha: yup.string().required('La fecha es requerida'),
  tipo: yup.mixed<'DIA_COMPLETO' | 'RANGO_HORARIO'>().oneOf(['DIA_COMPLETO', 'RANGO_HORARIO']).required(),
  hora_inicio: yup.string().when('tipo', {
    is: 'RANGO_HORARIO',
    then: (schema) => schema.required('La hora de inicio es requerida'),
    otherwise: (schema) => schema.default(''),
  }),
  hora_fin: yup.string().when('tipo', {
    is: 'RANGO_HORARIO',
    then: (schema) =>
      schema
        .required('La hora de fin es requerida')
        .test('after-start', 'La hora de fin debe ser mayor al inicio', function (value) {
          const { hora_inicio } = this.parent as BloqueoFormValues;
          if (!hora_inicio || !value) return true;
          return value > hora_inicio;
        }),
    otherwise: (schema) => schema.default(''),
  }),
  motivo: yup.string().default(''),
});

export function BloqueosPanel({
  profesionales,
  reloadAll,
  refreshKey,
  bloqueosApi = adminApi,
  hideProfessionalSelect = false,
}: CommonPanelProps & {
  bloqueosApi?: BloqueosApi;
  hideProfessionalSelect?: boolean;
}) {
  const [bloqueos, setBloqueos] = useState<BloqueoAdmin[]>([]);
  const [modal, setModal] = useState(false);

  const load = useCallback(async () => {
    setBloqueos(await bloqueosApi.getBloqueos({ desde: today() }));
  }, [bloqueosApi]);

  useEffect(() => {
    load().catch((error) => Swal.fire('Error', apiMessage(error), 'error'));
  }, [load]);

  useEffect(() => {
    if (!refreshKey) return;

    load().catch((error) => Swal.fire('Error', apiMessage(error), 'error'));
  }, [load, refreshKey]);

  const columns = useMemo<ColumnDef<BloqueoAdmin>[]>(
    () => [
      {
        header: 'Profesional',
        cell: ({ row }) =>
          row.original.profesional?.nombre || row.original.profesional?.usuario?.nombre || row.original.id_profesional,
      },
      { header: 'Fecha', cell: ({ row }) => row.original.fecha?.slice(0, 10) },
      { header: 'Tipo', accessorKey: 'tipo' },
      {
        header: 'Horario',
        cell: ({ row }) =>
          row.original.tipo === 'DIA_COMPLETO'
            ? 'Todo el dia'
            : `${toTime(row.original.hora_inicio)}-${toTime(row.original.hora_fin)}`,
      },
      { header: 'Motivo', accessorKey: 'motivo' },
    ],
    [],
  );

  const remove = async (bloqueo: BloqueoAdmin) => {
    const result = await Swal.fire({
      title: 'Eliminar bloqueo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a18d41',
    });

    if (!result.isConfirmed) return;

    try {
      await bloqueosApi.deleteBloqueo(bloqueo.id);
      await load();
      await reloadAll();
      Swal.fire('Listo', 'Bloqueo eliminado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  return (
    <>
      <AdminDataTable
        data={bloqueos}
        columns={columns}
        searchPlaceholder="Buscar bloqueo"
        createLabel="Agregar bloqueo"
        onCreate={() => setModal(true)}
        onDelete={remove}
      />

      <BloqueoModal
        show={modal}
        fecha={today()}
        profesionales={profesionales}
        bloqueosApi={bloqueosApi}
        hideProfessionalSelect={hideProfessionalSelect}
        onClose={() => setModal(false)}
        onSaved={async () => {
          await load();
          await reloadAll();
        }}
      />
    </>
  );
}

function BloqueoModal({
  show,
  fecha,
  profesionales,
  bloqueosApi,
  hideProfessionalSelect,
  onClose,
  onSaved,
}: {
  show: boolean;
  fecha: string;
  profesionales: ProfesionalAdmin[];
  bloqueosApi: BloqueosApi;
  hideProfessionalSelect: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const profesionalesActivos = useMemo(
    () => profesionales.filter((profesional) => !profesional.deletedAt),
    [profesionales],
  );

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<BloqueoFormValues>({
    mode: 'onChange',
    resolver: yupResolver(bloqueoSchema) as Resolver<BloqueoFormValues>,
    defaultValues: {
      id_profesional: '',
      fecha,
      tipo: 'DIA_COMPLETO',
      hora_inicio: '09:00',
      hora_fin: '10:00',
      motivo: '',
    },
  });

  const tipo = useWatch({ control, name: 'tipo' });

  useEffect(() => {
    if (!show) return;

    reset({
      id_profesional: hideProfessionalSelect ? String(profesionalesActivos[0]?.id_profesional || '') : '',
      fecha,
      tipo: 'DIA_COMPLETO',
      hora_inicio: '09:00',
      hora_fin: '10:00',
      motivo: '',
    });
  }, [fecha, reset, show]);

  const submit = handleSubmit(async (values) => {
    try {
      const bloqueo = {
        fecha: values.fecha,
        tipo: values.tipo,
        hora_inicio: values.tipo === 'RANGO_HORARIO' ? values.hora_inicio : undefined,
        hora_fin: values.tipo === 'RANGO_HORARIO' ? values.hora_fin : undefined,
        motivo: values.motivo || undefined,
      };

      if (values.id_profesional === TODOS_LOS_PROFESIONALES) {
        if (profesionalesActivos.length === 0) {
          await Swal.fire('Error', 'No hay profesionales activos para bloquear.', 'error');
          return;
        }

        await Promise.all(
          profesionalesActivos.map((profesional) =>
            bloqueosApi.createBloqueo({
              ...bloqueo,
              id_profesional: profesional.id_profesional,
            }),
          ),
        );
      } else {
        await bloqueosApi.createBloqueo({
          ...bloqueo,
          id_profesional: Number(values.id_profesional),
        });
      }

      await onSaved();
      onClose();
      Swal.fire('Listo', 'Bloqueo creado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  });

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Agregar bloqueo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="bloqueo-admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            {!hideProfessionalSelect && (
              <label>
                Profesional
                <select className={`form-select ${errors.id_profesional ? 'is-invalid' : ''}`} {...register('id_profesional')}>
                  <option value="">Seleccionar</option>
                  <option value={TODOS_LOS_PROFESIONALES}>Todos los profesionales</option>
                  {profesionalesActivos.map((profesional) => (
                    <option key={profesional.id_profesional} value={profesional.id_profesional}>
                      {profesional.nombre}
                    </option>
                  ))}
                </select>
                {errors.id_profesional && <div className="invalid-feedback">{errors.id_profesional.message}</div>}
              </label>
            )}

            <label>
              Fecha
              <input className={`form-control ${errors.fecha ? 'is-invalid' : ''}`} type="date" {...register('fecha')} />
              {errors.fecha && <div className="invalid-feedback">{errors.fecha.message}</div>}
            </label>

            <label>
              Tipo
              <select className="form-select" {...register('tipo')}>
                <option value="DIA_COMPLETO">Dia completo</option>
                <option value="RANGO_HORARIO">Rango horario</option>
              </select>
            </label>

            {tipo === 'RANGO_HORARIO' && (
              <>
                <label>
                  Inicio
                  <input
                    className={`form-control ${errors.hora_inicio ? 'is-invalid' : ''}`}
                    type="time"
                    {...register('hora_inicio')}
                  />
                  {errors.hora_inicio && <div className="invalid-feedback">{errors.hora_inicio.message}</div>}
                </label>

                <label>
                  Fin
                  <input
                    className={`form-control ${errors.hora_fin ? 'is-invalid' : ''}`}
                    type="time"
                    {...register('hora_fin')}
                  />
                  {errors.hora_fin && <div className="invalid-feedback">{errors.hora_fin.message}</div>}
                </label>
              </>
            )}

            <label className="admin-span-2">
              Motivo
              <textarea className="form-control" {...register('motivo')} />
            </label>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-light" type="button" onClick={onClose}>
          Cerrar
        </button>
        <button className="btn-style admin-primary-btn" disabled={isSubmitting} form="bloqueo-admin-form" type="submit">
          Guardar
        </button>
      </Modal.Footer>
    </Modal>
  );
}
