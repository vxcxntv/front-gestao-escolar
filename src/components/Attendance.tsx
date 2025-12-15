import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Calendar as CalendarIcon, 
  Loader2, Search, Edit2, Trash2, X, AlertCircle, Plus, Download, Filter 
} from 'lucide-react';
import { attendanceService, Attendance, AttendanceStatus } from '../services/attendanceService';
import { classesService } from '../services/classesService';
import { format, parseISO } from 'date-fns';

// Interface alinhada com o Backend (UUIDs)
interface FormDataState {
  studentId: string;    // Backend exige UUID
  classId: string;      // Backend exige UUID
  subjectId: string;    // Backend exige UUID
  date: string;
  status: AttendanceStatus;
  notes: string;
}

export function AttendancePage() {
  // --- Estados ---
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  // Estados de Interface
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState<FormDataState>({
    studentId: '',
    classId: '',          
    subjectId: '', 
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'present',
    notes: ''
  });

  // --- Carregamento ---
  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadAttendances();
  }, [selectedClass, selectedDate, statusFilter]);

  const loadClasses = async () => {
    try {
      const response = await classesService.getClasses(); 
      // Assume que a resposta traz um array de objetos com { id, name }
      setClasses(Array.isArray(response) ? response : (response as any).data || []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    }
  };

  const loadAttendances = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        classId: selectedClass || undefined, 
        date: selectedDate || undefined,
      };
      
      const data = await attendanceService.getAll(params);
      let loadedData = Array.isArray(data) ? data : (data as any).data || [];

      if (statusFilter !== 'all') {
        loadedData = loadedData.filter((a: any) => a.status === statusFilter);
      }

      setAttendances(loadedData);
    } catch (error) {
      console.error('Erro ao buscar frequências:', error);
      setAttendances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendances = attendances.filter(item => 
    (item.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // --- Helpers Visuais ---
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'present': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Presente' };
      case 'absent': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Faltou' };
      case 'late': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', text: 'Atrasado' };
      case 'excused': return { icon: CalendarIcon, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Justificado' };
      default: return { icon: CheckCircle, color: 'text-slate-600', bg: 'bg-slate-100', text: status };
    }
  };
  
  const getStatusText = (status: string) => getStatusConfig(status).text;

  const handleExport = () => {
    const header = ["Aluno", "Turma", "Data", "Status", "Observações"];
    let csvContent = header.join(",") + "\n";
    if (filteredAttendances.length > 0) {
      const rows = filteredAttendances.map(a => [
        `"${a.studentName}"`, `"${a.className || '-'}"`, 
        format(parseISO(a.date), 'dd/MM/yyyy'), getStatusText(a.status), `"${a.notes || ''}"`
      ]);
      csvContent += rows.map(row => row.join(",")).join("\n");
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'frequencia.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- AÇÃO DE SALVAR ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // 1. Validação Simples
      if (!formData.classId) throw new Error("Selecione uma Turma.");
      if (!formData.subjectId) throw new Error("O ID da Disciplina (UUID) é obrigatório.");
      if (!formData.studentId) throw new Error("O ID do Aluno (UUID) é obrigatório.");

      // 2. Montagem do Payload (Exatamente como o backend pediu no erro)
      const payload = {
        classId: formData.classId, 
        subjectId: formData.subjectId,
        date: formData.date,
        presences: [
          {
            studentId: formData.studentId, 
            status: formData.status
            // Nota: 'notes' removido daqui conforme o erro anterior do backend
          }
        ]
      };

      console.log("Enviando Payload:", payload);

      if (editingId) {
        // Update
        const updatePayload = {
            status: formData.status,
            notes: formData.notes
        };
        await attendanceService.update(editingId.toString(), updatePayload);
      } else {
        // Create
        await attendanceService.create(payload as any);
      }
      
      setShowModal(false);
      loadAttendances();
      alert("Sucesso! Registro salvo.");

    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) {
         alert(`Erros:\n- ${msg.join('\n- ')}`);
      } else {
         alert(`Erro: ${msg || error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Excluir este registro?")) return;
    try {
      await attendanceService.delete(id);
      setAttendances(prev => prev.filter(a => a.id !== id));
    } catch (error: any) {
      alert("Erro ao excluir. Verifique suas permissões.");
    }
  };

  const openModal = (attendance?: Attendance) => {
    if (attendance) {
      setEditingId(Number(attendance.id));
      setFormData({
        studentId: attendance.studentId || '', 
        classId: attendance.classId, 
        subjectId: '', 
        date: attendance.date.split('T')[0],
        status: attendance.status,
        notes: attendance.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        studentId: '',
        classId: selectedClass || '', 
        subjectId: '',
        date: selectedDate || format(new Date(), 'yyyy-MM-dd'),
        status: 'present',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const stats = {
    total: filteredAttendances.length,
    present: filteredAttendances.filter(a => a.status === 'present').length,
    absent: filteredAttendances.filter(a => a.status === 'absent').length,
    late: filteredAttendances.filter(a => a.status === 'late').length
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Controle de Frequência</h1>
          <p className="text-slate-500 mt-1">Gerencie presenças e faltas</p>
        </div>
        <button onClick={() => openModal()} className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg font-medium">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> <span>Registrar</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-400' },
          { label: 'Presenças', value: stats.present, color: 'from-emerald-500 to-teal-400' },
          { label: 'Faltas', value: stats.absent, color: 'from-red-500 to-pink-400' },
          { label: 'Atrasos', value: stats.late, color: 'from-amber-500 to-yellow-400' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg shadow-indigo-100/10">
            <p className="text-slate-500 text-xs font-medium uppercase mb-1">{stat.label}</p>
            <div className="flex items-end justify-between"><h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3></div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-5 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Buscar Aluno</label><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" /><input type="text" placeholder="Nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" /></div></div>
          <div>
              <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Filtrar Turma</label>
              <select className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                  <option value="">Todas</option>
                  {classes.map((cls) => (
                    // Mostra o NOME, mas o valor é o ID (que o backend precisa)
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
              </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Filtrar Data</label><input type="date" className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></div>
          
          <div>
            <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select className="w-full pl-9 pr-4 py-2 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Todos</option>
                <option value="present">Presentes</option>
                <option value="absent">Faltas</option>
                <option value="late">Atrasos</option>
              </select>
            </div>
          </div>

        </div>
        <div className="flex gap-2"><button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-medium flex items-center gap-2"><Download className="w-4 h-4" /> Exportar</button></div>
      </div>

      {/* Tabela */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
        ) : filteredAttendances.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center"><AlertCircle className="w-10 h-10 mb-2 opacity-50" /><p>Nenhum registro encontrado.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left">
                <tr><th className="px-6 py-4">Aluno</th><th className="px-6 py-4">Data</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Observações</th><th className="px-6 py-4 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredAttendances.map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4"><span className="font-semibold text-slate-800">{item.studentName || item.studentId}</span><br/><span className="text-xs text-slate-500">{item.className}</span></td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{format(parseISO(item.date), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4"><div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>{statusConfig.text}</div></td>
                      <td className="px-6 py-4 text-slate-500 text-sm truncate max-w-[200px]">{item.notes || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar' : 'Registrar'} Frequência</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Turma e Matéria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Turma *</label>
                    <select 
                      required 
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white" 
                      value={formData.classId} 
                      onChange={e => setFormData({ ...formData, classId: e.target.value })}
                      disabled={!!editingId} 
                    >
                    <option value="">Selecione a Turma...</option>
                    {/* AQUI ESTÁ A MUDANÇA: Exibe o nome (cls.name), mas usa o ID no value */}
                    {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID da Disciplina (UUID) *</label>
                    <input 
                      required 
                      placeholder="Cole o UUID da disciplina"
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none font-mono" 
                      value={formData.subjectId} 
                      onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                      disabled={!!editingId} 
                    />
                </div>
              </div>

              {/* Aluno - UUID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID do Aluno (UUID) *</label>
                <input 
                  required 
                  placeholder="Cole o UUID do aluno"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none font-mono text-slate-600" 
                  value={formData.studentId} 
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })} 
                  disabled={!!editingId} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Data</label><input type="date" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as AttendanceStatus })}>
                    <option value="present">Presente</option><option value="absent">Faltou</option><option value="late">Atrasado</option><option value="excused">Justificado</option>
                  </select>
                </div>
              </div>

              <div><label className="block text-sm font-medium text-slate-700 mb-1">Observações</label><textarea className="w-full border border-slate-200 p-2.5 rounded-xl text-sm resize-none h-24" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-70">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}