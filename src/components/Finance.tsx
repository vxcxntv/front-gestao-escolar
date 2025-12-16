import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Loader2, DollarSign, 
  CheckCircle, Clock, AlertCircle, Filter, Download, 
  Users, Layers 
} from 'lucide-react';
import { financeService, Invoice, FinancialReport } from '../services/financeService';
import { classesService } from '../services/classesService';
import { studentsService } from '../services/studentsService';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Finance() {
  // --- ESTADOS VISUAIS ---
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filtros da Tabela
  const [selectedStatus, setSelectedStatus] = useState<string>(''); 
  const [filterClassId, setFilterClassId] = useState<string>(''); // <--- NOVO FILTRO DE TURMA

  // --- DADOS DA API ---
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);

  // --- LISTAS AUXILIARES ---
  const [classesList, setClassesList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  // --- CONTROLES DO MODAL ---
  const [creationMode, setCreationMode] = useState<'single' | 'batch'>('single');
  const [modalClassId, setModalClassId] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    studentNameDisplay: '',
    description: '',
    amount: '',
    dueDate: '',
  });

  // --- LÓGICA DE VENCIMENTO ---
  const isOverdue = (invoice: Invoice) => {
    if (invoice.status !== 'pending') return false;
    const due = parseISO(invoice.dueDate);
    const today = startOfDay(new Date()); 
    return isBefore(due, today);
  };

  const getDisplayStatus = (invoice: Invoice) => {
    if (invoice.status === 'canceled') return 'canceled';
    if (invoice.status === 'paid') return 'paid';
    if (isOverdue(invoice)) return 'overdue';
    return 'pending';
  };

  // --- CARREGAMENTO ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Busca todas as faturas (filtro é feito no front)
      const invoiceData = await financeService.getAll();
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);

      // Relatório
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      try {
        const reportData = await financeService.getRevenueReport(
          format(firstDay, 'yyyy-MM-dd'),
          format(lastDay, 'yyyy-MM-dd')
        );
        setFinancialData(reportData);
      } catch (e) { console.warn("Relatório indisponível"); }

      // Carrega listas para filtros e modal
      if (classesList.length === 0) {
        const [classesData, studentsData] = await Promise.all([
          classesService.getClasses({ limit: 100 }),
          studentsService.getAll()
        ]);
        setClassesList(classesData || []);
        setStudentsList(studentsData || []);
      }

    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTRAGEM AVANÇADA (Status + Busca + Turma) ---
  const filteredInvoices = invoices.filter(inv => {
    // 1. Filtro de Texto
    const matchesSearch = (inv.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (inv.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // 2. Filtro de Status
    const displayStatus = getDisplayStatus(inv);
    const matchesStatus = selectedStatus ? displayStatus === selectedStatus : true;

    // 3. Filtro de Turma (NOVO)
    let matchesClass = true;
    if (filterClassId) {
        // Encontra a turma selecionada na lista de turmas
        const selectedClassObj = classesList.find(c => c.id === filterClassId);
        // Encontra o aluno dono desta fatura na lista de alunos
        const studentObj = studentsList.find(s => s.id === inv.studentId);
        
        // Verifica se o aluno existe e se a turma dele bate com a selecionada
        if (selectedClassObj && studentObj) {
            matchesClass = studentObj.class === selectedClassObj.name;
        } else {
            matchesClass = false; // Se não achou aluno ou turma, oculta
        }
    }

    return matchesSearch && matchesStatus && matchesClass;
  });

  // --- TRADUÇÕES E UTILS ---
  const getStatusLabel = (statusKey: string) => {
    const map: Record<string, string> = { paid: 'Pago', pending: 'Pendente', overdue: 'Vencido', canceled: 'Cancelado' };
    return map[statusKey] || statusKey;
  };

  const getStatusStyle = (statusKey: string) => {
    switch (statusKey) {
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-slate-200 text-slate-500 line-through';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // --- FILTRO DO MODAL ---
  const modalAvailableStudents = studentsList.filter(student => {
    if (editingId) return true; 
    if (!modalClassId) return false;
    const selectedClassObj = classesList.find(c => c.id === modalClassId);
    return selectedClassObj && student.class === selectedClassObj.name;
  });

  // --- AÇÕES ---
  const handleExport = () => {
    const headers = ["Aluno", "Descrição", "Valor", "Vencimento", "Status"];
    const csvContent = [
      headers.join(";"),
      ...filteredInvoices.map(inv => {
        const displayStatusKey = getDisplayStatus(inv);
        return [
          `"${inv.studentName}"`, 
          `"${inv.description}"`,
          inv.amount.toString().replace('.', ','), 
          format(parseISO(inv.dueDate), 'dd/MM/yyyy'), 
          getStatusLabel(displayStatusKey)
        ].join(";");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `faturas_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const numericAmount = typeof formData.amount === 'string' 
        ? parseFloat(formData.amount.replace(',', '.')) : formData.amount;
      
      const basePayload = {
        description: formData.description,
        amount: numericAmount,
        dueDate: formData.dueDate
      };

      if (editingId) {
        await financeService.update(editingId, basePayload);
      } else {
        if (creationMode === 'batch') {
          if (!modalClassId) throw new Error("Selecione a turma.");
          await financeService.createBatch({ classId: modalClassId, ...basePayload });
        } else {
          if (!formData.studentId) throw new Error("Selecione o aluno.");
          await financeService.create({ studentId: formData.studentId, ...basePayload });
        }
      }
      setShowModal(false);
      fetchData();
      alert("Salvo com sucesso!");
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      alert(`Erro: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja CANCELAR esta fatura?")) return;
    try { await financeService.cancel(id); fetchData(); } catch (error) { alert("Erro ao cancelar."); }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm("Confirmar pagamento?")) return;
    try { await financeService.markAsPaid(id); fetchData(); } catch (error) { alert("Erro ao processar pagamento."); }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Financeiro</h1>
          <p className="text-slate-500 mt-1">Gestão de receitas e faturas</p>
        </div>
        <div className="flex gap-3">
           <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium shadow-sm">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={() => { 
              setEditingId(null); setCreationMode('single'); setModalClassId('');
              setFormData({ studentId: '', studentNameDisplay: '', description: '', amount: '', dueDate: '' }); 
              setShowModal(true); 
            }}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> <span>Nova Fatura</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Receita Mensal', value: financialData?.receitaTotal ? formatCurrency(financialData.receitaTotal) : 'R$ 0,00', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Faturas Pagas', value: invoices.filter(i => i.status === 'paid').length, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Pendentes', value: invoices.filter(i => getDisplayStatus(i) === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Vencidas', value: invoices.filter(i => getDisplayStatus(i) === 'overdue').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl flex items-center justify-between">
            <div><p className="text-slate-500 text-sm font-medium">{stat.label}</p><h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3></div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-sm`}><stat.icon className="w-6 h-6" /></div>
          </div>
        ))}
      </div>

      {/* Tabela e Filtros */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden flex flex-col">
        
        {/* Barra de Filtros */}
        <div className="p-6 border-b border-slate-100/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Esquerda: Busca e Filtro de Turma */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* --- NOVO FILTRO DE TURMA --- */}
            <div className="relative w-full sm:w-48">
               <select
                 value={filterClassId}
                 onChange={(e) => setFilterClassId(e.target.value)}
                 className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none text-slate-600"
               >
                 <option value="">Todas as Turmas</option>
                 {classesList.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
               <Filter className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Direita: Abas de Status */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full md:w-auto">
            {[
              { val: '', label: 'Todos' }, 
              { val: 'pending', label: 'Pendentes' },
              { val: 'paid', label: 'Pagos' }, 
              { val: 'overdue', label: 'Vencidos' },
              { val: 'canceled', label: 'Cancelados' }
            ].map((opt) => (
              <button
                key={opt.val} onClick={() => setSelectedStatus(opt.val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedStatus === opt.val ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Dados */}
        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left">
                <tr>
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Vencimento</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredInvoices.map((invoice) => {
                   const displayStatusKey = getDisplayStatus(invoice);
                   return (
                    <tr key={invoice.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                            {(invoice.studentName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{invoice.studentName}</div>
                            <div className="text-xs text-slate-500">{invoice.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{formatCurrency(invoice.amount)}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${displayStatusKey === 'overdue' ? 'text-red-500' : 'text-slate-400'}`} />
                          {invoice.dueDate ? format(parseISO(invoice.dueDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(displayStatusKey)}`}>
                          {getStatusLabel(displayStatusKey)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.status !== 'canceled' && (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {invoice.status !== 'paid' && (
                              <button onClick={() => handleMarkAsPaid(invoice.id)} title="Pagar" className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setEditingId(invoice.id); 
                                setFormData({
                                  studentId: invoice.studentId, studentNameDisplay: invoice.studentName || '',
                                  description: invoice.description, amount: invoice.amount.toString(), dueDate: invoice.dueDate,
                                });
                                setShowModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(invoice.id)} title="Cancelar" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal (Mantido Igual) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 text-emerald-800 flex items-center gap-2">
              <DollarSign className="w-6 h-6" /> {editingId ? 'Editar' : 'Nova'} Fatura
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <>
                  <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                    <button type="button" onClick={() => { setCreationMode('single'); setModalClassId(''); }} className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${creationMode === 'single' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Users className="w-4 h-4" /> Individual</button>
                    <button type="button" onClick={() => { setCreationMode('batch'); setModalClassId(''); }} className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${creationMode === 'batch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Layers className="w-4 h-4" /> Por Turma (Lote)</button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                     <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">{creationMode === 'batch' ? 'Turma (Todas receberão)' : 'Filtrar Turma'}</label>
                       <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" value={modalClassId} onChange={(e) => { setModalClassId(e.target.value); setFormData(prev => ({...prev, studentId: ''})); }}>
                         <option value="">{creationMode === 'batch' ? 'Selecione a Turma...' : 'Todas as Turmas'}</option>
                         {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                     </div>
                     {creationMode === 'single' && (
                       <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Aluno *</label>
                         <select required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none disabled:bg-slate-100" value={formData.studentId} onChange={(e) => setFormData(prev => ({...prev, studentId: e.target.value}))}>
                           <option value="">{modalClassId ? 'Selecione o Aluno...' : 'Selecione a Turma Primeiro'}</option>
                           {modalAvailableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </select>
                       </div>
                     )}
                  </div>
                </>
              )}
              {editingId && (<div><label className="block text-sm font-medium text-slate-700 mb-1">Aluno</label><input disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500" value={formData.studentNameDisplay} /></div>)}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label><input required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Ex: Mensalidade" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label><input required type="number" step="0.01" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label><input required type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} {isSaving ? 'Salvando...' : (creationMode === 'batch' && !editingId ? 'Gerar Lote' : 'Salvar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}