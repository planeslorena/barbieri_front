import clientAxios from './axios';
import type { BloqueoAdmin, ClienteAdmin, ProfesionalAdmin, TurnoAdmin } from '@/app/types/admin';
import type { BloqueoPayload, TurnoAdminPayload } from './admin';

export type ProfesionalProfilePayload = {
  mail?: string;
  telefono?: number;
  codigo?: number;
};

export const profesionalApi = {
  getMe: async () => {
    const { data } = await clientAxios.get<ProfesionalAdmin>('/profesionales/me');
    return data;
  },
  updateMe: async (payload: ProfesionalProfilePayload) => {
    const { data } = await clientAxios.patch<ProfesionalAdmin>('/profesionales/me', payload);
    return data;
  },
  getTurnos: async (params: { desde: string; hasta: string }) => {
    const { data } = await clientAxios.get<TurnoAdmin[]>('/turnos/profesional', { params });
    return data;
  },
  createTurno: async (payload: Omit<TurnoAdminPayload, 'id_profesional'>) => {
    const { data } = await clientAxios.post<TurnoAdmin>('/turnos/profesional', payload);
    return data;
  },
  cancelarTurno: async (id: number) => {
    const { data } = await clientAxios.patch<TurnoAdmin>(`/turnos/profesional/${id}/cancelar`);
    return data;
  },
  updateReservaPago: async (id: number, reserva_pagada: boolean) => {
    const { data } = await clientAxios.patch<TurnoAdmin>(`/turnos/profesional/${id}/pago-reserva`, { reserva_pagada });
    return data;
  },
  getBloqueos: async (params: { desde?: string; hasta?: string }) => {
    const { data } = await clientAxios.get<BloqueoAdmin[]>('/bloqueos/profesional', { params });
    return data;
  },
  createBloqueo: async (payload: Omit<BloqueoPayload, 'id_profesional'>) => {
    const { data } = await clientAxios.post<BloqueoAdmin>('/bloqueos/profesional', payload);
    return data;
  },
  deleteBloqueo: async (id: number) => {
    const { data } = await clientAxios.delete(`/bloqueos/profesional/${id}`);
    return data;
  },
  getPacientes: async () => {
    const { data } = await clientAxios.get<ClienteAdmin[]>('/clientes/profesional');
    return data;
  },
};
