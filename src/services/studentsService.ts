import { api } from '../lib/api';
import { User } from '../types';

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
  //className: string;
}

export const studentsService = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users', {
        params: { role: 'student' }
      });

      let rawUsers = response.data;

      // Tratamento para estruturas paginadas
      if (rawUsers && rawUsers.data && Array.isArray(rawUsers.data)) {
        rawUsers = rawUsers.data;
      }

      if (!Array.isArray(rawUsers)) {
        console.warn("studentsService: Dados inválidos recebidos", rawUsers);
        return [];
      }

      return rawUsers.map((user: any) => {
        // Lógica de fallback robusta para Matrícula
        let enrollmentValue = 'Pendente';
        if (user.matricula) enrollmentValue = user.matricula;
        else if (user.enrollmentNumber) enrollmentValue = user.enrollmentNumber;
        else if (user.enrollment) {
          enrollmentValue = typeof user.enrollment === 'string' ? user.enrollment : user.enrollment.id;
        }

        // Lógica de fallback robusta para Turma
        // Baseado no Swagger, o campo esperado é "class" (string)
        let classValue = 'Sem Turma';

        if (user.class) {
          // Se vier como string direta
          if (typeof user.class === 'string') classValue = user.class;
          // Se vier como objeto
          else if (typeof user.class === 'object' && user.class.name) classValue = user.class.name;
        }
        // Caso venha aninhado em enrollment
        else if (user.enrollment && user.enrollment.class) {
          classValue = user.enrollment.class.name || user.enrollment.class;
        }

        return {
          id: user.id,
          name: user.name || 'Sem Nome',
          email: user.email || 'sem@email.com',
          phone: user.phone || '',
          status: user.status || 'active',
          role: user.role || 'student',

          // Mapeamos para as propriedades que o frontend espera
          matricula: enrollmentValue,
          enrollment: enrollmentValue, // Redundância para garantir compatibilidade
          class: classValue, // Aqui garantimos que a string da turma vá para o campo certo

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
      // Tenta buscar apenas professores, mas filtra no front por segurança
      const response = await api.get('/users');

      let data = response.data;
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }

      if (!Array.isArray(data)) {
        return [];
      }

      return data.filter((user: any) =>
        user.role === 'teacher' || user.role === 'professor'
      );
    } catch (error: any) {
      console.error("studentsService: Erro ao buscar professores", error);
      return [];
    }
  },

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
  },

  getAllByRole: async (role: string): Promise<User[]> => {
    try {
      const response = await api.get('/users', {
        params: { role }
      });

      let data = response.data;
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }

      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error(`studentsService: Erro ao buscar usuários por role ${role}`, error);
      throw error;
    }
  }
};