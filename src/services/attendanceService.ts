import { api } from '../lib/api';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

// ATUALIZADO: Agora aceita matrícula e código da turma
export interface CreateAttendanceDto {
  studentRegistration: string; // Matrícula
  classCode: string;          // Código da Turma
  subjectId: string;          // Mantive subjectId (caso ainda seja UUID), se for código, altere aqui também
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export const attendanceService = {
  getAll: async (params: any = {}) => {
    try {
      const response = await api.get('/attendances', { params });
      const data = response.data;
      if (data && Array.isArray(data.data)) {
        return data.data; 
      }
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("attendanceService: Erro ao buscar frequências", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Attendance> => {
    try {
      const response = await api.get(`/attendances/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`attendanceService: Erro ao buscar frequência ${id}`, error);
      throw error;
    }
  },

  // O tipo do parametro 'data' agora pode ser any para permitir a estrutura de Batch que você usa no front
  create: async (data: any): Promise<Attendance> => {
    try {
      const response = await api.post('/attendances', data);
      return response.data;
    } catch (error: any) {
      console.error("attendanceService: Erro ao registrar frequência", error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Attendance>): Promise<Attendance> => {
    try {
      const response = await api.patch(`/attendances/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`attendanceService: Erro ao atualizar frequência ${id}`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/attendances/${id}`);
    } catch (error: any) {
      console.error(`attendanceService: Erro ao deletar frequência ${id}`, error);
      throw error;
    }
  }
};