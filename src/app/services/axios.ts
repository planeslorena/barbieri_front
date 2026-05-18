'use client'
import axios from 'axios';

const createClient = () => {
  const client = axios.create({
    baseURL: 'https://api.draflorenciabarbieri.com.ar',
    withCredentials: true,
  });
  return client;
}
const clientAxios = createClient();
export default clientAxios;

