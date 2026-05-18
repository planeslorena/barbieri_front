'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { adminApi } from '@/app/services/admin';
import type { DisponibilidadServicioAdmin, HorarioAdmin, ProfesionalAdmin, ServicioAdmin } from '@/app/types/admin';
import { DIAS_SEMANA } from '@/app/types/admin';
import { AdminDataTable } from './AdminDataTable';
import type { CommonPanelProps } from './adminPanelTypes';
import { apiMessage, createBlankHorario, toTime } from './adminUtils';

type ProfesionalFormValues = {
  nombre: string;
  dni: string;
  mail: string;
  telefono: string;
  fecha_nacimiento: string;
  codigo: string;
  confirmar_codigo: string;
  servicios: number[];
  horarios: HorarioAdmin[];
  disponibilidades: DisponibilidadServicioAdmin[];
};

const horarioSchema = yup.object({
  dia: yup.number().oneOf([-1, 0, 1, 2, 3, 4, 5, 6]).required('Seleccione un dia'),
  hora_inicio: yup.string().required('Ingrese hora de inicio'),
  hora_fin: yup
    .string()
    .required('Ingrese hora de fin')
    .test('after-start', 'La hora de fin debe ser mayor al inicio', function (value) {
      const { hora_inicio } = this.parent as HorarioAdmin;
      if (!hora_inicio || !value) return true;
      return value > hora_inicio;
    }),
});

const disponibilidadSchema = horarioSchema.shape({
  id_servicio: yup.number().required('Seleccione un servicio'),
});

function isDisponibilidadInsideHorarioBase(disponibilidad: HorarioAdmin, horarios: HorarioAdmin[]) {
  return horarios.some(
    (horario) => {
      const diaHorario = Number(horario.dia);
      const diaDisponibilidad = Number(disponibilidad.dia);
      const mismoDia = diaHorario === diaDisponibilidad || (diaHorario === -1 && diaDisponibilidad >= 1 && diaDisponibilidad <= 5);

      return mismoDia
      && toTime(horario.hora_inicio) <= toTime(disponibilidad.hora_inicio)
      && toTime(horario.hora_fin) >= toTime(disponibilidad.hora_fin);
    },
  );
}

const codigoSchema = yup
  .string()
  .trim()
  .matches(/^\d*$/, 'El codigo debe contener solo numeros');

function profesionalSchema(isEdit: boolean) {
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
    fecha_nacimiento: yup.string().required('La fecha de nacimiento es requerida'),
    codigo: isEdit
      ? codigoSchema.default('')
      : codigoSchema.required('El codigo de acceso es requerido').matches(/^\d+$/, 'El codigo debe contener solo numeros'),
    confirmar_codigo: yup.string().default('').test('matches-code', 'Los codigos no coinciden', function (value) {
      const codigo = this.parent.codigo;
      if (!codigo && isEdit) return true;
      return value === codigo;
    }),
    servicios: yup.array().of(yup.number().required()).min(1, 'Debe seleccionar al menos un servicio').required(),
    horarios: yup.array().of(horarioSchema).min(1, 'Debe ingresar al menos un horario').required(),
    disponibilidades: yup.array().of(disponibilidadSchema).optional().default([]),
  }).test('disponibilidades-dentro-horario-base', function (values) {
    const horarios = values.horarios || [];
    const disponibilidades = values.disponibilidades || [];
    const invalidIndex = disponibilidades.findIndex(
      (disponibilidad) => !isDisponibilidadInsideHorarioBase(disponibilidad, horarios),
    );

    if (invalidIndex === -1) return true;

    return this.createError({
      path: `disponibilidades.${invalidIndex}.hora_fin`,
      message: 'La disponibilidad especifica debe estar dentro de un horario base del mismo dia.',
    });
  });
}

function horarioLabel(horario: HorarioAdmin) {
  if (Number(horario.dia) === -1) return `Lunes a viernes ${toTime(horario.hora_inicio)}-${toTime(horario.hora_fin)}`;
  return `${DIAS_SEMANA[horario.dia]} ${toTime(horario.hora_inicio)}-${toTime(horario.hora_fin)}`;
}

function expandHorariosDiasHabiles(horarios: HorarioAdmin[]) {
  return horarios.flatMap((horario) => {
    if (Number(horario.dia) !== -1) {
      return [{ ...horario, dia: Number(horario.dia) }];
    }

    return [1, 2, 3, 4, 5].map((dia) => ({
      ...horario,
      id_horario: null,
      dia,
    }));
  });
}

function mergeHorarios(horarios: HorarioAdmin[]) {
  const sortedHorarios = [...horarios]
    .filter((horario) => horario.hora_inicio && horario.hora_fin)
    .sort((a, b) => {
      if (a.dia !== b.dia) return a.dia - b.dia;
      if (toTime(a.hora_inicio) !== toTime(b.hora_inicio)) {
        return toTime(a.hora_inicio).localeCompare(toTime(b.hora_inicio));
      }
      return toTime(a.hora_fin).localeCompare(toTime(b.hora_fin));
    });

  return sortedHorarios.reduce<HorarioAdmin[]>((merged, horario) => {
    const current = {
      ...horario,
      dia: Number(horario.dia),
      hora_inicio: toTime(horario.hora_inicio),
      hora_fin: toTime(horario.hora_fin),
    };
    const previous = merged[merged.length - 1];

    if (!previous || previous.dia !== current.dia || toTime(previous.hora_fin) < current.hora_inicio) {
      merged.push(current);
      return merged;
    }

    if (toTime(previous.hora_fin) < current.hora_fin) {
      previous.hora_fin = current.hora_fin;
    }

    return merged;
  }, []);
}

function ProfesionalDisponibilidadCell({ profesional }: { profesional: ProfesionalAdmin }) {
  const horarios = mergeHorarios([
    ...(profesional.horarios || []),
    ...(profesional.disponibilidades || []),
  ]);

  if (!horarios.length) {
    return <span>Sin horarios</span>;
  }

  return (
    <div className="admin-schedule-summary">
      <span>{horarios.map(horarioLabel).join(' | ')}</span>
    </div>
  );
}

export function ProfesionalesPanel({ profesionales, servicios, reloadAll }: CommonPanelProps) {
  const [modal, setModal] = useState<{ show: boolean; data?: ProfesionalAdmin; readOnly?: boolean }>({
    show: false,
  });

  const columns = useMemo<ColumnDef<ProfesionalAdmin>[]>(
    () => [
      { header: 'Nro.', accessorKey: 'id_profesional' },
      { header: 'Nombre', accessorKey: 'nombre' },
      { header: 'DNI', accessorKey: 'dni' },
      { header: 'Telefono', accessorKey: 'telefono' },
      {
        header: 'Estado',
        cell: ({ row }) => (row.original.deletedAt ? 'Deshabilitado' : 'Activo'),
      },
      {
        header: 'Servicios',
        cell: ({ row }) => row.original.servicios.map((servicio) => servicio.nombre).join(', ') || 'Sin servicios',
      },
      {
        header: 'Horarios',
        cell: ({ row }) => <ProfesionalDisponibilidadCell profesional={row.original} />,
      },
    ],
    [],
  );

  const deleteProfesional = async (profesional: ProfesionalAdmin) => {
    const result = await Swal.fire({
      title: 'Eliminar profesional',
      text: `Seguro que queres deshabilitar a ${profesional.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Deshabilitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#a18d41',
    });

    if (!result.isConfirmed) return;

    try {
      await adminApi.deleteProfesional(profesional.id_profesional);
      await reloadAll();
      Swal.fire('Listo', 'Profesional deshabilitado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  };

  const restoreProfesional = async (profesional: ProfesionalAdmin) => {
    const result = await Swal.fire({
      title: 'Reactivar profesional',
      text: `Seguro que queres volver a habilitar a ${profesional.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Reactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#a18d41',
    });

    if (!result.isConfirmed) return;

    try {
      await adminApi.restoreProfesional(profesional.id_profesional);
      await reloadAll();
      Swal.fire('Listo', 'Profesional reactivado.', 'success');
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
        isDeleted={(row) => Boolean(row.deletedAt)}
        onCreate={() => setModal({ show: true })}
        onView={(row) => setModal({ show: true, data: row, readOnly: true })}
        onEdit={(row) => setModal({ show: true, data: row })}
        onDelete={deleteProfesional}
        onRestore={restoreProfesional}
      />

      {modal.show && (
        <ProfesionalModal
          key={modal.data?.id_profesional ?? 'new-profesional'}
          show={modal.show}
          data={modal.data}
          readOnly={modal.readOnly}
          servicios={servicios}
          onClose={() => setModal({ show: false })}
          onSaved={reloadAll}
        />
      )}
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
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfesionalFormValues>({
    mode: 'onChange',
    resolver: yupResolver(profesionalSchema(Boolean(data))),
    defaultValues: {
      nombre: '',
      dni: '',
      mail: '',
      telefono: '',
      fecha_nacimiento: '',
      codigo: '',
      confirmar_codigo: '',
      servicios: [],
      horarios: [createBlankHorario()],
      disponibilidades: [],
    },
  });

  const selectedServicios = useWatch({ control, name: 'servicios' }) || [];
  const serviciosSeleccionados = useMemo(
    () => servicios.filter((servicio) => selectedServicios.includes(servicio.id_servicio)),
    [servicios, selectedServicios],
  );
  const {
    fields: horarioFields,
    append: appendHorario,
    remove: removeHorario,
  } = useFieldArray({
    control,
    name: 'horarios',
  });
  const {
    fields: disponibilidadFields,
    append: appendDisponibilidad,
    remove: removeDisponibilidad,
  } = useFieldArray({
    control,
    name: 'disponibilidades',
  });

  useEffect(() => {
    if (!show) return;

    reset({
      nombre: data?.nombre || '',
      dni: data?.dni?.toString() || '',
      mail: data?.mail || '',
      telefono: data?.telefono?.toString() || '',
      fecha_nacimiento: data?.fecha_nacimiento || '',
      codigo: '',
      confirmar_codigo: '',
      servicios: data?.servicios.map((servicio) => servicio.id_servicio) || [],
      horarios: data?.horarios.length ? data.horarios : [createBlankHorario()],
      disponibilidades: data?.disponibilidades || [],
    });
  }, [data, reset, show]);

  const submit = handleSubmit(
    async (values) => {
      try {
        const selectedServiceIds = values.servicios.map(Number);
        const horarios = expandHorariosDiasHabiles(values.horarios);
        const payload = {
          nombre: values.nombre,
          dni: Number(values.dni),
          mail: values.mail,
          telefono: Number(values.telefono),
          fecha_nacimiento: values.fecha_nacimiento,
          ...(values.codigo ? { codigo: Number(values.codigo) } : {}),
          servicios: selectedServiceIds,
          horarios: horarios.map((horario) => ({
            ...horario,
            dia: Number(horario.dia),
          })),
          disponibilidades: (values.disponibilidades || [])
            .map((disponibilidad: DisponibilidadServicioAdmin) => ({
              ...disponibilidad,
              id_servicio: Number(disponibilidad.id_servicio),
              dia: Number(disponibilidad.dia),
            }))
            .filter((disponibilidad: DisponibilidadServicioAdmin) => selectedServiceIds.includes(disponibilidad.id_servicio)),
      };

        if (data) await adminApi.updateProfesional(data.id_profesional, payload);
        else await adminApi.createProfesional(payload);

        await onSaved();
        onClose();
        Swal.fire('Listo', 'Profesional guardado.', 'success');
      } catch (error) {
        Swal.fire('Error', apiMessage(error), 'error');
      }
    },
    () => {
      Swal.fire('Revisa el formulario', 'Completá los campos marcados antes de guardar.', 'warning');
    },
  );

  return (
    <Modal show={show} onHide={onClose} size="lg" scrollable backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{readOnly ? 'Ver profesional' : data ? 'Modificar profesional' : 'Agregar profesional'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="profesional-admin-form" onSubmit={submit}>
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
              Email
              <input
                className={`form-control ${errors.mail ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="email"
                {...register('mail')}
              />
              {errors.mail && <div className="invalid-feedback">{errors.mail.message}</div>}
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
              Fecha nacimiento
              <input
                className={`form-control ${errors.fecha_nacimiento ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="date"
                {...register('fecha_nacimiento')}
              />
              {errors.fecha_nacimiento && <div className="invalid-feedback">{errors.fecha_nacimiento.message}</div>}
            </label>

            {!readOnly && (
              <>
                <label>
                  {data ? 'Nuevo codigo de acceso' : 'Codigo de acceso'}
                  <input
                    className={`form-control ${errors.codigo ? 'is-invalid' : ''}`}
                    type="number"
                    {...register('codigo')}
                  />
                  {errors.codigo && <div className="invalid-feedback">{errors.codigo.message}</div>}
                </label>

                <label>
                  Confirmar codigo
                  <input
                    className={`form-control ${errors.confirmar_codigo ? 'is-invalid' : ''}`}
                    type="number"
                    {...register('confirmar_codigo')}
                  />
                  {errors.confirmar_codigo && <div className="invalid-feedback">{errors.confirmar_codigo.message}</div>}
                </label>
              </>
            )}
          </div>

          <h3 className="admin-modal-subtitle">Servicios</h3>
          <Controller
            control={control}
            name="servicios"
            render={({ field }) => {
              const selected = field.value || [];

              return (
                <div className="admin-checkbox-grid">
                  {servicios.map((servicio) => {
                    const checked = selected.includes(servicio.id_servicio);

                    return (
                      <label key={servicio.id_servicio} className="form-check">
                        <input
                          checked={checked}
                          className="form-check-input"
                          disabled={readOnly}
                          type="checkbox"
                          onChange={(event) => {
                            const nextServicios = event.target.checked
                              ? [...selected, servicio.id_servicio]
                              : selected.filter((id) => id !== servicio.id_servicio);

                            field.onChange(nextServicios);
                          }}
                        />
                        <span>{servicio.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              );
            }}
          />
          {errors.servicios && <div className="text-danger mt-2">{errors.servicios.message}</div>}

          <h3 className="admin-modal-subtitle">Horarios base</h3>
          {horarioFields.map((field, index) => (
            <div className="admin-inline-row" key={field.id}>
              <select className="form-select" disabled={readOnly} {...register(`horarios.${index}.dia`, { valueAsNumber: true })}>
                {!readOnly && <option value={-1}>Lunes a viernes</option>}
                {Object.entries(DIAS_SEMANA).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <input
                className={`form-control ${errors.horarios?.[index]?.hora_inicio ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="time"
                {...register(`horarios.${index}.hora_inicio`)}
              />
              {errors.horarios?.[index]?.hora_inicio && (
                <div className="invalid-feedback">{errors.horarios[index]?.hora_inicio?.message}</div>
              )}

              <input
                className={`form-control ${errors.horarios?.[index]?.hora_fin ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="time"
                {...register(`horarios.${index}.hora_fin`)}
              />
              {errors.horarios?.[index]?.hora_fin && (
                <div className="invalid-feedback">{errors.horarios[index]?.hora_fin?.message}</div>
              )}

              {!readOnly && (
                <button className="admin-icon-btn admin-icon-danger" type="button" onClick={() => removeHorario(index)}>
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          ))}
          {errors.horarios?.root && <div className="text-danger mt-2">{errors.horarios.root.message}</div>}
          {!readOnly && (
            <button className="btn btn-outline-secondary btn-sm mt-2" type="button" onClick={() => appendHorario(createBlankHorario())}>
              Agregar horario
            </button>
          )}

          <h3 className="admin-modal-subtitle">Disponibilidad por servicio</h3>
          {disponibilidadFields.map((field, index) => (
            <div className="admin-inline-row" key={field.id}>
              <select className="form-select" disabled={readOnly} {...register(`disponibilidades.${index}.id_servicio`, { valueAsNumber: true })}>
                {serviciosSeleccionados.map((servicio) => (
                  <option key={servicio.id_servicio} value={servicio.id_servicio}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>

              <select className="form-select" disabled={readOnly} {...register(`disponibilidades.${index}.dia`, { valueAsNumber: true })}>
                {Object.entries(DIAS_SEMANA).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <input
                className={`form-control ${errors.disponibilidades?.[index]?.hora_inicio ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="time"
                {...register(`disponibilidades.${index}.hora_inicio`)}
              />
              {errors.disponibilidades?.[index]?.hora_inicio && (
                <div className="invalid-feedback">{errors.disponibilidades[index]?.hora_inicio?.message}</div>
              )}

              <input
                className={`form-control ${errors.disponibilidades?.[index]?.hora_fin ? 'is-invalid' : ''}`}
                readOnly={readOnly}
                type="time"
                {...register(`disponibilidades.${index}.hora_fin`)}
              />
              {errors.disponibilidades?.[index]?.hora_fin && (
                <div className="invalid-feedback">{errors.disponibilidades[index]?.hora_fin?.message}</div>
              )}

              {!readOnly && (
                <button className="admin-icon-btn admin-icon-danger" type="button" onClick={() => removeDisponibilidad(index)}>
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          ))}
          {!readOnly && serviciosSeleccionados.length > 0 && (
            <button
              className="btn btn-outline-secondary btn-sm mt-2"
              type="button"
              onClick={() => appendDisponibilidad({ ...createBlankHorario(), id_servicio: serviciosSeleccionados[0].id_servicio })}
            >
              Agregar disponibilidad especifica
            </button>
          )}
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-light" type="button" onClick={onClose}>
          Cerrar
        </button>
        {!readOnly && (
          <button
            className="btn-style admin-primary-btn"
            disabled={isSubmitting}
            form="profesional-admin-form"
            type="submit"
          >
            Guardar
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
