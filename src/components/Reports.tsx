import { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Users, GraduationCap, DollarSign, 
  Calendar, Printer, Loader2, TrendingUp, AlertCircle 
} from 'lucide-react';
import { reportsService, FinancialReport, DefaultersReport } from '../services/reportsService';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Importação dos Novos Componentes
import { MetricCard } from '../components/ui/metricCard';
import { DateRangeFilter } from '../components/ui/DateRangeFilter';
import { DefaultersTable } from '../components/ui/DefaultersTable';

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
          setDefaultersData(defaulters || { students: [] });
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
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
      const details = financialData.revenueByMonth.map(m => `${m.month};${m.revenue}`).join("\n");
      
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

    // Criação e download do arquivo (Agora csvContent é utilizado)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Relatórios</h1>
          <p className="text-slate-500 mt-1">Analytics e insights da instituição</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium shadow-sm">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
          <button onClick={handleExport} className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-medium">
            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Grid de Tipos de Relatório */}
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

      {/* Filtros de Data (Componente Médio) */}
      <DateRangeFilter 
        startDate={dateRange.start}
        endDate={dateRange.end}
        onRangeChange={(start, end) => setDateRange({ start, end })}
      />

      {/* Área de Conteúdo */}
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
                {/* Cards de Métricas (Componente Simples) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard 
                    title="Receita Total"
                    value={formatCurrency(financialData.totalRevenue)}
                    subtitle="No período selecionado"
                    icon={TrendingUp}
                    colorTheme="emerald"
                  />
                  <MetricCard 
                    title="Faturas Pagas"
                    value={financialData.paidInvoices}
                    subtitle="Transações confirmadas"
                    icon={Users}
                    colorTheme="blue"
                  />
                  <MetricCard 
                    title="Inadimplência"
                    value={formatCurrency((financialData.overdueInvoices || 0) * 100)}
                    subtitle={`${financialData.overdueInvoices} faturas vencidas`}
                    icon={AlertCircle}
                    colorTheme="red"
                  />
                </div>

                {/* Gráfico Inline */}
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

            {/* Tabela de Inadimplentes (Componente Complexo) */}
            {selectedReport === 'defaulters' && (
              <DefaultersTable students={defaultersData?.students} />
            )}

            {/* Fallback */}
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