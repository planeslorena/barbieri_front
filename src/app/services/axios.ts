'use client'
import axios from 'axios';

const createClient = () => {
  const client = axios.create({
    baseURL: 'http://localhost:8080',//'https://peluditospoly.com.ar/api'
    //'http://localhost:8080'
    withCredentials: true,
  });
  return client;
}
const clientAxios = createClient();
export default clientAxios;

