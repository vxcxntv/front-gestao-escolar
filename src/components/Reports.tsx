import { useState, useEffect } from 'react';
import {
  BarChart3, Download, Users, GraduationCap, DollarSign,
  Calendar, Printer, Loader2, TrendingUp, AlertCircle, ChevronDown
} from 'lucide-react';
import {
  reportsService, FinancialReport, DefaultersReport,
  AcademicReport, AttendanceReport, ClassSummary
} from '../services/reportsService';
import { format, startOfMonth, endOfMonth } from 'date-fns';

import { MetricCard } from '../components/ui/metricCard';
import { DateRangeFilter } from '../components/ui/DateRangeFilter';
import { DefaultersTable } from '../components/ui/DefaultersTable';
import { AcademicView } from '../components/ui/AcademicView';
import { AttendanceView } from '../components/ui/AttendanceView';

// Adicione 'export' aqui para corrigir o erro "doesn't provide an export"
export function ReportsPage() {
  // --- Estados ---
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
  const [defaultersData, setDefaultersData] = useState<DefaultersReport | null>(null);
  const [academicData, setAcademicData] = useState<AcademicReport | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceReport | null>(null);

  const [selectedReport, setSelectedReport] = useState<string>('financial');
  const [isLoading, setIsLoading] = useState(false);

  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const reportTypes = [
    { id: 'financial', label: 'Financeiro', icon: DollarSign, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30' },
    { id: 'defaulters', label: 'Inadimplentes', icon: Users, color: 'from-red-500 to-pink-400', shadow: 'shadow-red-500/30' },
    { id: 'academic', label: 'Acadêmico', icon: GraduationCap, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30' },
    { id: 'attendance', label: 'Frequência', icon: Calendar, color: 'from-amber-500 to-yellow-400', shadow: 'shadow-amber-500/30' }
  ];

  // 1. Carregar turmas
  useEffect(() => {
    async function loadClasses() {
      try {
        const classesList = await reportsService.getClasses();
        // Proteção: garante que classesList seja um array
        const safeList = Array.isArray(classesList) ? classesList : [];
        setClasses(safeList);
        if (safeList.length > 0) {
          setSelectedClassId(safeList[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar turmas", error);
        setClasses([]); // Fallback para evitar crash
      }
    }
    loadClasses();
  }, []);

  // 2. Carregar Relatórios
  useEffect(() => {
    if (selectedReport === 'academic' || selectedReport === 'attendance') {
      if (selectedClassId) loadSelectedReport();
    } else {
      loadSelectedReport();
    }
  }, [selectedReport, dateRange, selectedClassId]);

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
        case 'academic':
          if (selectedClassId) {
            const academic = await reportsService.getAcademicReport(selectedClassId);
            setAcademicData(academic);
          }
          break;
        case 'attendance':
          if (selectedClassId) {
            const attendance = await reportsService.getAttendanceReport(selectedClassId);
            setAttendanceData(attendance);
          }
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Função de Exportação ---
  const handleExport = () => {
    if (isLoading) return;

    const reportNames: Record<string, string> = {
      financial: 'financeiro',
      defaulters: 'inadimplentes',
      academic: 'academico',
      attendance: 'frequencia'
    };

    const ptName = reportNames[selectedReport] || selectedReport;
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `relatorio_${ptName}_${format(new Date(), 'dd-MM-yyyy')}.csv`;

    const currentClassName = classes.find(c => c.id === selectedClassId)?.name || "Turma Desconhecida";

    switch (selectedReport) {
      case 'financial':
        if (!financialData) return alert("Sem dados para exportar.");
        csvContent += `Relatório Financeiro\nPeríodo:;${dateRange.start} a ${dateRange.end}\n\n`;
        csvContent += `Receita Total;${financialData.totalRevenue}\n`;
        csvContent += `Faturas Pagas;${financialData.paidInvoices}\n`;
        csvContent += `Inadimplência;${financialData.overdueInvoices}\n\n`;
        csvContent += "Mês;Receita\n";
        // Proteção aqui também
        (financialData.revenueByMonth || []).forEach(row => {
          csvContent += `${row.month};${row.revenue}\n`;
        });
        break;

      case 'defaulters':
        if (!defaultersData?.students) return alert("Sem dados para exportar.");
        csvContent += "Relatório de Inadimplentes\n\n";
        csvContent += "Nome do Aluno;Total Devido;Dias em Atraso\n";
        defaultersData.students.forEach(s => {
          csvContent += `${s.name};${s.totalDue};${s.overdueDays}\n`;
        });
        break;

      case 'academic':
        csvContent += `Relatório Acadêmico - ${academicData?.className || currentClassName}\n\n`;
        csvContent += `Média da Turma;${academicData?.summary.averageGrade || '0'}\n\n`;
        csvContent += "Aluno;Média;Status\n";

        if (academicData?.students) {
          academicData.students.forEach(s => {
            csvContent += `${s.name};${s.averageGrade};${s.status}\n`;
          });
        } else {
          csvContent += "Sem dados disponíveis;;";
        }
        break;

      case 'attendance':
        csvContent += `Relatório de Frequência - ${attendanceData?.className || currentClassName}\n\n`;
        csvContent += `Frequência Geral;${attendanceData?.summary.attendanceRate || '0'}%\n\n`;
        csvContent += "Aluno;Frequência (%);Faltas (aulas);Status\n";

        if (attendanceData?.students) {
          attendanceData.students.forEach(s => {
            csvContent += `${s.name};${s.attendanceRate};${s.absences};${s.status}\n`;
          });
        } else {
          csvContent += "Sem dados disponíveis;;;";
        }
        break;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const isClassReport = selectedReport === 'academic' || selectedReport === 'attendance';

  // Variável segura para o gráfico
  const chartData = financialData?.revenueByMonth || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* HEADER */}
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
          <button onClick={handleExport} className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-medium active:scale-95">
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* SELEÇÃO DE TIPO DE RELATÓRIO */}
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
                <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-50'}`}>
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

      {/* FILTROS UNIFICADOS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 w-full">
        <div className="w-full lg:w-auto flex justify-center lg:justify-start">
          <DateRangeFilter
            startDate={dateRange.start}
            endDate={dateRange.end}
            onRangeChange={(start, end) => setDateRange({ start, end })}
          />
        </div>

        {isClassReport && (
          <div className="w-full lg:w-96 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div className="relative flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1 mb-0.5">Turma</label>
                <div className="relative">
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full appearance-none bg-transparent text-slate-700 py-1 pl-1 pr-8 text-sm focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="" disabled>Selecione...</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.academic_year ? `- ${cls.academic_year}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* FINANCEIRO */}
            {selectedReport === 'financial' && financialData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Receita Total"
                    value={formatCurrency(financialData.totalRevenue)}
                    subtitle="No período selecionado"
                    icon={TrendingUp}
                    colorTheme="emerald"
                  />
                  <MetricCard
                    title="Inadimplência (Total)"
                    value={formatCurrency(financialData.totalOverdue || 0)}
                    subtitle={`${financialData.overdueInvoices} faturas vencidas`}
                    icon={AlertCircle}
                    colorTheme="red"
                  />
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" />Evolução da Receita</h4>
                  <div className="space-y-6">
                    {/* Correção definitiva do erro de map */}
                    {chartData.length > 0 ? chartData.map((item, index) => {
                      const maxVal = Math.max(...chartData.map(r => r.revenue)) || 1;
                      return (
                        <div key={index} className="group">
                          <div className="flex items-end justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">{item.month}</span>
                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{formatCurrency(item.revenue)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(item.revenue / maxVal) * 100}%` }} />
                          </div>
                        </div>
                      )
                    }) : (
                      <p className="text-center text-slate-400 py-4">Sem dados para o período.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* INADIMPLENTES */}
            {selectedReport === 'defaulters' && (
              <DefaultersTable students={defaultersData?.students} />
            )}

            {/* ACADÊMICO */}
            {selectedReport === 'academic' && (
              !selectedClassId ? (
                <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">Selecione uma turma acima para ver o relatório acadêmico.</div>
              ) : academicData && (
                <AcademicView data={academicData} />
              )
            )}

            {/* FREQUÊNCIA */}
            {selectedReport === 'attendance' && (
              !selectedClassId ? (
                <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">Selecione uma turma acima para ver o relatório de frequência.</div>
              ) : attendanceData && (
                <AttendanceView data={attendanceData} />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}