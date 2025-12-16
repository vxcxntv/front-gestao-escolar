import { api } from '../lib/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
    AdminDashboardStats,
    TeacherDashboardStats,
    StudentDashboardStats,
    Event
} from '../types';

// Interface simples para os avisos (caso não tenha no types global)
export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    priority?: 'high' | 'normal';
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
            // CORREÇÃO DO ERRO DA IMAGEM: Retornar objeto completo zerado
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
            console.error("Erro dashboard teacher", error);
            return { totalClasses: 0, totalStudents: 0, assignmentsPending: 0, recentGrades: [], nextClass: null };
        }
    },

    getStudentStats: async () => {
        try {
            const response = await api.get<StudentDashboardStats>('/dashboard/student');
            return response.data;
        } catch (error) {
            console.error("Erro dashboard student", error);
            return { enrolledClasses: 0, averageGrade: 0, attendanceRate: 0, pendingAssignments: 0, upcomingExams: [], recentGrades: [] };
        }
    },

    // NOVA FUNÇÃO: Buscar Avisos
    getRecentAnnouncements: async () => {
        try {
            const response = await api.get<Announcement[]>('/announcements', {
                params: { limit: 3, sort: 'createdAt:desc' }
            });
            return response.data;
        } catch (error) {
            return [];
        }
    }
};

export const eventService = {
    getUpcomingEvents: async () => {
        try {
            const response = await api.get<Event[]>('/events', {
                params: {
                    limit: 4, // Ajustado para preencher melhor o card
                    sort: 'startDate:asc',
                    startDate_gte: new Date().toISOString()
                }
            });
            return response.data;
        } catch (error) {
            return [];
        }
    }
};