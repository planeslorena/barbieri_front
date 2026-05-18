'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { apiMessage } from '@/app/components/admin/adminUtils';
import { profesionalApi } from '@/app/services/profesional';
import type { ProfesionalAdmin } from '@/app/types/admin';
import type { PerfilProfesionalFormValues } from './profesionalUtils';

const perfilSchema = yup.object({
  mail: yup.string().trim().email('Ingrese un email valido').required('El email es requerido'),
  telefono: yup
    .string()
    .required('El telefono es requerido')
    .matches(/^\d+$/, 'El telefono debe contener solo numeros'),
  codigo: yup
    .string()
    .trim()
    .matches(/^\d*$/, 'El codigo debe contener solo numeros')
    .default(''),
  confirmar_codigo: yup.string().default('').test('matches-code', 'Los codigos no coinciden', function (value) {
    const codigo = this.parent.codigo;
    if (!codigo) return true;
    return value === codigo;
  }),
});

export function PerfilProfesionalPanel({
  profesional,
  onSaved,
}: {
  profesional: ProfesionalAdmin;
  onSaved: () => Promise<void>;
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<PerfilProfesionalFormValues>({
    mode: 'onChange',
    resolver: yupResolver(perfilSchema),
    defaultValues: {
      mail: profesional.mail || '',
      telefono: profesional.telefono?.toString() || '',
      codigo: '',
      confirmar_codigo: '',
    },
  });

  useEffect(() => {
    reset({
      mail: profesional.mail || '',
      telefono: profesional.telefono?.toString() || '',
      codigo: '',
      confirmar_codigo: '',
    });
  }, [profesional, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await profesionalApi.updateMe({
        mail: values.mail,
        telefono: Number(values.telefono),
        ...(values.codigo ? { codigo: Number(values.codigo) } : {}),
      });
      await onSaved();
      Swal.fire('Listo', 'Perfil actualizado.', 'success');
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    }
  });

  return (
    <div className="admin-table-card">
      <form id="perfil-profesional-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <label>
            Nombre
            <input className="form-control" readOnly value={profesional.nombre} />
          </label>

          <label>
            DNI
            <input className="form-control" readOnly value={profesional.dni} />
          </label>

          <label>
            Email
            <input className={`form-control ${errors.mail ? 'is-invalid' : ''}`} type="email" {...register('mail')} />
            {errors.mail && <div className="invalid-feedback">{errors.mail.message}</div>}
          </label>

          <label>
            Telefono
            <input className={`form-control ${errors.telefono ? 'is-invalid' : ''}`} type="number" {...register('telefono')} />
            {errors.telefono && <div className="invalid-feedback">{errors.telefono.message}</div>}
          </label>

          <label>
            Nuevo codigo de acceso
            <input className={`form-control ${errors.codigo ? 'is-invalid' : ''}`} type="number" {...register('codigo')} />
            {errors.codigo && <div className="invalid-feedback">{errors.codigo.message}</div>}
          </label>

          <label>
            Confirmar codigo
            <input className={`form-control ${errors.confirmar_codigo ? 'is-invalid' : ''}`} type="number" {...register('confirmar_codigo')} />
            {errors.confirmar_codigo && <div className="invalid-feedback">{errors.confirmar_codigo.message}</div>}
          </label>
        </div>

        <button className="btn-style admin-primary-btn mt-3" disabled={isSubmitting} type="submit">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
