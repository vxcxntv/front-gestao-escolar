import { api } from '../lib/api';


export const financeService = {
    listInvoices: async (params?: { page: number, limit: number, status?: string }) => {
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    createInvoice: async (data: any) => {
        const response = await api.post('/invoices', data);
        return response.data;
    },
    
    createBatchInvoices: async (data: any) => {
        const response = await api.post('/invoices/batch', data);
        return response.data;
    },

    markAsPaid: async (id: string, paymentDate: string) => {
        return await api.post(`/invoices/${id}/pay`, { paymentDate });
    },

    getRevenueReport: async (params: { startDate: string, endDate: string }) => {
        const response = await api.get('/reports/financial/revenue', { params });
        return response.data;
    }
};