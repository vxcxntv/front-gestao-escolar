import { api } from '../lib/api';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'academic' | 'holiday' | 'meeting' | 'exam' | 'other';
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  organizer?: string;
  participants?: string[];
  createdAt?: string;
}

export const eventsService = {
  getAll: async (params?: any): Promise<Event[]> => {
    try {
      const response = await api.get('/events', { params });
      
      // Tratamento para garantir array, independente do formato da API (paginado ou não)
      let data = response.data;
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }

      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error: any) {
      console.error("eventsService: Erro ao buscar eventos", error);
      // Retorna array vazio em caso de erro para não quebrar a UI
      return []; 
    }
  },

  getById: async (id: string): Promise<Event> => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`eventsService: Erro ao buscar evento ${id}`, error);
      throw error;
    }
  },

  create: async (data: any): Promise<Event> => {
    try {
      const response = await api.post('/events', data);
      return response.data;
    } catch (error: any) {
      console.error("eventsService: Erro ao criar evento", error);
      throw error;
    }
  },

  update: async (id: string, data: any): Promise<Event> => {
    try {
      const response = await api.patch(`/events/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`eventsService: Erro ao atualizar evento ${id}`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/events/${id}`);
    } catch (error: any) {
      console.error(`eventsService: Erro ao deletar evento ${id}`, error);
      throw error;
    }
  }
};