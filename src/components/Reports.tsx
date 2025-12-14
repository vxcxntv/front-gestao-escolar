import { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Filter, Users,
  GraduationCap, DollarSign, Calendar, Eye, Printer } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { reportsService } from '../services/reportsService';
import { studentsService } from '../services/studentsService';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ReportsPage() {
  const [financialData, setFinancialData] = useState<any>(null);
  const [defaultersData, setDefaultersData] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<string>('financial');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [isLoading, setIsLoading] = useState(false);

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
          setDefaultersData(defaulters);
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exportando ${selectedReport} como ${format}`);
    // Implementar exportação
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const reportTypes = [
    { id: 'financial', label: 'Financeiro', icon: DollarSign, color: 'from-emerald-500 to-teal-400' },
    { id: 'defaulters', label: 'Inadimplentes', icon: Users, color: 'from-red-500 to-pink-400' },
    { id: 'academic', label: 'Acadêmico', icon: GraduationCap, color: 'from-blue-500 to-cyan-400' },
    { id: 'attendance', label: 'Frequência', icon: Calendar, color: 'from-amber-500 to-yellow-400' }
  ];

  const quickFilters = [
    { label: 'Este Mês', days: 30 },
    { label: 'Últimos 3 Meses', days: 90 },
    { label: 'Este Ano', days: 365 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Relatórios</h1>
          <p className="text-slate-500 mt-1">Analytics e insights da instituição</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Printer}
            onClick={() => handleExport('pdf')}
          >
            Imprimir
          </Button>
          <Button
            variant="primary"
            icon={Download}
            onClick={() => handleExport('excel')}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Seletor de Relatórios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 rounded-2xl border transition-all ${
                selectedReport === report.id
                  ? 'border-white bg-gradient-to-br ' + report.color + ' text-white shadow-xl'
                  : 'border-white/50 bg-white/70 backdrop-blur-xl text-slate-700 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-xl ${
                  selectedReport === report.id
                    ? 'bg-white/20'
                    : 'bg-slate-100'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-bold">{report.label}</span>
                <span className="text-sm opacity-80">Análise detalhada</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtros Rápidos */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Período do Relatório
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
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="text-slate-500">até</span>
            <input
              type="date"
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo do Relatório Selecionado */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {selectedReport === 'financial' && financialData && (
            <div className="space-y-6">
              {/* Resumo Financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-slate-800">Receita Total</h4>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">
                    {formatCurrency(financialData.totalRevenue)}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Período: {format(parseISO(dateRange.start), 'dd/MM/yyyy')} - {format(parseISO(dateRange.end), 'dd/MM/yyyy')}
                  </p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-slate-800">Faturas Pagas</h4>
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">
                    {financialData.paidInvoices}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    {formatCurrency(financialData.paidInvoices * 1000)} estimado
                  </p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-slate-800">Inadimplência</h4>
                    <DollarSign className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">
                    {formatCurrency(financialData.overdueInvoices * 1000)}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    {financialData.overdueInvoices} faturas vencidas
                  </p>
                </div>
              </div>

              {/* Gráfico de Receita por Mês */}
              {financialData.revenueByMonth && (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    Receita Mensal
                  </h4>
                  
                  <div className="space-y-4">
                    {financialData.revenueByMonth.map((item: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{item.month}</span>
                          <span className="text-sm font-bold text-slate-800">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min((item.revenue / Math.max(...financialData.revenueByMonth.map((r: any) => r.revenue))) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedReport === 'defaulters' && defaultersData && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" />
                  Relatório de Inadimplentes
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Aluno</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Valor Devido</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Dias em Atraso</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Faturas</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaultersData.students.map((student: any) => (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-red-600">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{student.name}</p>
                                <p className="text-xs text-slate-500">ID: {student.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-red-600">
                              {formatCurrency(student.totalDue)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.overdueDays > 30 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {student.overdueDays} dias
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-slate-700">
                              {student.invoices.length} faturas
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Eye}
                              onClick={() => console.log('Ver detalhes', student)}
                            >
                              Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}