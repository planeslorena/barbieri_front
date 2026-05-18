'use client'
import axios from 'axios';

const createClient = () => {
  const client = axios.create({
    baseURL: 'http://localhost:8080', //process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
  });
  return client;
}
const clientAxios = createClient();
export default clientAxios;

