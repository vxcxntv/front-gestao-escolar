import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Filter,
  Plus, Download, Calendar as CalendarIcon, Save, X, Search, SlidersHorizontal, Loader2
} from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { attendanceService, type Attendance } from '../services/attendanceService';
import { classesService } from '../services/classesService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AttendancePage() {
  // --- ESTADOS ---
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado de salvamento
  
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<string>('all'); 

  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    classId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'present',
    notes: ''
  });

  useEffect(() => {
    loadClasses();
    loadAttendances();
  }, [page, limit, selectedClass, selectedDate, searchTerm, statusFilter]);

  const loadClasses = async () => {
    try {
      const response = await classesService.getClasses({ page: 1, limit: 100 });
      setClasses(Array.isArray(response) ? response : (response as any).data || []);
    } catch (error) {
      console.error('Erro turmas:', error);
      setClasses([]);
    }
  };

  const loadAttendances = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page, limit, 
        classId: selectedClass || undefined,
        date: selectedDate || undefined,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const response = await attendanceService.getAttendances(params);
      let data = response.data || [];
      if (statusFilter !== 'all') {
         data = data.filter((item: Attendance) => item.status === statusFilter);
      }
      setAttendances(data);
      setTotalItems(response.total || data.length);
    } catch (error) {
      console.error('Erro frequencias:', error);
      setAttendances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => { setSearchTerm(value); setPage(1); };

  const handleExport = () => {
    const header = ["Aluno", "Turma", "Data", "Status", "Observações"];
    let csvContent = header.join(",") + "\n";
    if (attendances && attendances.length > 0) {
        const rows = attendances.map(a => [
            `"${a.studentName}"`, `"${a.className || '-'}"`, format(parseISO(a.date), 'dd/MM/yyyy'), getStatusText(a.status), `"${a.notes || ''}"`
        ]);
        csvContent += rows.map(row => row.join(",")).join("\n");
    }
    try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `frequencia_${format(new Date(), 'dd-MM-yyyy')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) { alert("Erro ao baixar."); }
  };

  // --- SALVAR (CreateAttendanceDto) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
        // Payload compatível com CreateAttendanceDto
        const payload = {
            studentName: formData.studentName,
            date: formData.date,
            status: formData.status,
            notes: formData.notes,
            classId: selectedClass || undefined // Envia undefined se vazio, conforme DTO
        };

        await (attendanceService as any).create(payload);

        alert(`Frequência registrada com sucesso!`);
        setShowModal(false);
        setFormData({ ...formData, studentName: '', notes: '' });
        loadAttendances();

    } catch (error) {
        console.error("Erro ao salvar presença:", error);
        alert("Erro ao salvar. Verifique o console.");
    } finally {
        setIsSaving(false);
    }
  };

  const applyFilters = () => { setShowFilterModal(false); setPage(1); loadAttendances(); };
  const getStatusIcon = (status: string) => { switch (status) { case 'present': return <CheckCircle className="w-5 h-5 text-green-500" />; case 'absent': return <XCircle className="w-5 h-5 text-red-500" />; case 'late': return <Clock className="w-5 h-5 text-amber-500" />; case 'excused': return <CalendarIcon className="w-5 h-5 text-blue-500" />; default: return null; } };
  const getStatusText = (status: string) => { switch (status) { case 'present': return 'Presente'; case 'absent': return 'Faltou'; case 'late': return 'Atrasado'; case 'excused': return 'Justificado'; default: return status; } };

  const columns = [
    { key: 'studentName', header: 'Aluno', render: (value: string, row: Attendance) => <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><span className="text-sm font-medium text-indigo-600">{value?.charAt(0).toUpperCase()}</span></div><div><p className="font-medium text-slate-800">{value}</p><p className="text-xs text-slate-500">ID: {row.studentId}</p></div></div> },
    { key: 'className', header: 'Turma' },
    { key: 'date', header: 'Data', render: (v: string) => format(parseISO(v), 'dd/MM/yyyy', { locale: ptBR }) },
    { key: 'status', header: 'Status', render: (value: string) => <div className="flex items-center gap-2">{getStatusIcon(value)}<span className={`px-2 py-1 rounded-full text-xs font-medium ${value==='present'?'bg-green-100 text-green-800':''} ${value==='absent'?'bg-red-100 text-red-800':''} ${value==='late'?'bg-amber-100 text-amber-800':''} ${value==='excused'?'bg-blue-100 text-blue-800':''}`}>{getStatusText(value)}</span></div> },
    { key: 'notes', header: 'Observações', render: (v: string) => v || '-' }
  ];
  const actions = [ { label: 'Editar', icon: <CalendarIcon className="w-4 h-4" />, onClick: () => {}, variant: 'default' as const }, { label: 'Excluir', icon: <XCircle className="w-4 h-4" />, onClick: () => {}, variant: 'danger' as const } ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
        <div><h1 className="text-3xl font-bold text-slate-800 tracking-tight">Controle de Frequência</h1><p className="text-slate-500 mt-1">Registro e consulta de presenças e faltas</p></div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className="cursor-pointer relative z-20 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 font-medium group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /><span>Registrar Frequência</span>
          </button>
        </div>
      </div>

      {/* Card de Filtros Superiores */}
      <div className="relative z-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full"><label className="block text-sm font-medium text-slate-700 mb-2">Turma</label><select className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 cursor-pointer" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}><option value="">Todas as turmas</option>{classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}</select></div>
              <div className="flex-1 w-full"><label className="block text-sm font-medium text-slate-700 mb-2">Data</label><input type="date" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 cursor-pointer" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></div>
              <div><button className="h-[42px] px-6 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors cursor-pointer" onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}>Hoje</button></div>
            </div>
          </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[ { label: 'Total de Registros', value: totalItems.toString(), color: 'from-blue-500 to-cyan-400' }, { label: 'Presença (Média)', value: '85%', color: 'from-emerald-500 to-teal-400' }, { label: 'Faltas', value: '10%', color: 'from-red-500 to-pink-400' }, { label: 'Atrasos', value: '5%', color: 'from-amber-500 to-yellow-400' } ].map((stat, index) => (<div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl shadow-indigo-100/20"><p className="text-slate-500 text-sm font-medium mb-2">{stat.label}</p><div className="flex items-end justify-between"><h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} opacity-20`} /></div></div>))}
      </div>

      {/* Barra de Ação Inferior */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 transition-all" /></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilterModal(true)} className={`px-4 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer ${statusFilter !== 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'}`}><Filter className="w-4 h-4" />{statusFilter !== 'all' ? 'Filtro Ativo' : 'Filtros'}</button>
            <button onClick={handleExport} className="px-4 py-2 border border-slate-300 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"><Download className="w-4 h-4" />Exportar</button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="relative z-0">
        <DataTable columns={columns} data={attendances} totalItems={totalItems} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} onSearch={handleSearch} actions={actions} isLoading={isLoading} />
      </div>

      {/* MODAL REGISTRO */}
      {showModal && (
         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
             <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 scale-100">
                <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between shadow-md"><h2 className="text-white font-bold text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-indigo-200" /> Registrar Frequência</h2><button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-1 rounded-full"><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do Aluno</label><input type="text" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Data</label><input type="date" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label><select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="present">Presente</option><option value="absent">Faltou</option><option value="late">Atrasado</option><option value="excused">Justificado</option></select></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Observações</label><textarea className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none h-20 outline-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
             </div>
         </div>
      )}

      {/* Modal Filtros */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFilterModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 scale-100">
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100"><h2 className="text-slate-800 font-bold text-lg flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-indigo-600" /> Filtrar por Status</h2><button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"><input type="radio" name="status" checked={statusFilter === 'all'} onChange={() => setStatusFilter('all')} className="w-4 h-4 text-indigo-600" /><span className="text-slate-700">Todos</span></label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-green-50 hover:border-green-100 cursor-pointer transition-colors"><input type="radio" name="status" checked={statusFilter === 'present'} onChange={() => setStatusFilter('present')} className="w-4 h-4 text-green-600" /><span className="text-slate-700">Apenas Presentes</span></label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-red-50 hover:border-red-100 cursor-pointer transition-colors"><input type="radio" name="status" checked={statusFilter === 'absent'} onChange={() => setStatusFilter('absent')} className="w-4 h-4 text-red-600" /><span className="text-slate-700">Apenas Faltas</span></label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-amber-50 hover:border-amber-100 cursor-pointer transition-colors"><input type="radio" name="status" checked={statusFilter === 'late'} onChange={() => setStatusFilter('late')} className="w-4 h-4 text-amber-600" /><span className="text-slate-700">Apenas Atrasos</span></label>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100"><button onClick={() => setShowFilterModal(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button><button onClick={applyFilters} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Aplicar Filtros</button></div>
          </div>
        </div>
      )}
    </div>
  );
}