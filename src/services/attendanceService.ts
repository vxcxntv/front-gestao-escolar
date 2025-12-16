import { api } from '../lib/api';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;

  // Relacionamentos para exibição
  studentId: string;
  studentName?: string; // O backend pode mandar 'studentName' ou objeto 'student'
  student?: { id: string; name: string };

  classId: string;
  className?: string;
  class?: { id: string; name: string };

  subjectId?: string;
  subjectName?: string;
  subject?: { id: string; name: string };
}

export const attendanceService = {
  getAll: async (params: any = {}): Promise<Attendance[]> => {
    try {
      const response = await api.get('/attendances', { params });
      const body = response.data;

      // Blindagem contra diferentes formatos de resposta
      if (!body) return [];
      if (body.data && Array.isArray(body.data)) return body.data;
      if (Array.isArray(body)) return body;

      return [];
    } catch (error: any) {
      console.error("attendanceService: Erro ao buscar frequências", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Attendance> => {
    const response = await api.get(`/attendances/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/attendances', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/attendances/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/attendances/${id}`);
  }
};