import { api } from '../lib/api';

export interface CreateGradeDto {
  studentId: string;
  subjectId: string;
  value: number;
  description: string;
  teacherId?: string;
}

export const gradesService = {
  create: async (data: CreateGradeDto) => {
    try {
      const response = await api.post('/grades', data);
      return response.data;
    } catch (error) {
      console.error("gradesService: Erro ao lançar nota", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await api.delete(`/grades/${id}`);
    } catch (error) {
      console.error("gradesService: Erro ao excluir nota", error);
      throw error;
    }
  }
};