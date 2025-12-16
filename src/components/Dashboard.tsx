    import { useEffect, useState, useMemo } from 'react';
    import { 
        Users, BookOpen, GraduationCap, DollarSign, Clock, Calendar, 
        Loader2, FileText, Award, CheckCircle, ClipboardList, Clock4 
    } from 'lucide-react';
    import { dashboardService, eventService } from '../services/dashboardService';
    import { AdminDashboardStats, TeacherDashboardStats, StudentDashboardStats, Grade, Event } from '../types';
    import { useNavigate } from 'react-router-dom';

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
        const [isLoading, setIsLoading] = useState(true);
        const navigate = useNavigate();

        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value || 0);
        };

        useEffect(() => {
            const loadStats = async () => {
                setIsLoading(true);
                try {
                    let dataPromise;
                    let eventsPromise: Promise<Event[] | null> = Promise.resolve(null);
                    
                    switch (userRole) {
                        case 'admin':
                            dataPromise = dashboardService.getAdminStats();
                            eventsPromise = eventService.getUpcomingEvents(); 
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
                            throw new Error("Role de usuário não suportada.");
                    }
                    
                    const [data, events] = await Promise.all([dataPromise, eventsPromise]);

                    setStatsData(data);
                    if (userRole === 'admin') {
                        setUpcomingEvents(events);
                    }

                } catch (error) {
                    console.error(`Erro ao carregar dashboard (${userRole})`, error);
                    setStatsData({}); 
                } finally {
                    setIsLoading(false);
                }
            };

            loadStats();
        }, [userRole]);

        const stats = useMemo(() => {
            if (!statsData) return [];

            switch (userRole) {
                case 'admin':
                    const adminData = statsData as AdminDashboardStats;
                    return [
                        { label: 'Total de Estudantes', value: adminData.totalStudents?.toString() || '0', icon: Users, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
                        { label: 'Turmas Ativas', value: adminData.totalClasses?.toString() || '0', icon: BookOpen, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
                        { label: 'Professores', value: adminData.totalTeachers?.toString() || '0', icon: GraduationCap, color: 'from-orange-500 to-yellow-400', shadow: 'shadow-orange-500/20' },
                        { label: 'Receita (Mês)', value: formatCurrency(adminData.revenueThisMonth), icon: DollarSign, color: 'from-purple-500 to-pink-400', shadow: 'shadow-purple-500/20', action: false },
                    ];

                case 'teacher':
                    const teacherData = statsData as TeacherDashboardStats;
                    return [
                        { label: 'Minhas Turmas', value: teacherData.totalClasses?.toString() || '0', icon: BookOpen, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
                        { label: 'Total de Alunos', value: teacherData.totalStudents?.toString() || '0', icon: Users, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
                        { label: 'Pendentes de Nota', value: teacherData.assignmentsPending?.toString() || '0', icon: FileText, color: 'from-orange-500 to-yellow-400', shadow: 'shadow-orange-500/20' },
                        { label: 'Próxima Aula', value: teacherData.nextClass?.name || 'Nenhuma', icon: Clock4, color: 'from-purple-500 to-pink-400', shadow: 'shadow-purple-500/20' },
                    ];

                case 'student':
                case 'guardian':
                case 'responsible':
                    const studentData = statsData as StudentDashboardStats;
                    return [
                        { label: 'Turmas Matrículadas', value: studentData.enrolledClasses?.toString() || '0', icon: BookOpen, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
                        { label: 'Média Geral', value: studentData.averageGrade ? `${studentData.averageGrade.toFixed(1)}/10` : 'N/A', icon: Award, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
                        { label: 'Taxa de Presença', value: studentData.attendanceRate ? `${studentData.attendanceRate}%` : 'N/A', icon: CheckCircle, color: 'from-orange-500 to-yellow-400', shadow: 'shadow-orange-500/20' },
                        { label: 'Tarefas Pendentes', value: studentData.pendingAssignments?.toString() || '0', icon: ClipboardList, color: 'from-purple-500 to-pink-400', shadow: 'shadow-purple-500/20', action: true },
                    ];

                default:
                    return [];
            }
        }, [statsData, userRole, formatCurrency]);

        // Título Dinâmico
        const dashboardTitle = useMemo(() => {
            switch (userRole) {
                case 'admin': return 'Dashboard Administrativo';
                case 'teacher': return 'Dashboard do Professor';
                case 'student': return 'Dashboard do Aluno';
                case 'guardian':
                case 'responsible': return 'Dashboard do Responsável';
                default: return 'Dashboard';
            }
        }, [userRole]);

        // 3. Renderização dos Cards Laterais (2x1)
        const renderSideCards = () => {
        // --- ADMIN ---
        if (userRole === 'admin') {
        const adminData = statsData as AdminDashboardStats;
        
        return (
            <>
                {/* Atividades Recentes - (Vazio se não houver API, pois não há mock) */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Atividades Recentes
                        </h2>
                        
                        {/* BOTÃO 1: Funcional com Efeitos Visuais (Cursor + Animação) */}
                        <button 
                            className="text-sm text-indigo-600 font-medium transition-all hover:text-indigo-800 hover:scale-[1.05] cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                            onClick={() => {
                                navigate('/announcements'); 
                            }}
                        >
                            Ver tudo
                        </button>
                        
                    </div>
                    <p className="text-slate-500 text-sm">Dados de atividades recentes não disponíveis (API /activities não implementada).</p>
                </div>

                {/* Próximos Eventos - (Usando a API /events) */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                    {/* ESTRUTURA MODIFICADA PARA ACOMODAR O BOTÃO */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            Próximos Eventos
                        </h2>
                        
                        {/* BOTÃO 2: Funcional com Efeitos Visuais (Cursor + Animação) */}
                        <button 
                            className="text-sm text-purple-600 font-medium transition-all hover:text-purple-800 hover:scale-[1.05] cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                            onClick={() => {
                                // Rota para a lista completa de eventos
                                navigate('/events'); 
                            }}
                        >
                            Ver tudo
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {upcomingEvents && upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event: Event) => (
                                <div key={event.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50/50 rounded-xl border border-indigo-100/50 hover:shadow-md transition-all cursor-default group">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-semibold text-indigo-900 group-hover:text-indigo-700">{event.title}</p>
                                        <span className="text-xs font-bold bg-white px-2 py-1 rounded text-indigo-600 shadow-sm">{new Date(event.startDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm">{event.description || event.type}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500">Nenhum evento futuro encontrado.</p>
                        )}
                    </div>
                </div>
            </>
        );
    }

            // --- TEACHER ---
            if (userRole === 'teacher') {
                const teacherData = statsData as TeacherDashboardStats;
                return (
                    <>
                        {/* Últimas Notas Lançadas (Professor) */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Últimas Notas Lançadas
                            </h2>
                            <div className="space-y-4">
                                {(teacherData.recentGrades && teacherData.recentGrades.length > 0) ? (
                                    teacherData.recentGrades.map((grade: Grade) => (
                                        <div key={grade.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50/50 rounded-xl border border-indigo-100/50 hover:shadow-md transition-all cursor-default group">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold text-indigo-900 group-hover:text-indigo-700">{grade.subjectName} - {grade.type}</p>
                                                <span className="text-xs font-bold bg-white px-2 py-1 rounded text-indigo-600 shadow-sm">{grade.value}/{grade.maxValue}</span>
                                            </div>
                                            <p className="text-slate-600 text-sm">{grade.studentName} | {new Date(grade.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500">Nenhuma nota recente encontrada.</p>
                                )}
                            </div>
                        </div>

                        {/* Próximo Compromisso (Professor) */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Clock4 className="w-5 h-5 text-amber-500" />
                                Próximo Compromisso
                            </h2>
                            <div className="space-y-4">
                                {teacherData.nextClass ? (
                                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-xl border border-amber-100/50 hover:shadow-md transition-all cursor-default group">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-amber-900 group-hover:text-amber-700">Aula de {teacherData.nextClass.name}</p>
                                            <span className="text-xs font-bold bg-white px-2 py-1 rounded text-amber-600 shadow-sm">{teacherData.nextClass.time}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm">Turma: {teacherData.nextClass.name} | ID: {teacherData.nextClass.id}</p>
                                    </div>
                                ) : (
                                    <p className="text-slate-500">Nenhuma aula programada em breve.</p>
                                )}
                                {teacherData.assignmentsPending && teacherData.assignmentsPending > 0 && (
                                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50/50 rounded-xl border border-red-100/50 hover:shadow-md transition-all cursor-default group">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-red-900 group-hover:text-red-700">Lançamento de Notas</p>
                                            <span className="text-xs font-bold bg-white px-2 py-1 rounded text-red-600 shadow-sm">Urgente</span>
                                        </div>
                                        <p className="text-slate-600 text-sm">{teacherData.assignmentsPending} tarefas/avaliações aguardando notas.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                );
            }

            // --- STUDENT / GUARDIAN / RESPONSIBLE ---
            if (userRole === 'student' || userRole === 'guardian' || userRole === 'responsible') {
                const studentData = statsData as StudentDashboardStats;
                return (
                    <>
                        {/* Próximas Provas (Aluno/Responsável) */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                Próximas Provas
                            </h2>
                            <div className="space-y-4">
                                {(studentData.upcomingExams && studentData.upcomingExams.length > 0) ? (
                                    studentData.upcomingExams.map((exam: any, index: number) => (
                                        <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50/50 rounded-xl border border-indigo-100/50 hover:shadow-md transition-all cursor-default group">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold text-indigo-900 group-hover:text-indigo-700">{exam.subject}</p>
                                                <span className="text-xs font-bold bg-white px-2 py-1 rounded text-indigo-600 shadow-sm">{new Date(exam.date).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <p className="text-slate-600 text-sm">Preparação para a prova.</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500">Nenhuma prova futura encontrada.</p>
                                )}
                            </div>
                        </div>

                        {/* Últimas Notas Lançadas (Aluno/Responsável) */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-500" />
                                Notas Mais Recentes
                            </h2>
                            <div className="space-y-4">
                                {(studentData.recentGrades && studentData.recentGrades.length > 0) ? (
                                    studentData.recentGrades.map((grade: Grade) => (
                                        <div key={grade.id} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-xl border border-emerald-100/50 hover:shadow-md transition-all cursor-default group">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold text-emerald-900 group-hover:text-emerald-700">{grade.subjectName}</p>
                                                <span className="text-xs font-bold bg-white px-2 py-1 rounded text-emerald-600 shadow-sm">{grade.value}/{grade.maxValue}</span>
                                            </div>
                                            <p className="text-slate-600 text-sm">Tipo: {grade.type}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500">Nenhuma nota recente encontrada.</p>
                                )}
                            </div>
                        </div>
                    </>
                );
            }

            return null;
        };

        // --- RENDERIZAÇÃO FINAL (LAYOUT) ---
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* 1. Header Dinâmico */}
                {/* Conteúdo idêntico ao original */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{dashboardTitle}</h1>
                        <p className="text-slate-500 mt-1">Visão geral em tempo real da sua instituição</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* 2. Stats Grid Dinâmico */}
                {/* Conteúdo idêntico ao original, usando o array 'stats'*/}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="group relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl shadow-indigo-100/20 hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-500 group-hover:bg-white transition-colors">
                                        {stat.action ? 'Acessar' : '+2.5%'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 3. Cards Laterais Dinâmicos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderSideCards()}
                </div>
            </div>
        );
    }