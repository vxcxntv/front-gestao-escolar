import { api } from '../lib/api';

export interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  category?: string;
  pinned?: boolean;
  date?: string;     // Usado apenas na leitura (GET)
  createdAt?: string;
  authorName?: string;
}

export const announcementsService = {
  getAnnouncements: async (params: any = {}): Promise<AnnouncementData[]> => {
    try {
      const response = await api.get('/announcements', {
        params: { ...params, limit: 100 }
      });

      const body = response.data;

      if (!body) return [];

      if (body.data && Array.isArray(body.data)) return body.data;
      if (body.items && Array.isArray(body.items)) return body.items;
      if (Array.isArray(body)) return body;

      return [];
    } catch (error) {
      console.error('announcementsService: Erro ao buscar avisos', error);
      return [];
    }
  },

  getAnnouncement: async (id: string) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  createAnnouncement: async (data: any) => {

    const { date, id, ...payload } = data;

    const response = await api.post('/announcements', payload);
    return response.data;
  },

  updateAnnouncement: async (id: string, data: any) => {
    // No update, também removemos campos que não devem ser enviados
    const { date, id: _id, authorName, createdAt, ...payload } = data;

    const response = await api.patch(`/announcements/${id}`, payload);
    return response.data;
  },

  deleteAnnouncement: async (id: string) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  }
};