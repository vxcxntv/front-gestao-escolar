// src/services/classesService.ts
import { api } from '../lib/api';

export interface Class {
  id: string;
  name: string;
  academic_year: number;
  teacherId?: string;
  teacher?: {
    id: string;
    name: string;
    email?: string;
  };
  students?: any[];
  enrollments?: any[];
  schedule?: string;
  room?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassDto {
  name: string;
  academic_year: number;
  teacherId: string;
  schedule?: string;
  room?: string;
}

export interface UpdateClassDto {
  name?: string;
  academic_year?: number;
  teacherId?: string;
  schedule?: string;
  room?: string;
}

export interface ClassResponse {
  message?: string;
  data?: Class;
}

// Interface nova para os parâmetros de filtro
export interface ClassParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const classesService = {
  // 1. Renomeado de 'getAll' para 'getClasses'
  // 2. Agora aceita 'params' (page, limit, etc.)
  getClasses: async (params?: ClassParams): Promise<Class[]> => {
    try {
      // Passamos os params na requisição axios
      const response = await api.get('/classes', { params });
      
      let data = response.data;
      
      // Se a resposta tiver estrutura paginada { data: [], total, page... }
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }
      
      console.log('classesService getClasses response:', data);
      
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("classesService: Erro ao buscar turmas", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Class> => {
    try {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`classesService: Erro ao buscar turma ${id}`, error);
      throw error;
    }
  },

  create: async (data: CreateClassDto): Promise<ClassResponse> => {
    try {
      const response = await api.post('/classes', data);
      return response.data;
    } catch (error: any) {
      console.error("classesService: Erro ao criar turma", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateClassDto): Promise<ClassResponse> => {
    try {
      const response = await api.patch(`/classes/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`classesService: Erro ao atualizar turma ${id}`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/classes/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`classesService: Erro ao deletar turma ${id}`, error);
      throw error;
    }
  },

  enrollStudent: async (classId: string, studentId: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/classes/${classId}/students`, { studentId });
      return response.data;
    } catch (error: any) {
      console.error(`classesService: Erro ao matricular aluno`, error);
      throw error;
    }
  },

  getEnrolledStudents: async (classId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    } catch (error: any) {
      console.error(`classesService: Erro ao buscar alunos da turma`, error);
      throw error;
    }
  },

  removeStudent: async (classId: string, studentId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/classes/${classId}/students/${studentId}`);
      return response.data;
    } catch (error: any) {
      console.error(`classesService: Erro ao remover aluno`, error);
      throw error;
    }
  }
};