'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { AdminDataTable } from '@/app/components/admin/AdminDataTable';
import { money } from '@/app/components/admin/adminUtils';
import type { ServicioAdmin } from '@/app/types/admin';

export function ServiciosProfesionalPanel({ servicios }: { servicios: ServicioAdmin[] }) {
  const columns = useMemo<ColumnDef<ServicioAdmin>[]>(
    () => [
      { header: 'Nombre', accessorKey: 'nombre' },
      { header: 'Duracion', cell: ({ row }) => `${row.original.duracion} min` },
      { header: 'Precio', cell: ({ row }) => money(row.original.precio) },
      { header: 'Reserva', cell: ({ row }) => money(row.original.reserva) },
      { header: 'Categoria', cell: ({ row }) => row.original.categoria?.nombre || 'Sin categoria' },
      { header: 'Paciente', cell: ({ row }) => (row.original.visible_cliente ? 'Visible' : 'Interno') },
    ],
    [],
  );

  return (
    <AdminDataTable
      data={servicios.filter((servicio) => !servicio.deletedAt)}
      columns={columns}
      searchPlaceholder="Buscar servicio"
      emptyMessage="No tenes servicios asignados."
    />
  );
}
