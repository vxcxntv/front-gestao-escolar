import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Loader2, DollarSign, 
  CheckCircle, Clock, AlertCircle, Filter, Download 
} from 'lucide-react';
import { financeService, Invoice, FinancialReport } from '../services/financeService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Finance() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [formData, setFormData] = useState({
    studentName: '',
    description: '',
    amount: '',
    dueDate: '',
    status: 'pending'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const invoiceData = await financeService.getAll({ status: selectedStatus || undefined });
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);

      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      try {
        const reportData = await financeService.getRevenueReport(
          format(firstDay, 'yyyy-MM-dd'),
          format(lastDay, 'yyyy-MM-dd')
        );
        setFinancialData(reportData);
      } catch (e) {
        console.warn("Não foi possível carregar o relatório financeiro", e);
      }

    } catch (err) {
      console.error("Erro ao buscar dados financeiros:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const filteredInvoices = invoices.filter(inv =>
    (inv.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // --- FUNÇÃO DE EXPORTAR AJUSTADA ---
  const handleExport = () => {
    // Cabeçalho sempre será gerado, mesmo sem dados
    const headers = ["ID", "Aluno", "Descrição", "Valor", "Vencimento", "Status", "Pagamento"];
    
    const csvContent = [
      headers.join(";"),
      ...invoices.map(inv => [
        inv.id,
        `"${inv.studentName}"`,
        `"${inv.description}"`,
        inv.amount.toString().replace('.', ','),
        inv.dueDate,
        inv.status,
        inv.paidAt || ''
      ].join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `faturas_${format(new Date(), 'dd-MM-yyyy_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const numericAmount = parseFloat(formData.amount.toString().replace(',', '.'));
      
      if (isNaN(numericAmount)) {
        throw new Error("O valor inserido não é válido.");
      }

      const payload = { 
        ...formData, 
        amount: numericAmount 
      };
      
      if (editingId) {
        await financeService.update(editingId, payload);
      } else {
        await financeService.create(payload);
      }
      setShowModal(false);
      fetchData();
      alert("Fatura salva com sucesso!");
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      const errorMsg = error.response?.data?.message || error.message || "Erro desconhecido";
      alert(`Erro ao salvar fatura: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta fatura?")) return;
    try {
      await financeService.delete(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      alert("Erro ao cancelar.");
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm("Confirmar pagamento desta fatura?")) return;
    try {
      await financeService.markAsPaid(id, new Date().toISOString());
      fetchData();
    } catch (error) {
      alert("Erro ao processar pagamento.");
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { paid: 'Pago', pending: 'Pendente', overdue: 'Vencido', cancelled: 'Cancelado' };
    return map[status] || status;
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
           <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm active:scale-95"
           >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={() => { 
              setEditingId(null); 
              setFormData({ studentName: '', description: '', amount: '', dueDate: '', status: 'pending' }); 
              setShowModal(true); 
            }}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Nova Fatura</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Receita Mensal', value: financialData?.totalRevenue ? formatCurrency(financialData.totalRevenue) : 'R$ 0,00', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Faturas Pagas', value: financialData?.paidInvoices || 0, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Pendentes', value: financialData?.pendingInvoices || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Vencidas', value: financialData?.overdueInvoices || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar aluno ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            {['', 'pending', 'paid', 'overdue'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === '' ? 'Todos' : getStatusLabel(st)}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
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
                {filteredInvoices.map((invoice) => (
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
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {invoice.dueDate ? format(parseISO(invoice.dueDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {invoice.status !== 'paid' && (
                          <button 
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            title="Marcar como pago"
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                             setEditingId(invoice.id); 
                             setFormData({
                               studentName: invoice.studentName,
                               description: invoice.description,
                               amount: invoice.amount.toString(),
                               dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '', 
                               status: invoice.status
                             });
                             setShowModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 text-emerald-800">{editingId ? 'Editar' : 'Nova'} Fatura</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Aluno</label>
                <input 
                  required 
                  className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                  value={formData.studentName} 
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                  required 
                  className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                    value={formData.amount} 
                    onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Vencido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} 
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}