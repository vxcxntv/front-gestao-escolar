import { api } from '../lib/api';

// Interfaces de Tipagem
export interface Invoice {
  id: string;
  studentId: string;
  student?: {
    id: string;
    name: string;
    email?: string;
  };
  studentName?: string; 
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'pending' | 'paid' | 'overdue' | 'canceled'; 
  createdAt?: string;
}

export interface FinancialReport {
  periodo: { de: string; ate: string };
  receitaTotal: number;
}

// Interfaces para envio de dados (Payloads)
export interface CreateInvoicePayload {
  studentId: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface CreateBatchInvoicePayload {
  classId: string;
  description: string;
  amount: number;
  dueDate: string;
}

export const financeService = {
  // 1. Buscar todas
  getAll: async (params?: { page?: number; limit?: number; status?: string }): Promise<Invoice[]> => {
    try {
      const response = await api.get('/invoices', { params });
      const rawData = response.data;
      const list = (rawData.data && Array.isArray(rawData.data)) ? rawData.data : rawData;

      if (!Array.isArray(list)) return [];

      return list.map((item: any) => ({
        ...item,
        amount: Number(item.amount),
        studentName: item.student?.name || 'Aluno não identificado'
      }));
    } catch (error: any) {
      console.error("financeService: Erro ao buscar faturas", error);
      throw error;
    }
  },

  // 2. Buscar por ID
  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // 3. Criar Individual
  create: async (data: CreateInvoicePayload): Promise<Invoice> => {
    try {
      const response = await api.post('/invoices', data);
      return response.data;
    } catch (error: any) {
      console.error("financeService: Erro ao criar fatura", error);
      throw error;
    }
  },

  // 4. Criar em Lote (AQUI ESTAVA O ERRO - AGORA ESTÁ PRESENTE)
  createBatch: async (data: CreateBatchInvoicePayload): Promise<any> => {
    try {
      const response = await api.post('/invoices/batch', data);
      return response.data;
    } catch (error: any) {
      console.error("financeService: Erro ao criar faturas em lote", error);
      throw error;
    }
  },

  // 5. Atualizar
  update: async (id: string, data: Partial<CreateInvoicePayload>): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}`, data);
    return response.data;
  },

  // 6. Cancelar
  cancel: async (id: string): Promise<void> => { 
    try {
      await api.post(`/invoices/${id}/cancel`);
    } catch (error: any) {
      console.error(`financeService: Erro ao cancelar fatura ${id}`, error);
      throw error;
    }
  },

  // 7. Marcar como Paga
  markAsPaid: async (id: string): Promise<void> => {
    try {
      await api.post(`/invoices/${id}/pay`);
    } catch (error: any) {
      console.error(`financeService: Erro ao marcar fatura ${id} como paga`, error);
      throw error;
    }
  },

  // 8. Relatórios
  getRevenueReport: async (startDate: string, endDate: string): Promise<FinancialReport> => {
    try {
      const response = await api.get('/reports/financial/revenue', { 
        params: { startDate, endDate } 
      });
      return response.data; 
    } catch (error: any) {
      console.error("financeService: Erro ao buscar relatório", error);
      return { periodo: { de: startDate, ate: endDate }, receitaTotal: 0 };
    }
  }
};