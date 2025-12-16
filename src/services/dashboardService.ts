import { api } from '../lib/api';
import { 
    AdminDashboardStats, 
    TeacherDashboardStats, 
    StudentDashboardStats,
    Event 
} from '../types'; 

export const dashboardService = {
    getAdminStats: async () => {
        const response = await api.get<AdminDashboardStats>('/dashboard/admin');
        return response.data; 
    },

    getTeacherStats: async () => {
        const response = await api.get<TeacherDashboardStats>('/dashboard/teacher');
        return response.data;
    },

    // 3. Student/Guardian Dashboard (GET /dashboard/student)
    getStudentStats: async () => {
        const response = await api.get<StudentDashboardStats>('/dashboard/student');
        return response.data;
    }
};

export const eventService = {
    getUpcomingEvents: async () => {
        const response = await api.get<Event[]>('/events', { 
            params: { 
                limit: 3, 
                sort: 'startDate:asc',
                endDate_gte: new Date().toISOString() 
            } 
        });
        return response.data;
    }
};