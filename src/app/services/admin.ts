import clientAxios from './axios';
import type {
  BloqueoAdmin,
  CategoriaServicioAdmin,
  ClienteAdmin,
  ObraSocialAdmin,
  ProfesionalAdmin,
  ServicioAdmin,
  TurnoAdmin,
  UsuarioAdmin,
} from '@/app/types/admin';

export type ProfesionalPayload = Omit<ProfesionalAdmin, 'id_profesional' | 'usuario' | 'servicios'> & {
  servicios: number[];
  codigo?: number;
};

export type AdministradorPayload = {
  nombre: string;
  dni: number;
  mail: string;
  telefono: number;
  codigo?: number;
};

export type ClientePayload = {
  nombre: string;
  dni: number;
  telefono: number;
  fecha_nacimiento: string;
  id_obra_social: number;
  numero_obra_social: string;
};

export type ServicioPayload = {
  nombre: string;
  descripcion?: string | null;
  duracion: number;
  precio: number;
  reserva: number;
  visible_cliente: boolean;
  id_categoria_servicio?: number | null;
};

export type CategoriaPayload = {
  nombre: string;
  orden: number;
};

export type TurnoAdminPayload = {
  id_cliente: number;
  id_profesional: number;
  id_servicio: number;
  fecha: string;
  hora: string;
  observaciones?: string;
  forzar_fuera_horario?: boolean;
  confirmar_sobreturno?: boolean;
  reserva_pagada?: boolean;
};

export type BloqueoPayload = {
  id_profesional: number;
  fecha: string;
  tipo: 'DIA_COMPLETO' | 'RANGO_HORARIO';
  hora_inicio?: string;
  hora_fin?: string;
  motivo?: string;
};

export const adminApi = {
  getProfesionales: async () => {
    const { data } = await clientAxios.get<ProfesionalAdmin[]>('/profesionales/admin');
    return data;
  },
  createProfesional: async (payload: ProfesionalPayload) => {
    const { data } = await clientAxios.post<ProfesionalAdmin>('/profesionales', payload);
    return data;
  },
  updateProfesional: async (id: number, payload: ProfesionalPayload) => {
    const { data } = await clientAxios.patch<ProfesionalAdmin>(`/profesionales/${id}`, payload);
    return data;
  },
  deleteProfesional: async (id: number) => {
    const { data } = await clientAxios.delete(`/profesionales/${id}`);
    return data;
  },
  restoreProfesional: async (id: number) => {
    const { data } = await clientAxios.patch<ProfesionalAdmin>(`/profesionales/${id}/restaurar`);
    return data;
  },
  getAdministradores: async () => {
    const { data } = await clientAxios.get<UsuarioAdmin[]>('/usuarios/administradores');
    return data;
  },
  createAdministrador: async (payload: AdministradorPayload) => {
    const { data } = await clientAxios.post<UsuarioAdmin>('/usuarios/administradores', payload);
    return data;
  },
  updateAdministrador: async (id: number, payload: AdministradorPayload) => {
    const { data } = await clientAxios.patch<UsuarioAdmin>(`/usuarios/administradores/${id}`, payload);
    return data;
  },
  deleteAdministrador: async (id: number) => {
    const { data } = await clientAxios.delete(`/usuarios/administradores/${id}`);
    return data;
  },
  restoreAdministrador: async (id: number) => {
    const { data } = await clientAxios.patch<UsuarioAdmin>(`/usuarios/administradores/${id}/restaurar`);
    return data;
  },
  getServicios: async () => {
    const { data } = await clientAxios.get<ServicioAdmin[]>('/servicios');
    return data;
  },
  createServicio: async (payload: ServicioPayload) => {
    const { data } = await clientAxios.post<ServicioAdmin>('/servicios', payload);
    return data;
  },
  updateServicio: async (id: number, payload: ServicioPayload) => {
    const { data } = await clientAxios.patch<ServicioAdmin>(`/servicios/${id}`, payload);
    return data;
  },
  deleteServicio: async (id: number) => {
    const { data } = await clientAxios.delete(`/servicios/${id}`);
    return data;
  },
  getCategorias: async () => {
    const { data } = await clientAxios.get<CategoriaServicioAdmin[]>('/servicios/categorias');
    return data;
  },
  createCategoria: async (payload: CategoriaPayload) => {
    const { data } = await clientAxios.post<CategoriaServicioAdmin>('/servicios/categorias', payload);
    return data;
  },
  updateCategoria: async (id: number, payload: CategoriaPayload) => {
    const { data } = await clientAxios.patch<CategoriaServicioAdmin>(`/servicios/categorias/${id}`, payload);
    return data;
  },
  deleteCategoria: async (id: number) => {
    const { data } = await clientAxios.delete(`/servicios/categorias/${id}`);
    return data;
  },
  getClientes: async () => {
    const { data } = await clientAxios.get<ClienteAdmin[]>('/clientes');
    return data;
  },
  getObrasSociales: async () => {
    const { data } = await clientAxios.get<ObraSocialAdmin[]>('/obras-sociales');
    return data;
  },
  createCliente: async (payload: ClientePayload) => {
    const { data } = await clientAxios.post<ClienteAdmin>('/clientes', payload);
    return data;
  },
  updateCliente: async (id: number, payload: ClientePayload) => {
    const { data } = await clientAxios.patch<ClienteAdmin>(`/clientes/${id}`, payload);
    return data;
  },
  deleteCliente: async (id: number) => {
    const { data } = await clientAxios.delete(`/clientes/${id}`);
    return data;
  },
  getTurnos: async (params: { desde: string; hasta: string; id_profesional?: number }) => {
    const { data } = await clientAxios.get<TurnoAdmin[]>('/turnos/admin', { params });
    return data;
  },
  createTurno: async (payload: TurnoAdminPayload) => {
    const { data } = await clientAxios.post<TurnoAdmin>('/turnos/admin', payload);
    return data;
  },
  cancelarTurno: async (id: number) => {
    const { data } = await clientAxios.patch<TurnoAdmin>(`/turnos/admin/${id}/cancelar`);
    return data;
  },
  updateReservaPago: async (id: number, reserva_pagada: boolean) => {
    const { data } = await clientAxios.patch<TurnoAdmin>(`/turnos/admin/${id}/pago-reserva`, { reserva_pagada });
    return data;
  },
  getBloqueos: async (params: { desde?: string; hasta?: string; id_profesional?: number }) => {
    const { data } = await clientAxios.get<BloqueoAdmin[]>('/bloqueos', { params });
    return data;
  },
  createBloqueo: async (payload: BloqueoPayload) => {
    const { data } = await clientAxios.post<BloqueoAdmin>('/bloqueos', payload);
    return data;
  },
  deleteBloqueo: async (id: number) => {
    const { data } = await clientAxios.delete(`/bloqueos/${id}`);
    return data;
  },
};
