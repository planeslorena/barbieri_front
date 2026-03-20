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