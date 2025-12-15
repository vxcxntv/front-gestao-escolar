import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Download, Filter, Users, 
  GraduationCap, DollarSign, Calendar, Eye, Printer, Loader2, AlertCircle
} from 'lucide-react';
import { reportsService, FinancialReport, DefaultersReport } from '../services/reportsService';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export function ReportsPage() {
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
  const [defaultersData, setDefaultersData] = useState<DefaultersReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>('financial');
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const reportTypes = [
    { id: 'financial', label: 'Financeiro', icon: DollarSign, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30' },
    { id: 'defaulters', label: 'Inadimplentes', icon: Users, color: 'from-red-500 to-pink-400', shadow: 'shadow-red-500/30' },
    { id: 'academic', label: 'Acadêmico', icon: GraduationCap, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30' },
    { id: 'attendance', label: 'Frequência', icon: Calendar, color: 'from-amber-500 to-yellow-400', shadow: 'shadow-amber-500/30' }
  ];

  const quickFilters = [
    { label: 'Este Mês', days: 30 },
    { label: 'Últimos 3 Meses', days: 90 },
    { label: 'Este Ano', days: 365 }
  ];

  useEffect(() => {
    loadSelectedReport();
  }, [selectedReport, dateRange]);

  const loadSelectedReport = async () => {
    setIsLoading(true);
    try {
      switch (selectedReport) {
        case 'financial':
          const financial = await reportsService.getFinancialRevenue(dateRange.start, dateRange.end);
          setFinancialData(financial);
          break;
        case 'defaulters':
          const defaulters = await reportsService.getFinancialDefaults();
          // Garante que defaultersData tenha uma estrutura válida mesmo se a API falhar
          setDefaultersData(defaulters || { students: [] });
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      // Evita estado inválido em caso de erro
      if (selectedReport === 'defaulters') setDefaultersData({ students: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    let csvContent = "";
    let filename = "";

    if (selectedReport === 'financial' && financialData) {
      filename = `relatorio_financeiro_${dateRange.start}_${dateRange.end}.csv`;
      const headers = "Periodo;Receita Total;Pagos;Pendentes;Inadimplentes";
      const summary = `Resumo;${financialData.totalRevenue};${financialData.paidInvoices};${financialData.pendingInvoices};${financialData.overdueInvoices}`;
      
      const detailHeaders = "Mes;Receita";
      const details = (financialData.revenueByMonth || []).map(m => `${m.month};${m.revenue}`).join("\n");
      
      csvContent = [headers, summary, "", detailHeaders, details].join("\n");

    } else if (selectedReport === 'defaulters' && defaultersData?.students) {
      filename = `relatorio_inadimplentes_${format(new Date(), 'dd-MM-yyyy')}.csv`;
      const headers = "ID;Nome;Total Devido;Dias Atraso;Qtd Faturas";
      
      const rows = defaultersData.students.map(s => 
        `${s.id};"${s.name}";${s.totalDue.toString().replace('.', ',')};${s.overdueDays};${s.invoices?.length || 0}`
      ).join("\n");
      
      csvContent = [headers, rows].join("\n");
    } else {
      alert("Relatório não disponível para exportação ou sem dados.");
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Relatórios</h1>
          <p className="text-slate-500 mt-1">Analytics e insights da instituição</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
          <button 
             onClick={handleExport}
             className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
           >
            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 group ${
                isSelected
                  ? `border-transparent bg-gradient-to-br ${report.color} text-white shadow-xl ${report.shadow} transform -translate-y-1`
                  : 'border-white/50 bg-white/70 backdrop-blur-xl text-slate-600 hover:bg-white hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-xl transition-colors ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-50 group-hover:text-indigo-600'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                    <span className="block font-bold text-lg leading-tight">{report.label}</span>
                    <span className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>Visualizar análise</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters Area */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Período de Análise
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => {
                    const end = new Date();
                    const start = subMonths(end, filter.days / 30);
                    setDateRange({
                      start: format(start, 'yyyy-MM-dd'),
                      end: format(end, 'yyyy-MM-dd')
                    });
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/50 p-2 rounded-xl border border-slate-200">
            <input
              type="date"
              className="bg-transparent border-none text-slate-700 font-medium focus:ring-0 cursor-pointer outline-none"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="text-slate-400">Até</span>
            <input
              type="date"
              className="bg-transparent border-none text-slate-700 font-medium focus:ring-0 cursor-pointer outline-none"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Carregando dados...</p>
          </div>
        ) : (
          <>
            {selectedReport === 'financial' && financialData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-800">Receita Total</h4>
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 relative z-10">
                      {formatCurrency(financialData.totalRevenue || 0)}
                    </p>
                    <p className="text-sm text-slate-500 mt-2 relative z-10">
                      No período selecionado
                    </p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-800">Faturas Pagas</h4>
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 relative z-10">
                      {financialData.paidInvoices || 0}
                    </p>
                    <p className="text-sm text-slate-500 mt-2 relative z-10">
                      Transações confirmadas
                    </p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="w-24 h-24 text-red-600" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-800">Inadimplência</h4>
                      <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 relative z-10">
                      {formatCurrency((financialData.overdueInvoices || 0) * 100)} <span className="text-sm font-normal text-slate-400">(est.)</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-2 relative z-10">
                      {financialData.overdueInvoices || 0} faturas vencidas
                    </p>
                  </div>
                </div>

                {/* Chart Area */}
                {financialData.revenueByMonth && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                    <h4 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-500" />
                      Evolução da Receita
                    </h4>
                    
                    <div className="space-y-6">
                      {financialData.revenueByMonth.map((item, index) => {
                          const maxRevenue = Math.max(...financialData.revenueByMonth.map(r => r.revenue));
                          const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                          
                          return (
                          <div key={index} className="group">
                            <div className="flex items-end justify-between mb-2">
                              <span className="text-sm font-bold text-slate-700">{item.month}</span>
                              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{formatCurrency(item.revenue)}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedReport === 'defaulters' && defaultersData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden flex flex-col max-h-[600px]">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
                    <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-500" />
                      Lista de Inadimplência
                    </h4>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                        {defaultersData.students?.length || 0} Alunos
                    </span>
                  </div>
                  
                  <div className="overflow-y-auto overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="py-4 px-6">Aluno</th>
                          <th className="py-4 px-6">Valor Total</th>
                          <th className="py-4 px-6">Atraso</th>
                          <th className="py-4 px-6">Faturas</th>
                          <th className="py-4 px-6 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {defaultersData.students?.map((student) => (
                          <tr key={student.id} className="hover:bg-red-50/30 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                                  {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">{student.name || 'Desconhecido'}</p>
                                  <p className="text-xs text-slate-500">ID: {student.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                {formatCurrency(student.totalDue || 0)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${
                                student.overdueDays > 30 
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                <ClockIcon className="w-3 h-3" />
                                {student.overdueDays} dias
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm font-medium text-slate-600">
                                {student.invoices?.length || 0} pendentes
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => console.log('Ver detalhes', student)}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="w-4 h-4" /> Detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(!defaultersData.students || defaultersData.students.length === 0) && (
                      <div className="p-12 text-center text-slate-500">
                          <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                          <p>Nenhum aluno inadimplente encontrado.</p>
                      </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Fallback for other reports */}
            {(selectedReport === 'academic' || selectedReport === 'attendance') && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl border-dashed">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        {selectedReport === 'academic' ? <GraduationCap className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Relatório em Desenvolvimento</h3>
                    <p className="text-slate-500">Este módulo estará disponível em breve.</p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Icon helpers
function ClockIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

function CheckCircleIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}