import { api } from '../lib/api';
import { PaginatedResponse, FilterParams } from '../types';

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
  createdAt: string;
}

export const eventsService = {
  getEvents: async (params: FilterParams = {}) => {
    const response = await api.get<PaginatedResponse<Event>>('/events', { params });
    return response.data;
  },

  getEvent: async (id: string) => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: Omit<Event, 'id' | 'createdAt'>) => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<Event>) => {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await api.delete<void>(`/events/${id}`);
    return response.data;
  }
};