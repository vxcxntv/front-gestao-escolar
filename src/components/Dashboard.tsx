import { useEffect, useState, useMemo } from 'react';
import {
    Users, BookOpen, GraduationCap, DollarSign, Clock, Calendar,
    FileText, Award, CheckCircle, ClipboardList, Clock4,
    Megaphone, UserPlus, ArrowRight, Loader2, Settings,
    Bell, Pin
} from 'lucide-react';
import { dashboardService, eventService, Announcement } from '../services/dashboardService';
import { AdminDashboardStats, TeacherDashboardStats, StudentDashboardStats, Grade, Event } from '../types';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from './ui/metricCard';

type UserRole = 'admin' | 'teacher' | 'student' | 'guardian' | 'responsible';

const useUserRoleFromUrl = (): UserRole => {
    const [role, setRole] = useState<UserRole>('admin');
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlRole = params.get('role')?.toLowerCase() as UserRole;
        if (urlRole && ['admin', 'teacher', 'student', 'guardian', 'responsible'].includes(urlRole)) {
            setRole(urlRole);
        }
    }, []);
    return role;
};

export function Dashboard() {
    const userRole = useUserRoleFromUrl();
    const [statsData, setStatsData] = useState<any>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[] | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    useEffect(() => {
        const loadStats = async () => {
            setIsLoading(true);
            try {
                let dataPromise;
                let eventsPromise: Promise<Event[] | null> = Promise.resolve(null);
                let announcementsPromise: Promise<Announcement[]> = Promise.resolve([]);

                switch (userRole) {
                    case 'admin':
                        dataPromise = dashboardService.getAdminStats();
                        eventsPromise = eventService.getUpcomingEvents();
                        announcementsPromise = dashboardService.getRecentAnnouncements();
                        break;
                    case 'teacher':
                        dataPromise = dashboardService.getTeacherStats();
                        break;
                    case 'student':
                    case 'guardian':
                    case 'responsible':
                        dataPromise = dashboardService.getStudentStats();
                        break;
                    default:
                        dataPromise = dashboardService.getAdminStats();
                }

                const [data, events, notices] = await Promise.all([dataPromise, eventsPromise, announcementsPromise]);

                setStatsData(data);
                if (userRole === 'admin') {
                    setUpcomingEvents(events);
                    setAnnouncements(notices);
                }

            } catch (error) {
                console.error(`Erro ao carregar dashboard`, error);
                setStatsData({});
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, [userRole]);

    // --- Cards de Métricas ---
    const stats = useMemo(() => {
        if (!statsData) return [];

        switch (userRole) {
            case 'admin':
                const adminData = statsData as AdminDashboardStats;
                return [
                    { title: 'Estudantes', value: adminData.totalStudents?.toString() || '0', subtitle: 'Matriculados ativos', icon: Users, colorTheme: 'blue' as const },
                    { title: 'Turmas', value: adminData.totalClasses?.toString() || '0', subtitle: 'Em andamento', icon: BookOpen, colorTheme: 'emerald' as const },
                    { title: 'Professores', value: adminData.totalTeachers?.toString() || '0', subtitle: 'Corpo docente', icon: GraduationCap, colorTheme: 'amber' as const },
                    { title: 'Receita (Mês)', value: formatCurrency(adminData.revenueThisMonth), subtitle: 'Faturamento consolidado', icon: DollarSign, colorTheme: 'emerald' as const },
                ];
            case 'teacher':
                const teacherData = statsData as TeacherDashboardStats;
                return [
                    { title: 'Minhas Turmas', value: teacherData.totalClasses?.toString() || '0', subtitle: 'Disciplinas ativas', icon: BookOpen, colorTheme: 'blue' as const },
                    { title: 'Total Alunos', value: teacherData.totalStudents?.toString() || '0', subtitle: 'Sob sua tutela', icon: Users, colorTheme: 'emerald' as const },
                    { title: 'Correções', value: teacherData.assignmentsPending?.toString() || '0', subtitle: 'Pendentes de nota', icon: FileText, colorTheme: 'amber' as const },
                    { title: 'Próxima Aula', value: teacherData.nextClass?.time || '--:--', subtitle: teacherData.nextClass?.name || 'Sem aulas hoje', icon: Clock4, colorTheme: 'red' as const },
                ];
            case 'student':
            case 'guardian':
            case 'responsible':
                const studentData = statsData as StudentDashboardStats;
                return [
                    { title: 'Matrículas', value: studentData.enrolledClasses?.toString() || '0', subtitle: 'Disciplinas', icon: BookOpen, colorTheme: 'blue' as const },
                    { title: 'Média Geral', value: studentData.averageGrade ? studentData.averageGrade.toFixed(1) : '-', subtitle: 'Desempenho acadêmico', icon: Award, colorTheme: 'emerald' as const },
                    { title: 'Presença', value: studentData.attendanceRate ? `${studentData.attendanceRate}%` : '-', subtitle: 'Frequência global', icon: CheckCircle, colorTheme: 'amber' as const },
                    { title: 'Tarefas', value: studentData.pendingAssignments?.toString() || '0', subtitle: 'Para entregar', icon: ClipboardList, colorTheme: 'red' as const },
                ];
            default: return [];
        }
    }, [statsData, userRole]);

    // --- NOVO DESIGN: Acesso Rápido (Cards Quadrados) ---
    const renderQuickActions = () => {
        if (userRole === 'admin') {
            const actions = [
                { label: 'Matricular Aluno', icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200', path: '/students' },
                { label: 'Lançar Pagamento', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200', path: '/finance' },
                { label: 'Criar Aviso', icon: Megaphone, color: 'text-pink-600', bg: 'bg-pink-50', border: 'hover:border-pink-200', path: '/announcements' },
                { label: 'Calendário', icon: Calendar, color: 'text-slate-600', bg: 'bg-slate-100', border: 'hover:border-slate-300', path: '/events' },
            ];

            return (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" /> Acesso Rápido
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(action.path)}
                                className={`flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group ${action.border}`}
                            >
                                <div className={`p-4 rounded-2xl ${action.bg} ${action.color} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                                    <action.icon className="w-8 h-8" />
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // --- Conteúdo Principal ---
    const renderContent = () => {
        if (!statsData) return null;

        // ADMIN CONTENT
        if (userRole === 'admin') {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* COLUNA 1: Mural de Avisos (Substituindo Saúde da Escola) */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-indigo-500" />
                                Mural de Avisos
                            </h2>
                            <button onClick={() => navigate('/announcements')} className="text-sm text-indigo-600 font-medium hover:underline">Ver todos</button>
                        </div>

                        <div className="space-y-4 flex-1">
                            {announcements.length > 0 ? (
                                announcements.map((notice) => (
                                    <div key={notice.id} className={`p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${notice.pinned ? 'border-l-4 border-l-amber-400 border-indigo-50' : 'border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {notice.pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                                <h3 className="font-bold text-slate-800 line-clamp-1">{notice.title}</h3>
                                            </div>
                                            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {new Date(notice.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2">{notice.content}</p>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                {notice.category}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p>Nenhum aviso publicado.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUNA 2: Agenda Escolar */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                Agenda Escolar
                            </h2>
                            <button onClick={() => navigate('/events')} className="flex items-center gap-1 text-sm text-purple-600 font-medium hover:underline">
                                Ver tudo <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1">
                            {upcomingEvents && upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event: any) => (
                                    <div key={event.id} className="flex gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-purple-200 transition-all cursor-pointer group">
                                        <div className="flex flex-col items-center justify-center bg-purple-50 text-purple-700 rounded-lg w-14 h-14 shrink-0 border border-purple-100">
                                            {/* Nota: Usamos startDate aqui porque mapeamos no service */}
                                            <span className="text-xs font-bold uppercase">{new Date(event.startDate).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                            <span className="text-xl font-bold">{new Date(event.startDate).getDate()}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <p className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors line-clamp-1">{event.title}</p>
                                                {event.type && <span className="text-[10px] text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded uppercase font-bold h-fit">{event.type}</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-1 mt-1">{event.description || 'Evento escolar'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p>Nenhum evento próximo.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // ... (Blocos Teacher e Student permanecem idênticos ao anterior) ...
        // TEACHER
        if (userRole === 'teacher') {
            const teacherData = statsData as TeacherDashboardStats;
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" /> Linha do Tempo
                        </h2>
                        {teacherData.nextClass ? (
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <p className="font-bold">{teacherData.nextClass.name}</p>
                                <p className="text-sm">{teacherData.nextClass.time}</p>
                            </div>
                        ) : <p className="text-slate-500">Sem aulas hoje.</p>}
                    </div>
                </div>
            );
        }

        return null;
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        {userRole === 'admin' && 'Painel de Controle'}
                        {userRole === 'teacher' && 'Sala dos Professores'}
                        {userRole === 'student' && 'Espaço do Aluno'}
                        {(userRole === 'guardian' || userRole === 'responsible') && 'Área do Responsável'}
                    </h1>
                    <p className="text-slate-500 mt-1">Visão geral e acesso rápido às funções.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
            </div>

            {/* Atalhos Rápidos */}
            {renderQuickActions()}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <MetricCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                        colorTheme={stat.colorTheme}
                    />
                ))}
            </div>

            {/* Conteúdo Dinâmico */}
            {renderContent()}
        </div>
    );
}