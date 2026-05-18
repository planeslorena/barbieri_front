import type { ClienteAdmin, ProfesionalAdmin, TurnoAdmin } from '@/app/types/admin';

export type PerfilProfesionalFormValues = {
  mail: string;
  telefono: string;
  codigo: string;
  confirmar_codigo: string;
};

export function getTurnosDelProfesional(cliente: ClienteAdmin, profesional: ProfesionalAdmin) {
  return (cliente.turnos || [])
    .filter((turno) => turno.profesional?.id_profesional === profesional.id_profesional)
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
}

export function getLastTurno(cliente: ClienteAdmin, profesional: ProfesionalAdmin): TurnoAdmin | undefined {
  const now = Date.now();
  return [...getTurnosDelProfesional(cliente, profesional)]
    .reverse()
    .find((turno) => new Date(turno.fechaHora).getTime() <= now);
}

export function getNextTurno(cliente: ClienteAdmin, profesional: ProfesionalAdmin): TurnoAdmin | undefined {
  const now = Date.now();
  return getTurnosDelProfesional(cliente, profesional)
    .find((turno) => new Date(turno.fechaHora).getTime() > now && turno.estado !== 'CANCELADO');
}
