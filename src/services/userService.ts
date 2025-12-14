import { api } from '../lib/api';
// Assumindo que você tem os tipos definidos em um arquivo 'userTypes.ts'
// Ex: interface User { ... }
// Ex: interface CreateUserDto { ... }
// Ex: interface LoginRequest { ... }

export const userService = {
    // Ação 1: Autenticar e Obter Token (POST /auth/login) [cite: 11, 12]
    login: async (credentials: any) => { // Usar LoginRequest Dto
        const response = await api.post('/auth/login', credentials);
        // Salvar token no localStorage/cookies, etc.
        return response.data; // Retorna AuthResponseDto
    },

    // Ação 2: Fazer Logout (POST /auth/logout) [cite: 13, 14]
    logout: async () => {
        // Enviar requisição e limpar o token localmente
        return await api.post('/auth/logout');
    },

    // Ação 3: Listar Usuários com Filtros (GET /users) [cite: 20, 21]
    listUsers: async (params?: { page: number, limit: number, name?: string, profile?: string }) => {
        // Implementa a datatable complexa
        const response = await api.get('/users', { params });
        return response.data;
    },

    // Ação 4: Criar Novo Usuário (POST /users) [cite: 18, 19]
    createUser: async (data: any) => { // Usar CreateUserDto
        const response = await api.post('/users', data);
        return response.data;
    },

    // Ação 5: Atualizar um Usuário (PATCH /users/{id}) [cite: 31, 32]
    updateUser: async (id: string, data: any) => { // Usar UpdateUserDto
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },
    
    // Ação 6: Remover um Usuário (DELETE /users/{id}) [cite: 37]
    deleteUser: async (id: string) => {
        return await api.delete(`/users/${id}`);
    },

    // Ação 7: Alterar Minha Senha (PATCH /users/me/password) [cite: 26, 27]
    changeMyPassword: async (data: any) => { // Usar ChangePasswordDto
        return await api.patch('/users/me/password', data);
    }
};