import { AxiosResponse } from 'axios';
import clientAxios from './axios';


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
  mail: string;
  telefono: number;
  fecha_nacimiento: string;
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