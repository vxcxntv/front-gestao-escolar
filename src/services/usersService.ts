import { api } from '../lib/api';
import { User, FilterParams } from '../types';

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'teacher' | 'student' | 'guardian' | 'parent';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'teacher' | 'student' | 'guardian' | 'parent';
  password?: string;
}

export const usersService = {
  getUsers: async (params: FilterParams = {}): Promise<User[]> => {
    try {
      const response = await api.get('/users', { params });
      let data = response.data;

      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      } else if (data && data.items && Array.isArray(data.items)) {
        data = data.items;
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('usersService: Erro ao buscar usuários', error);
      throw error;
    }
  },

  getUser: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest) => {
    const payload = {
      ...data,
      password: data.password || 'Mudar@123'
    };
    const response = await api.post<User>('/users', payload);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<void>(`/users/${id}`);
    return response.data;
  }
};