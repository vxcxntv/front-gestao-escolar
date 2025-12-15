import { api } from '../lib/api';

export interface Subject {
  id: string;
  name: string;
}

export const subjectsService = {
  getAll: async () => {
    try {
      // Ajuste a rota '/subjects' conforme a sua API real
      const response = await api.get('/subjects');
      return response.data;
    } catch (error) {
      console.error("subjectsService: Erro ao buscar disciplinas", error);
      throw error;
    }
  }
}

export interface CreateGradeDto {
  studentId: string;
  subjectId: string;
  value: number;
  description: string;
}

export const gradesService = {
  // Cria uma nova nota
  create: async (data: CreateGradeDto) => {
    try {
      // O backend espera { studentId, subjectId, value, description }
      const response = await api.post('/grades', data);
      return response.data;
    } catch (error) {
      console.error("gradesService: Erro ao lançar nota", error);
      throw error;
    }
  },

  // Exclui uma nota (útil para implementação futura na tabela)
  delete: async (id: string) => {
    try {
      await api.delete(`/grades/${id}`);
    } catch (error) {
      console.error("gradesService: Erro ao excluir nota", error);
      throw error;
    }
  }
};