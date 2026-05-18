import clientAxios from './axios';

export interface ServicioTurno {
  id_servicio: number;
  nombre: string;
  descripcion?: string | null;
  duracion: number;
  precio: number;
  reserva: number;
  visible_cliente: boolean;
  categoria?: {
    id_categoria_servicio: number;
    nombre: string;
    orden: number;
  } | null;
}

export interface ProfesionalTurno {
  id_profesional: number;
  nombre: string;
  servicios: ServicioTurno[];
}

export interface TurnoCliente {
  id_turno: number;
  fechaHora: string;
  estado: string;
  paymentStatus?: string;
  observaciones?: string | null;
  profesional: {
    id_profesional: number;
    nombre: string;
  };
  servicio: ServicioTurno;
}

export interface DiasDisponiblesParams {
  id_profesional: number;
  id_servicio: number;
  desde: string;
  hasta: string;
}

export interface HorariosDisponiblesParams {
  id_profesional: number;
  id_servicio: number;
  fecha: string;
}

export interface CrearTurnoPayload extends HorariosDisponiblesParams {
  hora: string;
  observaciones?: string;
}

export interface CrearTurnoResponse {
  turno: TurnoCliente;
  pago: {
    preferenceId?: string;
    initPoint?: string;
    sandboxInitPoint?: string;
  } | null;
}

export interface EstadoPagoTurno {
  id_turno: number;
  estado: string;
  paymentStatus: string;
  confirmado: boolean;
}

export const getProfesionalesConServicios = async () => {
  const { data } = await clientAxios.get<ProfesionalTurno[]>('/profesionales');
  return data;
};

export const getDiasDisponibles = async (params: DiasDisponiblesParams) => {
  const { data } = await clientAxios.get<string[]>('/turnos/dias-disponibles', { params });
  return data;
};

export const getHorariosDisponibles = async (params: HorariosDisponiblesParams) => {
  const { data } = await clientAxios.get<string[]>('/turnos/horarios-disponibles', { params });
  return data;
};

export const crearTurno = async (payload: CrearTurnoPayload) => {
  const { data } = await clientAxios.post<CrearTurnoResponse>('/turnos', payload);
  return data;
};

export const getMisProximosTurnos = async () => {
  const { data } = await clientAxios.get<TurnoCliente[]>('/turnos/mis-turnos');
  return data;
};

export const getEstadoPagoTurno = async (idTurno: number, sincronizar = false) => {
  const { data } = await clientAxios.get<EstadoPagoTurno>(`/turnos/${idTurno}/estado-pago`, {
    params: { sincronizar },
  });
  return data;
};

export const cancelarTurno = async (idTurno: number) => {
  const { data } = await clientAxios.patch(`/turnos/${idTurno}/cancelar`);
  return data;
};
