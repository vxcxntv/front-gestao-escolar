import { api } from '../lib/api';
import { Subject, FilterParams } from '../types';

// DTOs para garantir tipagem correta
export interface CreateSubjectDto {
  name: string;
  code: string;
  credits: number;
  year: number;
  description?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  credits?: number;
  year?: number;
  description?: string;
}

export const subjectsService = {
  getSubjects: async (params: FilterParams = {}): Promise<Subject[]> => {
    try {
      const response = await api.get('/subjects', { params });
      const body = response.data;

      // BLINDAGEM: Garante retorno de array, independente do formato da API
      if (!body) return [];
      if (body.data && Array.isArray(body.data)) return body.data;
      if (body.items && Array.isArray(body.items)) return body.items;
      if (Array.isArray(body)) return body;

      return [];
    } catch (error) {
      console.error('subjectsService: Erro ao buscar disciplinas', error);
      return [];
    }
  },

  getSubject: async (id: string) => {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  createSubject: async (data: CreateSubjectDto) => {
    const response = await api.post<Subject>('/subjects', data);
    return response.data;
  },

  updateSubject: async (id: string, data: UpdateSubjectDto) => {
    const response = await api.patch<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id: string) => {
    const response = await api.delete<void>(`/subjects/${id}`);
    return response.data;
  }
};