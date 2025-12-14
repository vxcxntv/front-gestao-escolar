import { api } from '../lib/api';
import { User, CreateUserRequest, UpdateUserRequest, PaginatedResponse, FilterParams } from '../types';


export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'teacher' | 'student' | 'parent';
  status?: 'active' | 'inactive' | 'pending';
}

export const usersService = {
  getUsers: async (params: FilterParams = {}) => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await api.post<User>('/users', data);
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