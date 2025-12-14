import { useState, useEffect } from 'react';
import {
  Users as UsersIcon, Plus, Search, Edit2, Trash2,
  Mail, Shield, Loader2, AlertCircle, GraduationCap
} from 'lucide-react';
import { usersService } from '../services/usersService';
import { User } from '../types/index';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function UsersPage() {
  // Estados de Dados e UI
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [errorInfo, setErrorInfo] = useState<{ type: 'none' | 'auth' | 'connection', message: string }>({
    type: 'none',
    message: ''
  });

  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Data (Sem status)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: ''
  });

  // --- CARREGAMENTO DE DADOS ---
  const loadUsers = async () => {
    setIsLoading(true);
    setErrorInfo({ type: 'none', message: '' });

    try {
      const data = await usersService.getUsers({ limit: 100 });
      setUsers(data);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);

      let type: 'auth' | 'connection' = 'connection';
      let msg = 'Não foi possível carregar a lista de usuários.';

      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          type = 'auth';
          msg = 'Sessão expirada ou sem permissão.';
        } else {
          msg = `Erro do servidor: ${error.response.status}`;
        }
      } else if (error.message) {
        msg = error.message;
      }

      setErrorInfo({ type, message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtro Local
  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Estatísticas (Atualizadas: Removemos "Ativos" e colocamos "Alunos")
  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    admins: users.filter(u => u.role === 'admin').length,
    teachers: users.filter(u => u.role === 'teacher').length
  };

  // --- HANDLERS ---

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      role: 'student',
      password: ''
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) return;

    try {
      await usersService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      alert('Usuário removido com sucesso.');
    } catch (error) {
      alert('Erro ao excluir usuário. Verifique se ele possui vínculos (turmas/notas).');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role as any
      };

      if (!editingId || formData.password) {
        payload.password = formData.password;
      }

      if (editingId) {
        await usersService.updateUser(editingId, payload);
        alert('Usuário atualizado com sucesso!');
      } else {
        await usersService.createUser(payload);
        alert('Usuário criado com sucesso!');
      }

      setShowModal(false);
      loadUsers();
    } catch (error: any) {
      console.error(error);
      alert('Erro ao salvar: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Helpers de UI
  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      teacher: 'bg-blue-100 text-blue-700 border-blue-200',
      student: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      parent: 'bg-amber-100 text-amber-700 border-amber-200',
      guardian: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    const labels: Record<string, string> = {
      admin: 'Admin',
      teacher: 'Professor',
      student: 'Aluno',
      parent: 'Responsável',
      guardian: 'Responsável'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || 'bg-slate-100 text-slate-600'}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-1">Controle de acesso e perfis do sistema</p>
        </div>
        <button
          onClick={handleAddNew}
          className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuários', value: stats.total, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Alunos', value: stats.students, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Administradores', value: stats.admins, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Professores', value: stats.teachers, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg shadow-indigo-100/10">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Alertas de Erro */}
      {errorInfo.type !== 'none' && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 backdrop-blur-md shadow-sm ${errorInfo.type === 'auth' ? 'bg-amber-50/80 border-amber-200 text-amber-800' : 'bg-red-50/80 border-red-200 text-red-800'
          }`}>
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">{errorInfo.type === 'auth' ? 'Acesso Negado' : 'Erro ao carregar'}</h4>
            <p className="text-sm opacity-90 mt-1">
              {errorInfo.message}
            </p>
          </div>
        </div>
      )}

      {/* Tabela Principal */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/10 overflow-hidden flex flex-col">
        {/* Barra de Busca */}
        <div className="p-6 border-b border-slate-100/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 flex justify-center items-center flex-col gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <span className="text-slate-500 font-medium">Carregando usuários...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold tracking-wider text-left">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Cadastro</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white">
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-6 text-slate-800">
              {editingId ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Completo</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ana Souza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Perfil</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                  <option value="admin">Administrador</option>
                  <option value="guardian">Responsável</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Senha {editingId && <span className="text-slate-400 font-normal">(Deixe em branco para manter)</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? "********" : "Crie uma senha segura"}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}