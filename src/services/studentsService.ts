import { api } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'responsible';
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  matricula?: string;
  enrollment?: any;
  class?: any;
  grades?: any[];
}

export interface CreateStudentDto {
  name: string;
  email: string;
  phone: string;
  enrollment: string;
  class?: string;
  role?: string;
  password?: string;
}

export interface UpdateStudentDto {
  name?: string;
  email?: string;
  phone?: string;
  enrollment?: string;
  class?: string;
}

export interface Student extends User {
  enrollmentNumber: string;
  className: string;
}

export const studentsService = {
  getAll: async (): Promise<Student[]> => {
    try {
      const response = await api.get('/users', { 
        params: { role: 'student' } 
      });
      
      let rawUsers = response.data;
      
      if (rawUsers && rawUsers.data && Array.isArray(rawUsers.data)) {
        rawUsers = rawUsers.data;
      }
      
      if (!Array.isArray(rawUsers)) {
        console.warn("studentsService: Dados inválidos recebidos", rawUsers);
        return [];
      }

      return rawUsers.map((user: any) => {
        // Extração da Matrícula
        let enrollmentValue = 'Pendente';
        if (user.matricula) {
          enrollmentValue = user.matricula;
        } else if (user.enrollment) {
          if (typeof user.enrollment === 'string') {
            enrollmentValue = user.enrollment;
          } else if (typeof user.enrollment === 'object' && user.enrollment.id) {
            enrollmentValue = user.enrollment.id;
          }
        }

        // Extração da Turma
        let className = 'Sem Turma';
        if (user.enrollment && typeof user.enrollment === 'object' && user.enrollment.class) {
          className = user.enrollment.class.name || 'Sem Turma';
        } else if (user.class) {
          if (typeof user.class === 'string') {
            className = user.class;
          } else if (typeof user.class === 'object' && user.class.name) {
            className = user.class.name;
          }
        }

        return {
          id: user.id,
          name: user.name || 'Sem Nome',
          email: user.email || 'sem@email.com',
          phone: user.phone || '',
          status: user.status || 'active',
          role: user.role || 'student',
          matricula: user.matricula,
          
          // Campos adaptados para a view
          enrollmentNumber: enrollmentValue,
          className: className,
          
          grades: Array.isArray(user.grades) ? user.grades : []
        };
      });
    } catch (error: any) {
      console.error("studentsService: Erro ao buscar alunos", error);
      throw error;
    }
  },
  
  create: async (data: CreateStudentDto): Promise<any> => {
    try {
      const payload = { 
        ...data, 
        matricula: data.enrollment,
        password: data.password || 'Mudar@123', 
        role: 'student' 
      };
      const response = await api.post('/users', payload);
      return response.data;
    } catch (error: any) {
      console.error("studentsService: Erro ao criar aluno", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateStudentDto): Promise<any> => {
    try {
      const payload: any = { ...data };
      
      // Só inclui matricula se enrollment for fornecido
      if (data.enrollment !== undefined) {
        payload.matricula = data.enrollment;
      }
      
      const response = await api.patch(`/users/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`studentsService: Erro ao atualizar aluno ${id}`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      console.error(`studentsService: Erro ao deletar aluno ${id}`, error);
      throw error;
    }
  },

  getTeachers: async (): Promise<User[]> => {
    try {
      // Busca todos os usuários e filtra professores
      const response = await api.get('/users');
      
      let data = response.data;
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      // Filtra professores (aceita 'teacher' ou 'professor')
      return data.filter((user: any) => 
        user.role === 'teacher' || user.role === 'professor'
      );
    } catch (error: any) {
      console.error("studentsService: Erro ao buscar professores", error);
      return [];
    }
  },

  // Método adicional para buscar todos os usuários (inclui professores)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      let data = response.data;
      
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("studentsService: Erro ao buscar usuários", error);
      throw error;
    }
  }
};