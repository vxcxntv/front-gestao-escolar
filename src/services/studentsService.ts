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

export const studentsService = {
  getAll: async () => {
    try {
      const response = await api.get('/users', { 
        params: { role: 'student' } 
      });
      
      // Verifica se veio paginado ({ data: [], total: ... }) ou array direto
      const rawUsers = response.data.data || response.data; 

      if (!Array.isArray(rawUsers)) {
        console.warn("studentsService: Dados inválidos recebidos", rawUsers);
        return [];
      }

      return rawUsers.map((user: any) => {
        // Lógica de segurança para extrair matrícula e turma
        let enrollmentValue = 'Pendente';
        let className = 'Sem Turma';

        // Tenta extrair matrícula (pode ser string ou objeto dependendo do backend)
        // Prioriza a coluna 'matricula' se existir (conforme seu backend), senão 'enrollment'
        const rawEnrollment = user.matricula || user.enrollment;

        if (rawEnrollment) {
            if (typeof rawEnrollment === 'string') {
                enrollmentValue = rawEnrollment;
            } else if (typeof rawEnrollment === 'object') {
                enrollmentValue = rawEnrollment.id || 'Pendente';
                // Tenta pegar a turma dentro do objeto de relacionamento
                if (rawEnrollment.class && rawEnrollment.class.name) {
                    className = rawEnrollment.class.name;
                }
            }
        }

        // Se a turma não veio pelo enrollment, tenta ver se veio direto
        if (className === 'Sem Turma' && user.class) {
             className = typeof user.class === 'string' ? user.class : (user.class.name || 'Sem Turma');
        }

        return {
          id: user.id,
          name: user.name || 'Sem Nome',
          email: user.email || 'sem@email.com',
          phone: user.phone || '',
          status: user.status || 'active',
          role: user.role || 'student',
          enrollment: enrollmentValue,
          class: className,
          // Garante que grades seja sempre um array, mesmo que venha null
          grades: Array.isArray(user.grades) ? user.grades : [] 
        };
      });
    } catch (error) {
      console.error("studentsService: Erro ao buscar alunos", error);
      throw error;
    }
  },
  
  create: async (data: CreateStudentDto) => {
      // Backend exige senha. Usamos uma padrão se não fornecida.
      // Mapeia 'enrollment' do front para 'matricula' do back se necessário
      const payload = { 
        ...data, 
        matricula: data.enrollment, // Envia como matricula para o back
        password: data.password || 'Mudar@123', 
        role: 'student' 
      };
      const response = await api.post('/users', payload);
      return response.data;
  },

  update: async (id: string, data: UpdateStudentDto) => {
      const payload = {
        ...data,
        matricula: data.enrollment
      };
      const response = await api.patch(`/users/${id}`, payload);
      return response.data;
  },

  delete: async (id: string) => {
      await api.delete(`/users/${id}`);
  }
};