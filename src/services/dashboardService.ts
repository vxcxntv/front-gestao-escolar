import { api } from '../lib/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
    AdminDashboardStats,
    TeacherDashboardStats,
    StudentDashboardStats,
    Event // Certifique-se de que a interface Event no types.ts tenha 'date' ou 'startDate'
} from '../types';

// Interface local para garantir tipagem correta do retorno do backend
export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    category: string;
    pinned: boolean;
}

// Interface de resposta paginada do backend
interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export const dashboardService = {
    // 1. Admin Dashboard
    getAdminStats: async () => {
        try {
            const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

            const [statsResponse, revenueResponse] = await Promise.all([
                api.get<AdminDashboardStats>('/dashboard/admin'),
                api.get('/reports/financial/revenue', { params: { startDate, endDate } })
            ]);

            const stats = statsResponse.data;
            const revenueData = revenueResponse.data;

            return {
                totalStudents: Number(stats.totalStudents || 0),
                totalClasses: Number(stats.totalClasses || 0),
                totalTeachers: Number(stats.totalTeachers || 0),
                revenueThisMonth: Number(revenueData.totalRevenue || revenueData.receitaTotal || 0)
            };

        } catch (error) {
            console.error("Erro ao carregar dados do admin", error);
            // CORREÇÃO DO ERRO DA IMAGEM: Retorna objeto completo com zeros
            return {
                totalStudents: 0,
                totalClasses: 0,
                totalTeachers: 0,
                revenueThisMonth: 0
            };
        }
    },

    getTeacherStats: async () => {
        try {
            const response = await api.get<TeacherDashboardStats>('/dashboard/teacher');
            return response.data;
        } catch (error) {
            return { totalClasses: 0, totalStudents: 0, assignmentsPending: 0, recentGrades: [], nextClass: null };
        }
    },

    getStudentStats: async () => {
        try {
            const response = await api.get<StudentDashboardStats>('/dashboard/student');
            return response.data;
        } catch (error) {
            return { enrolledClasses: 0, averageGrade: 0, attendanceRate: 0, pendingAssignments: 0, upcomingExams: [], recentGrades: [] };
        }
    },

    // 2. Buscar Avisos (Adaptado para o retorno paginado do Backend)
    getRecentAnnouncements: async () => {
        try {
            // O backend espera 'limit' na query e retorna { data: [], total: ... }
            const response = await api.get<PaginatedResponse<Announcement>>('/announcements', {
                params: {
                    limit: 3,
                    // O backend ordena por pinned DESC, createdAt DESC por padrão
                }
            });
            // Retorna apenas o array de dados
            return response.data.data || [];
        } catch (error) {
            console.error("Erro ao buscar avisos", error);
            return [];
        }
    }
};

export const eventService = {
    // 3. Buscar Eventos (Adaptado para os filtros do Backend)
    getUpcomingEvents: async () => {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            const response = await api.get('/events', { // Removi <Event[]> pois o backend retorna paginação
                params: {
                    limit: 4,
                    // Backend espera 'dateFrom', não 'startDate_gte'
                    dateFrom: today
                }
            });

            // O backend retorna { data: [], ... }
            const eventsData = response.data.data || [];

            // Mapeia para garantir que o front receba o formato esperado
            return eventsData.map((evt: any) => ({
                id: evt.id,
                title: evt.title,
                description: evt.description,
                startDate: evt.date, // O backend retorna 'date', mapeamos para 'startDate' se seu type usar isso
                type: evt.type
            }));
        } catch (error) {
            console.error("Erro ao buscar eventos", error);
            return [];
        }
    }
};