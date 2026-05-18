'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { AdminDataTable } from '@/app/components/admin/AdminDataTable';
import { calculateAge, formatDateTime } from '@/app/components/admin/adminUtils';
import type { ClienteAdmin, ProfesionalAdmin } from '@/app/types/admin';
import { getLastTurno, getNextTurno } from './profesionalUtils';

export function PacientesProfesionalPanel({
  pacientes,
  profesional,
}: {
  pacientes: ClienteAdmin[];
  profesional: ProfesionalAdmin;
}) {
  const columns = useMemo<ColumnDef<ClienteAdmin>[]>(
    () => [
      { header: 'Nombre', cell: ({ row }) => row.original.usuario.nombre },
      { header: 'DNI', cell: ({ row }) => row.original.usuario.dni },
      { header: 'Edad', cell: ({ row }) => calculateAge(row.original.fecha_nacimiento) },
      { header: 'Telefono', cell: ({ row }) => row.original.usuario.telefono },
      { header: 'Obra social', cell: ({ row }) => row.original.obra_social?.nombre || 'Sin obra social' },
      {
        header: 'Ultimo turno',
        cell: ({ row }) => {
          const turno = getLastTurno(row.original, profesional);
          return turno ? formatDateTime(turno.fechaHora) : 'Sin turnos';
        },
      },
      {
        header: 'Proximo turno',
        cell: ({ row }) => {
          const turno = getNextTurno(row.original, profesional);
          return turno ? formatDateTime(turno.fechaHora) : 'Sin turno';
        },
      },
    ],
    [profesional],
  );

  return (
    <AdminDataTable
      data={pacientes}
      columns={columns}
      searchPlaceholder="Buscar paciente"
      emptyMessage="Todavia no tenes pacientes asociados a turnos."
    />
  );
}
