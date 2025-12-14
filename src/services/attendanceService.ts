import { api } from '../lib/api';
import { PaginatedResponse, FilterParams } from '../types';

export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface AttendanceBatch {
  classId: string;
  date: string;
  attendances: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>;
}

export const attendanceService = {
  getAttendances: async (params: FilterParams = {}) => {
    const response = await api.get<PaginatedResponse<Attendance>>('/attendances', { params });
    return response.data;
  },

  getStudentAttendances: async (studentId: string) => {
    const response = await api.get<Attendance[]>(`/attendances/students/${studentId}`);
    return response.data;
  },

  getClassAttendanceSummary: async (classId: string) => {
    const response = await api.get<any>(`/attendances/classes/${classId}/summary`);
    return response.data;
  },

  createAttendanceBatch: async (data: AttendanceBatch) => {
    const response = await api.post<Attendance[]>('/attendances', data);
    return response.data;
  },

  updateAttendance: async (id: string, data: Partial<Attendance>) => {
    const response = await api.patch<Attendance>(`/attendances/${id}`, data);
    return response.data;
  },

  deleteAttendance: async (id: string) => {
    const response = await api.delete<void>(`/attendances/${id}`);
    return response.data;
  }
};