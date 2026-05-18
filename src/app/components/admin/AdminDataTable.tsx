'use client';
/* eslint-disable react-hooks/incompatible-library */

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

interface AdminDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  isDeleted?: (row: T) => boolean;
  onCreate?: () => void;
  createLabel?: string;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onRestore?: (row: T) => void;
}

export function AdminDataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Buscar',
  emptyMessage = 'No hay datos para mostrar.',
  isDeleted,
  onCreate,
  createLabel = 'Agregar',
  onView,
  onEdit,
  onDelete,
  onRestore,
}: AdminDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const actionColumn: ColumnDef<T> = {
    id: 'actions',
    header: 'Acciones',
    enableSorting: false,
    cell: ({ row }) => {
      const deleted = isDeleted?.(row.original) || false;

      return (
        <div className="admin-row-actions">
          {onView && (
            <button type="button" className="admin-icon-btn" onClick={() => onView(row.original)} aria-label="Ver">
              <i className="bi bi-eye" />
            </button>
          )}
          {onEdit && !deleted && (
            <button type="button" className="admin-icon-btn" onClick={() => onEdit(row.original)} aria-label="Editar">
              <i className="bi bi-pencil" />
            </button>
          )}
          {onDelete && !deleted && (
            <button type="button" className="admin-icon-btn admin-icon-danger" onClick={() => onDelete(row.original)} aria-label="Eliminar">
              <i className="bi bi-trash3" />
            </button>
          )}
          {onRestore && deleted && (
            <button type="button" className="admin-icon-btn" onClick={() => onRestore(row.original)} aria-label="Reactivar">
              <i className="bi bi-arrow-counterclockwise" />
            </button>
          )}
        </div>
      );
    },
  };

  const table = useReactTable({
    data,
    columns: onView || onEdit || onDelete || onRestore ? [...columns, actionColumn] : columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="admin-table-card">
      <div className="admin-table-toolbar">
        <input
          className="form-control admin-search"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
        />
        {onCreate && (
          <button type="button" className="btn-style admin-primary-btn" onClick={onCreate}>
            {createLabel}
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="table admin-table align-middle">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    <span>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <i className="bi bi-sort-down ms-1" />,
                        desc: <i className="bi bi-sort-up ms-1" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={table.getAllColumns().length} className="text-center py-4">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={isDeleted?.(row.original) ? 'admin-row-disabled' : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button type="button" className="admin-icon-btn" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
          <i className="bi bi-chevron-double-left" />
        </button>
        <button type="button" className="admin-icon-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <i className="bi bi-chevron-left" />
        </button>
        <span>
          Pagina {table.getState().pagination.pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
        </span>
        <button type="button" className="admin-icon-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <i className="bi bi-chevron-right" />
        </button>
        <button type="button" className="admin-icon-btn" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
          <i className="bi bi-chevron-double-right" />
        </button>
      </div>
    </div>
  );
}
