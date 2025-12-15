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

export interface CreateAttendanceDto {
  studentName: string;
  date: string;
  status: AttendanceStatus;
  classId: string; // Agora obrigatório
  notes?: string;
}

export const attendanceService = {
  getAll: async (params: any = {}) => {
    try {
      const response = await api.get('/attendances', { params });
      
      // Tratamento robusto para diferentes formatos de resposta
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

  create: async (data: CreateAttendanceDto): Promise<Attendance> => {
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