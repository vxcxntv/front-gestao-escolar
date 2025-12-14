export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student' | 'guardian' | 'responsible'; // ✅ Adicione 'responsible'
    phone?: string;
    enrollment?: string;
    status?: 'active' | 'inactive';
    class?: string;
    matricula?: string;
    createdAt?: string;
    updatedAt?: string;
    grades?: any[];
}

export interface GetUsersResponse {
    data: User[];
    total: number; // Supondo paginação padrão
}

export interface CreateUserDto {
    name: string;
    email: string;
    password?: string; // Opcional na visualização, obrigatório no cadastro
    role: 'student';
    phone?: string;
    enrollment?: string;
}

export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface AuthResponseDto {
    access_token: string;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface AdminDashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    activeInvoices: number;
    paidInvoicesThisMonth: number;
    revenueThisMonth: number;
}