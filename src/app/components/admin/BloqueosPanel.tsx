'use client';
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { yupResolver } from '@hookform/resolvers/yup';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { adminApi } from '@/app/services/admin';
import type { BloqueoAdmin, ProfesionalAdmin } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, today, toTime } from './adminUtils';

type BloqueoFormValues = {
  id_profesional: string;
  fecha: string;
  tipo: 'DIA_COMPLETO' | 'RANGO_HORARIO';
  hora_inicio: string | undefined;
  hora_fin: string | undefined;
  motivo: string;
};

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
        <input
          className="form-control admin-date-input"
          type="date"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
        />
      </div>

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
        fecha={fecha}
        profesionales={profesionales}
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
  onClose,
  onSaved,
}: {
  show: boolean;
  fecha: string;
  profesionales: ProfesionalAdmin[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
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
      id_profesional: '',
      fecha,
      tipo: 'DIA_COMPLETO',
      hora_inicio: '09:00',
      hora_fin: '10:00',
      motivo: '',
    });
  }, [fecha, reset, show]);

  const submit = handleSubmit(async (values) => {
    try {
      await adminApi.createBloqueo({
        id_profesional: Number(values.id_profesional),
        fecha: values.fecha,
        tipo: values.tipo,
        hora_inicio: values.tipo === 'RANGO_HORARIO' ? values.hora_inicio : undefined,
        hora_fin: values.tipo === 'RANGO_HORARIO' ? values.hora_fin : undefined,
        motivo: values.motivo || undefined,
      });

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
            <label>
              Profesional
              <select className={`form-select ${errors.id_profesional ? 'is-invalid' : ''}`} {...register('id_profesional')}>
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
