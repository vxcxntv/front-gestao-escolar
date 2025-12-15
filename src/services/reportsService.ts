import { api } from '../lib/api';

export interface FinancialReport {
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface DefaultersReport {
  students: Array<{
    id: string;
    name: string;
    totalDue: number;
    overdueDays: number;
    invoices: Array<{
      id: string;
      amount: number;
      dueDate: string;
      description: string;
    }>;
  }>;
}

export const reportsService = {
  getFinancialRevenue: async (startDate: string, endDate: string): Promise<FinancialReport> => {
    try {
      const response = await api.get<FinancialReport>('/reports/financial/revenue', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: any) {
      console.error("reportsService: Erro ao buscar relatório financeiro", error);
      throw error;
    }
  },

  getFinancialDefaults: async (): Promise<DefaultersReport> => {
    try {
      const response = await api.get<DefaultersReport>('/reports/financial/defaults');
      return response.data;
    } catch (error: any) {
      console.error("reportsService: Erro ao buscar relatório de inadimplência", error);
      throw error;
    }
  }
};