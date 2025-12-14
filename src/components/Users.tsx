import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Filter, Search, Mail, Shield, Eye,
  Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { usersService, type User } from '../services/usersService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, [page, limit, searchTerm, selectedRole, selectedStatus]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search: searchTerm || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined
      };
      
      const response = await usersService.getUsers(params);
      setUsers(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-emerald-100 text-emerald-800';
      case 'parent': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'teacher': return 'Professor';
      case 'student': return 'Aluno';
      case 'parent': return 'Responsável';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Usuário',
      render: (value: string, row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {value?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.email}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Perfil',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-400" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(value)}`}>
            {getRoleText(value)}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Cadastrado em',
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })
    }
  ];

  const actions = [
    {
      label: 'Visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: User) => console.log('Visualizar:', row),
      variant: 'default' as const
    },
    {
      label: 'Editar',
      icon: <Edit className="w-4 h-4" />,
      onClick: (row: User) => console.log('Editar:', row),
      variant: 'default' as const
    },
    {
      label: row => row.status === 'active' ? 'Desativar' : 'Ativar',
      icon: row => row.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />,
      onClick: (row: User) => {
        const newStatus = row.status === 'active' ? 'inactive' : 'active';
        usersService.updateUser(row.id, { status: newStatus }).then(loadUsers);
      },
      variant: 'default' as const
    },
    {
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: User) => console.log('Excluir:', row),
      variant: 'danger' as const
    }
  ];

  const roleFilters = [
    { value: '', label: 'Todos' },
    { value: 'admin', label: 'Administradores' },
    { value: 'teacher', label: 'Professores' },
    { value: 'student', label: 'Alunos' },
    { value: 'parent', label: 'Responsáveis' }
  ];

  const statusFilters = [
    { value: '', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' },
    { value: 'pending', label: 'Pendentes' }
  ];

  const userStats = [
    { role: 'admin', count: users.filter(u => u.role === 'admin').length, color: 'from-purple-500 to-pink-400' },
    { role: 'teacher', count: users.filter(u => u.role === 'teacher').length, color: 'from-blue-500 to-cyan-400' },
    { role: 'student', count: users.filter(u => u.role === 'student').length, color: 'from-emerald-500 to-teal-400' },
    { role: 'parent', count: users.filter(u => u.role === 'parent').length, color: 'from-amber-500 to-yellow-400' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-1">Controle de perfis e permissões do sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Filter}
          >
            Filtros Avançados
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => console.log('Novo usuário')}
          >
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Estatísticas por Perfil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userStats.map((stat, index) => (
          <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl shadow-indigo-100/20">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <UsersIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                {((stat.count / totalItems) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              {getRoleText(stat.role)}s
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.count}</h3>
          </div>
        ))}
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuários por nome ou email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filtrar por Perfil
            </label>
            <div className="flex flex-wrap gap-2">
              {roleFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedRole(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === filter.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filtrar por Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === filter.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <DataTable
        columns={columns}
        data={users}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
        onSearch={handleSearch}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="Nenhum usuário encontrado"
      />
    </div>
  );
}