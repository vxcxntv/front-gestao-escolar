// src/services/financeService.ts
import { api } from '../lib/api';

export interface Invoice {
  id: string;
  studentName: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt?: string;
}

export interface FinancialReport {
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export const financeService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }): Promise<Invoice[]> => {
    try {
      const response = await api.get('/invoices', { params });
      
      let data = response.data;
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }

      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error: any) {
      console.error("financeService: Erro ao buscar faturas", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Invoice> => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`financeService: Erro ao buscar fatura ${id}`, error);
      throw error;
    }
  },

  create: async (data: any): Promise<Invoice> => {
    try {
      const response = await api.post('/invoices', data);
      return response.data;
    } catch (error: any) {
      console.error("financeService: Erro ao criar fatura", error);
      throw error;
    }
  },

  createBatch: async (data: any): Promise<any> => {
    try {
      const response = await api.post('/invoices/batch', data);
      return response.data;
    } catch (error: any) {
      console.error("financeService: Erro ao criar faturas em lote", error);
      throw error;
    }
  },

  update: async (id: string, data: any): Promise<Invoice> => {
    try {
      const response = await api.patch(`/invoices/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`financeService: Erro ao atualizar fatura ${id}`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => { // Cancelar/Deletar
    try {
      await api.delete(`/invoices/${id}`);
    } catch (error: any) {
      console.error(`financeService: Erro ao excluir fatura ${id}`, error);
      throw error;
    }
  },

  markAsPaid: async (id: string, paymentDate: string): Promise<void> => {
    try {
      await api.post(`/invoices/${id}/pay`, { paymentDate });
    } catch (error: any) {
      console.error(`financeService: Erro ao marcar fatura ${id} como paga`, error);
      throw error;
    }
  },

  getRevenueReport: async (startDate: string, endDate: string): Promise<FinancialReport> => {
    try {
      const response = await api.get('/reports/financial/revenue', { 
        params: { startDate, endDate } 
      });
      return response.data;
    } catch (error: any) {
      console.error("financeService: Erro ao buscar relatório financeiro", error);
      throw error;
    }
  }
};