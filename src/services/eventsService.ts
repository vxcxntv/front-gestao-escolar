import { api } from '../lib/api';

// Interface espelhando o Backend (event.model.ts)
export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'holiday' | 'exam' | 'meeting' | 'reunion' | 'other';
  date: string; // Formato YYYY-MM-DD (DataType.DATEONLY do backend)
  createdAt?: string;
  updatedAt?: string;
}

export const eventsService = {
  getAll: async (params?: any): Promise<Event[]> => {
    try {
      // Mapeia os parâmetros do front para o que o Controller espera (filter-event.dto.ts)
      const queryParams: any = {};
      
      if (params?.type) queryParams.type = params.type;
      if (params?.startDate) queryParams.dateFrom = params.startDate; // Backend espera dateFrom
      if (params?.endDate) queryParams.dateTo = params.endDate;     // Backend espera dateTo
      if (params?.title) queryParams.title = params.title;

      const response = await api.get('/events', { params: queryParams });
      
      // O backend retorna paginação: { data: [...], total, page ... }
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

  create: async (data: Omit<Event, 'id'>): Promise<Event> => {
    try {
      const response = await api.post('/events', data);
      return response.data;
    } catch (error: any) {
      console.error("eventsService: Erro ao criar evento", error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
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