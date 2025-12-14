import { api } from '../lib/api';
import { Invoice, PaginatedResponse, FilterParams } from '../types';

export interface CreateInvoiceRequest {
  studentId: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface BatchInvoiceRequest {
  classId: string;
  description: string;
  amount: number;
  dueDate: string;
}

export const invoicesService = {
  getInvoices: async (params: FilterParams = {}) => {
    const response = await api.get<PaginatedResponse<Invoice>>('/invoices', { params });
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  getStudentInvoices: async (studentId: string) => {
    const response = await api.get<Invoice[]>(`/students/${studentId}/invoices`);
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceRequest) => {
    const response = await api.post<Invoice>('/invoices', data);
    return response.data;
  },

  createBatchInvoices: async (data: BatchInvoiceRequest) => {
    const response = await api.post<Invoice[]>('/invoices/batch', data);
    return response.data;
  },

  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    const response = await api.patch<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  markAsPaid: async (id: string) => {
    const response = await api.post<Invoice>(`/invoices/${id}/pay`);
    return response.data;
  },

  cancelInvoice: async (id: string) => {
    const response = await api.post<Invoice>(`/invoices/${id}/cancel`);
    return response.data;
  }
};