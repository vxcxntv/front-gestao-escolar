// src/services/teachersService.ts
import { api } from '../lib/api';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'professor';
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const teachersService = {
  getAll: async (): Promise<Teacher[]> => {
    try {
      const response = await api.get('/users');
      
      // Ajuste baseado na sua API (que retorna { data: [], total, page, totalPages })
      let data = response.data;
      
      // Se a resposta tiver propriedade 'data', usa ela
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }
      
      console.log('teachersService response:', data);
      
      // Filtra apenas professores
      if (Array.isArray(data)) {
        return data.filter((user: any) => 
          user.role === 'teacher' || user.role === 'professor'
        );
      }
      
      return [];
    } catch (error: any) {
      console.error("teachersService: Erro ao buscar professores", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Teacher> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`teachersService: Erro ao buscar professor ${id}`, error);
      throw error;
    }
  }
};