import { api } from '../lib/api';

export interface FinancialReport {
  period: string;
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

export interface StudentHistoryReport {
  student: {
    id: string;
    name: string;
    email: string;
  };
  grades: Array<{
    subject: string;
    average: number;
    grades: Array<{
      value: number;
      type: string;
      date: string;
    }>;
  }>;
  attendance: {
    rate: number;
    totalClasses: number;
    absences: number;
  };
  invoices: Array<{
    description: string;
    amount: number;
    status: string;
    dueDate: string;
  }>;
}

export const reportsService = {
  getFinancialRevenue: async (startDate: string, endDate: string) => {
    const response = await api.get<FinancialReport>('/reports/financial/revenue', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getFinancialDefaults: async () => {
    const response = await api.get<DefaultersReport>('/reports/financial/defaults');
    return response.data;
  },

  getStudentHistory: async (studentId: string) => {
    const response = await api.get<StudentHistoryReport>(`/reports/students/${studentId}/history`);
    return response.data;
  }
};