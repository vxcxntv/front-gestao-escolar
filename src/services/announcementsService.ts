import { api } from '../lib/api';
import { Announcement, PaginatedResponse, FilterParams } from '../types';

export const announcementsService = {
  getAnnouncements: async (params: FilterParams = {}) => {
    const response = await api.get<PaginatedResponse<Announcement>>('/announcements', { params });
    return response.data;
  },

  getAnnouncement: async (id: string) => {
    const response = await api.get<Announcement>(`/announcements/${id}`);
    return response.data;
  },

  createAnnouncement: async (data: Omit<Announcement, 'id' | 'authorId' | 'authorName' | 'createdAt'>) => {
    const response = await api.post<Announcement>('/announcements', data);
    return response.data;
  },

  updateAnnouncement: async (id: string, data: Partial<Announcement>) => {
    const response = await api.patch<Announcement>(`/announcements/${id}`, data);
    return response.data;
  },

  deleteAnnouncement: async (id: string) => {
    const response = await api.delete<void>(`/announcements/${id}`);
    return response.data;
  }
};