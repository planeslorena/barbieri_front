import axios from 'axios';
import type { HorarioAdmin } from '@/app/types/admin';

export const emptyHorario: HorarioAdmin = { dia: 1, hora_inicio: '09:00', hora_fin: '18:00' };

export const blankHorario: HorarioAdmin = { dia: 1, hora_inicio: '', hora_fin: '' };

export function createBlankHorario(): HorarioAdmin {
  return { ...blankHorario };
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function apiMessage(error: unknown) {
  const backendMessage = axios.isAxiosError(error) ? error.response?.data?.message : null;
  return Array.isArray(backendMessage) ? backendMessage.join(' ') : backendMessage || 'No se pudo completar la operacion.';
}

export function money(value?: number | null) {
  return `$${Number(value || 0).toLocaleString('es-AR')}`;
}

export function toTime(value?: string | null) {
  return value ? value.slice(0, 5) : '';
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function calculateAge(fechaNacimiento?: string | null) {
  if (!fechaNacimiento) return '-';

  const [year, month, day] = fechaNacimiento.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '-';

  const currentDate = new Date();
  let age = currentDate.getFullYear() - year;
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1;
  }

  return age >= 0 ? age : '-';
}
