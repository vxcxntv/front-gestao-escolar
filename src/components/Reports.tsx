import { useState, useEffect } from 'react';
import {
  BarChart3, Download, Users, GraduationCap, DollarSign,
  Calendar, Printer, Loader2, TrendingUp, AlertCircle, ChevronDown, BookOpen
} from 'lucide-react';
import {
  reportsService, FinancialReport, DefaultersReport,
  AcademicReport, AttendanceReport, ClassSummary, SubjectSummary
} from '../services/reportsService';
import { format, startOfMonth, endOfMonth } from 'date-fns';


import { MetricCard } from './ui/metricCard';
import { DateRangeFilter } from '../components/ui/DateRangeFilter';
import { DefaultersTable } from '../components/ui/DefaultersTable';
import { AcademicView } from '../components/ui/AcademicView';
import { AttendanceView } from '../components/ui/AttendanceView';

export function ReportsPage() {
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

  // Filtros
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const reportTypes = [
    { id: 'financial', label: 'Financeiro', icon: DollarSign, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30' },
    { id: 'defaulters', label: 'Inadimplentes', icon: Users, color: 'from-red-500 to-pink-400', shadow: 'shadow-red-500/30' },
    { id: 'academic', label: 'Acadêmico', icon: GraduationCap, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30' },
    { id: 'attendance', label: 'Frequência', icon: Calendar, color: 'from-amber-500 to-yellow-400', shadow: 'shadow-amber-500/30' }
  ];

  // 1. Carregar filtros iniciais
  useEffect(() => {
    async function loadFilters() {
      try {
        const [classesList, subjectsList] = await Promise.all([
          reportsService.getClasses(),
          reportsService.getSubjects()
        ]);

        setClasses(Array.isArray(classesList) ? classesList : []);
        setSubjects(Array.isArray(subjectsList) ? subjectsList : []);

        if (classesList.length > 0) setSelectedClassId(classesList[0].id);
      } catch (error) {
        console.error("Erro ao carregar filtros", error);
      }
    }
    loadFilters();
  }, []);

  // 2. Carregar Relatórios
  useEffect(() => {
    if (selectedReport === 'academic' || selectedReport === 'attendance') {
      if (selectedClassId) loadSelectedReport();
    } else {
      loadSelectedReport();
    }
  }, [selectedReport, dateRange, selectedClassId, selectedSubjectId]);

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
            // Agora passa o Subject ID
            const academic = await reportsService.getAcademicReport(selectedClassId, selectedSubjectId || undefined);
            setAcademicData(academic);
          }
          break;
        case 'attendance':
          if (selectedClassId) {
            // Agora passa o Subject ID
            const attendance = await reportsService.getAttendanceReport(selectedClassId, selectedSubjectId || undefined);
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

  const handleExport = () => {
    alert("Exportação processada para download.");
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const isClassReport = selectedReport === 'academic' || selectedReport === 'attendance';
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

      {/* TIPO DE RELATÓRIO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 group ${isSelected
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
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 w-full">
        <div className="w-full lg:w-auto flex justify-center lg:justify-start">
          <DateRangeFilter
            startDate={dateRange.start}
            endDate={dateRange.end}
            onRangeChange={(start, end) => setDateRange({ start, end })}
          />
        </div>

        {isClassReport && (
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto animate-in fade-in slide-in-from-right-4">

            {/* Filtro de Turma */}
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex-1 min-w-[200px]">
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
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Filtro de Disciplina */}
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex-1 min-w-[200px]">
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="relative flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1 mb-0.5">Disciplina</label>
                <div className="relative">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full appearance-none bg-transparent text-slate-700 py-1 pl-1 pr-8 text-sm focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="">Todas</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
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
            {/* FINANCEIRO (GRID 2x2) */}
            {selectedReport === 'financial' && financialData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <MetricCard
                    title="Faturas Pagas"
                    value={financialData.paidInvoices.toString()}
                    subtitle="Total liquidado"
                    icon={DollarSign}
                    colorTheme="blue"
                  />
                  <MetricCard
                    title="Pendentes"
                    value={financialData.pendingInvoices.toString()}
                    subtitle="Aguardando pagamento"
                    icon={Calendar}
                    colorTheme="amber"
                  />
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" />Evolução da Receita</h4>
                  <div className="space-y-6">
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
                    }) : <p className="text-center text-slate-400 py-4">Sem dados.</p>}
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'defaulters' && <DefaultersTable students={defaultersData?.students} />}
            {selectedReport === 'academic' && academicData && <AcademicView data={academicData} />}
            {selectedReport === 'attendance' && attendanceData && <AttendanceView data={attendanceData} />}
          </>
        )}
      </div>
    </div>
  );
}