import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Defina a URL base da sua API (ajuste se sua porta for diferente, ex: 3000 ou 8080)
export const api = axios.create({
    baseURL: baseURL,
});

// Interceptor para adicionar o Token automaticamente (preparando para o futuro)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});