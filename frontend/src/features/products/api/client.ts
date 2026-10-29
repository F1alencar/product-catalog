import axios from 'axios';
import type { ApiError } from '../types/product';


export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiError;
      return Promise.reject(new Error(apiError.message || 'Erro na requisição'));
    }
    if (axios.isAxiosError(error) && !error.response) {
      return Promise.reject(
        new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.'),
      );
    }
    return Promise.reject(error);
  },
);
