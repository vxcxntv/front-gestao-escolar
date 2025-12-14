import { useState, useEffect } from 'react';
import { BookOpen, Plus, Filter, Users, Clock, Edit, Trash2, Eye,
  GraduationCap, Search } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { subjectsService, type Subject } from '../services/subjectsService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubjects();
  }, [page, limit, searchTerm]);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search: searchTerm || undefined
      };
      
      const response = await subjectsService.getSubjects(params);
      setSubjects(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  const columns = [
    {
      key: 'name',
      header: 'Disciplina',
      render: (value: string, row: Subject) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-500">Código: {row.code}</p>
          </div>
        </div>
      )
    },
    {
      key: 'code',
      header: 'Código'
    },
    {
      key: 'credits',
      header: 'Créditos',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="font-medium">{value} horas</span>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (value: string) => (
        <p className="text-sm text-slate-600 max-w-xs truncate">
          {value || 'Sem descrição'}
        </p>
      )
    }
  ];

  const actions = [
    {
      label: 'Visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: Subject) => console.log('Visualizar:', row),
      variant: 'default' as const
    },
    {
      label: 'Editar',
      icon: <Edit className="w-4 h-4" />,
      onClick: (row: Subject) => console.log('Editar:', row),
      variant: 'default' as const
    },
    {
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Subject) => console.log('Excluir:', row),
      variant: 'danger' as const
    }
  ];

  const stats = [
    { label: 'Total de Disciplinas', value: totalItems.toString(), color: 'from-blue-500 to-cyan-400' },
    { label: 'Média de Créditos', value: '4.2', color: 'from-emerald-500 to-teal-400' },
    { label: 'Ativas Este Semestre', value: '24', color: 'from-purple-500 to-pink-400' },
    { label: 'Com Professores', value: '22', color: 'from-amber-500 to-yellow-400' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Disciplinas</h1>
          <p className="text-slate-500 mt-1">Gestão do currículo e grade curricular</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Filter}
          >
            Filtros
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => console.log('Nova disciplina')}
          >
            Nova Disciplina
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl shadow-indigo-100/20">
            <p className="text-slate-500 text-sm font-medium mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar disciplinas por nome ou código..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Importar disciplinas')}
            >
              Importar CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Exportar grade')}
            >
              Exportar Grade
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela de Disciplinas */}
      <DataTable
        columns={columns}
        data={subjects}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
        onSearch={handleSearch}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="Nenhuma disciplina encontrada"
      />

      {/* Grade Curricular Preview */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          Grade Curricular - 2024
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { period: '1º Período', subjects: 6, credits: 24, color: 'from-blue-500 to-cyan-400' },
            { period: '2º Período', subjects: 7, credits: 28, color: 'from-emerald-500 to-teal-400' },
            { period: '3º Período', subjects: 6, credits: 24, color: 'from-purple-500 to-pink-400' },
            { period: '4º Período', subjects: 7, credits: 28, color: 'from-amber-500 to-yellow-400' },
            { period: '5º Período', subjects: 6, credits: 24, color: 'from-red-500 to-pink-400' },
            { period: '6º Período', subjects: 5, credits: 20, color: 'from-indigo-500 to-purple-400' }
          ].map((semester, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600">{semester.period}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-br ${semester.color} text-white`}>
                  {semester.subjects} disciplinas
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total de Créditos:</span>
                  <span className="font-bold text-slate-800">{semester.credits}h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Ativo
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4"
                onClick={() => console.log('Ver grade', semester.period)}
              >
                Ver Grade Completa
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}