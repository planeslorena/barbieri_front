export interface UsuarioAdmin {
  id_usuario: number;
  nombre: string;
  dni: number;
  mail: string;
  telefono: number;
  rol: 'ADMIN' | 'PROF' | 'USER';
}

export interface CategoriaServicioAdmin {
  id_categoria_servicio: number;
  nombre: string;
  orden: number;
  activo?: boolean;
}

export interface ServicioAdmin {
  id_servicio: number;
  nombre: string;
  descripcion?: string | null;
  duracion: number;
  precio: number;
  reserva: number;
  visible_cliente: boolean;
  categoria?: CategoriaServicioAdmin | null;
}

export interface HorarioAdmin {
  id_horario?: number | null;
  dia: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface DisponibilidadServicioAdmin extends HorarioAdmin {
  id?: number | null;
  id_servicio: number;
  servicio?: ServicioAdmin | null;
}

export interface ProfesionalAdmin {
  id_profesional: number;
  nombre: string;
  dni: number;
  mail: string;
  telefono: number;
  fecha_nacimiento: string;
  usuario?: UsuarioAdmin;
  servicios: ServicioAdmin[];
  horarios: HorarioAdmin[];
  disponibilidades: DisponibilidadServicioAdmin[];
}

export interface ClienteAdmin {
  id_cliente: number;
  fecha_nacimiento: string;
  usuario: UsuarioAdmin;
  turnos?: TurnoAdmin[];
}

export interface TurnoAdmin {
  id_turno: number;
  fechaHora: string;
  observaciones?: string | null;
  estado: 'CONFIRMADO' | 'CANCELADO' | 'BLOQUEADO';
  paymentStatus: 'NO_REQUIERE' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO' | 'REEMBOLSADO';
  paymentAmount?: number | null;
  paidAt?: string | null;
  cliente: ClienteAdmin;
  profesional: ProfesionalAdmin;
  servicio: ServicioAdmin;
}

export interface BloqueoAdmin {
  id: number;
  id_profesional: number;
  fecha: string;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  tipo: 'DIA_COMPLETO' | 'RANGO_HORARIO';
  motivo?: string | null;
  profesional?: ProfesionalAdmin;
}

export const DIAS_SEMANA: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miercoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sabado',
};
