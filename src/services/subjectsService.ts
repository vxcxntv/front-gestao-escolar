import { api } from '../lib/api';
import { Subject, PaginatedResponse, FilterParams } from '../types';

export const subjectsService = {
  getSubjects: async (params: FilterParams = {}) => {
    const response = await api.get<PaginatedResponse<Subject>>('/subjects', { params });
    return response.data;
  },

  getSubject: async (id: string) => {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  createSubject: async (data: Omit<Subject, 'id'>) => {
    const response = await api.post<Subject>('/subjects', data);
    return response.data;
  },

  updateSubject: async (id: string, data: Partial<Subject>) => {
    const response = await api.patch<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id: string) => {
    const response = await api.delete<void>(`/subjects/${id}`);
    return response.data;
  },

  assignSubjectToClass: async (classId: string, subjectId: string) => {
    const response = await api.post<void>(`/classes/${classId}/subjects`, { subjectId });
    return response.data;
  },

  removeSubjectFromClass: async (classId: string, subjectId: string) => {
    const response = await api.delete<void>(`/classes/${classId}/subjects/${subjectId}`);
    return response.data;
  }
};