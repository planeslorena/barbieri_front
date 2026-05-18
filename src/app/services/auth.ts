import { AxiosResponse } from 'axios';
import clientAxios from './axios';

export const logout = async () => {
    const { data } = await clientAxios.post('auth/logout');
    return data;
}


export const login = async (data: any) => {
    try {
        const respuesta: AxiosResponse<any, any> = await clientAxios.post('auth/login', data, {
            withCredentials: true,
        });
        return respuesta.data;
    } catch (error: any) {
        return error.response.data.statusCode;
    }
}

 
// ─── Types ────────────────────────────────────────────────────────────────────
 
export interface RegisterPayload {
  nombre: string;
  dni: number;
  telefono: number;
  fecha_nacimiento: string;
  id_obra_social: number;
  numero_obra_social: string;
}

export interface ObraSocial {
  id_obra_social: number;
  nombre: string;
  activo: boolean;
}
 
// ─── Service ──────────────────────────────────────────────────────────────────
 
/**
 * Registers a new user + client in a single request.
 * Returns the created Cliente (with usuario nested) on success,
 * or the Axios error response on failure (409 conflict, etc.).
 */
export const registerUser = async (payload: RegisterPayload) => {
  try {
    const { data } = await clientAxios.post("/clientes/register", payload);
    return { status: 200, data };
  } catch (error: any) {
    return {
      status: error.response?.status ?? 500,
      data: null,
    };
  }
};

export const getObrasSociales = async () => {
  const { data } = await clientAxios.get<ObraSocial[]>('/obras-sociales');
  return data;
};
