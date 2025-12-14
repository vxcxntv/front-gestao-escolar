import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Filter,
  Plus, Download, Calendar as CalendarIcon } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { attendanceService, type Attendance } from '../services/attendanceService';
import { classesService } from '../services/classesService';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadClasses();
    loadAttendances();
  }, [page, limit, selectedClass, selectedDate]);

  const loadClasses = async () => {
    try {
      const response = await classesService.getClasses({ page: 1, limit: 100 });
      setClasses(response.data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const loadAttendances = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
        classId: selectedClass || undefined,
        date: selectedDate || undefined
      };
      
      const response = await attendanceService.getAttendances(params);
      setAttendances(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Erro ao carregar frequências:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    // Lógica para marcação em lote
    console.log('Marcar frequência em lote');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'excused':
        return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Faltou';
      case 'late': return 'Atrasado';
      case 'excused': return 'Justificado';
      default: return status;
    }
  };

  const columns = [
    {
      key: 'studentName',
      header: 'Aluno',
      render: (value: string, row: Attendance) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-600">
              {value?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">ID: {row.studentId}</p>
          </div>
        </div>
      )
    },
    {
      key: 'className',
      header: 'Turma'
    },
    {
      key: 'date',
      header: 'Data',
      render: (value: string) => format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR })
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${value === 'present' ? 'bg-green-100 text-green-800' : ''}
            ${value === 'absent' ? 'bg-red-100 text-red-800' : ''}
            ${value === 'late' ? 'bg-amber-100 text-amber-800' : ''}
            ${value === 'excused' ? 'bg-blue-100 text-blue-800' : ''}
          `}>
            {getStatusText(value)}
          </span>
        </div>
      )
    },
    {
      key: 'notes',
      header: 'Observações',
      render: (value: string) => value || '-'
    }
  ];

  const actions = [
    {
      label: 'Editar',
      icon: <Calendar className="w-4 h-4" />,
      onClick: (row: Attendance) => console.log('Editar:', row),
      variant: 'default' as const
    },
    {
      label: 'Excluir',
      icon: <XCircle className="w-4 h-4" />,
      onClick: (row: Attendance) => console.log('Excluir:', row),
      variant: 'danger' as const
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Controle de Frequência</h1>
          <p className="text-slate-500 mt-1">Registro e consulta de presenças e faltas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Download}
          >
            Exportar
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleMarkAttendance}
          >
            Registrar Frequência
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Turma
            </label>
            <select
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Todas as turmas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.grade}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Data
            </label>
            <input
              type="date"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Período
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const start = format(startOfWeek(new Date(), { locale: ptBR }), 'yyyy-MM-dd');
                  const end = format(endOfWeek(new Date(), { locale: ptBR }), 'yyyy-MM-dd');
                  console.log('Semana:', start, end);
                }}
              >
                Esta Semana
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const today = format(new Date(), 'yyyy-MM-dd');
                  setSelectedDate(today);
                }}
              >
                Hoje
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Registros', value: totalItems.toString(), color: 'from-blue-500 to-cyan-400' },
          { label: 'Presentes', value: '85%', color: 'from-emerald-500 to-teal-400' },
          { label: 'Faltas', value: '10%', color: 'from-red-500 to-pink-400' },
          { label: 'Atrasos', value: '5%', color: 'from-amber-500 to-yellow-400' }
        ].map((stat, index) => (
          <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl shadow-indigo-100/20">
            <p className="text-slate-500 text-sm font-medium mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={attendances}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
        onSearch={(search) => console.log('Search:', search)}
        actions={actions}
        isLoading={isLoading}
      />
    </div>
  );
}