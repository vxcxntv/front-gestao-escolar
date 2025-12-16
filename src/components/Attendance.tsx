import { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle2, XCircle, Clock, Save,
  ArrowLeft, Users, BookOpen, Loader2, AlertCircle, GraduationCap, Plus, Edit2, Trash2, X
} from 'lucide-react';
import { attendanceService, AttendanceStatus } from '../services/attendanceService';
import { classesService } from '../services/classesService';
import { subjectsService } from '../services/subjectsService';
import { studentsService } from '../services/studentsService';
import { format } from 'date-fns';

interface StudentRow {
  id: string;
  name: string;
  status: AttendanceStatus;
  notes: string;
}

interface ClassView {
  id: string;
  name: string;
  studentsCount: number;
  teacherName: string;
  academicYear: string;
}

export function AttendancePage() {
  const [view, setView] = useState<'classes' | 'sheet'>('classes');
  const [selectedClass, setSelectedClass] = useState<ClassView | null>(null);

  const [classes, setClasses] = useState<ClassView[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  // Filtro de Turmas
  const [classSearch, setClassSearch] = useState('');

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [classesData, subjectsData, allStudents] = await Promise.all([
        classesService.getClasses({ limit: 100 }),
        subjectsService.getSubjects({ limit: 100 }),
        studentsService.getAll()
      ]);

      const adaptedClasses = (Array.isArray(classesData) ? classesData : []).map((c: any) => {
        const count = Array.isArray(allStudents)
          ? allStudents.filter(s => s.class && s.class.trim() === c.name.trim()).length
          : 0;

        return {
          id: c.id,
          name: c.name,
          studentsCount: count,
          teacherName: c.teacher?.name || 'Sem Professor',
          academicYear: c.academic_year?.toString() || new Date().getFullYear().toString()
        };
      });

      setClasses(adaptedClasses);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

      if (subjectsData.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsData[0].id);
      }

    } catch (error) {
      console.error("Erro ao carregar dados iniciais", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClass = (cls: ClassView) => {
    setSelectedClass(cls);
    setView('sheet');
  };

  useEffect(() => {
    if (view === 'sheet' && selectedClass) {
      loadSheetData();
    }
  }, [view, selectedClass, selectedDate, selectedSubject]);

  const loadSheetData = async () => {
    if (!selectedClass) return;
    setIsLoading(true);

    try {
      const enrolledStudents = await classesService.getEnrolledStudents(selectedClass.id);

      let currentRows: StudentRow[] = enrolledStudents.map((s: any) => ({
        id: s.id || s.studentId,
        name: s.name || s.student?.name || 'Aluno Sem Nome',
        status: 'present',
        notes: ''
      }));

      if (selectedSubject) {
        const history = await attendanceService.getAll({
          classId: selectedClass.id,
          subjectId: selectedSubject,
          dateFrom: selectedDate,
          limit: 100
        });

        currentRows = currentRows.map(student => {
          const record = history.find((r: any) => {
            const recordDate = typeof r.date === 'string' ? r.date.split('T')[0] : '';
            return r.studentId === student.id && recordDate === selectedDate;
          });

          if (record) {
            return {
              ...student,
              status: record.status,
              notes: record.notes || ''
            };
          }
          return student;
        });
      }
      setStudents(currentRows);
    } catch (error) {
      console.error("Erro ao carregar pauta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, notes: note } : s));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  const handleSaveCall = async () => {
    if (!selectedSubject) return alert("Selecione uma disciplina!");
    if (!selectedClass) return;

    setIsSaving(true);
    try {
      const payload = {
        date: selectedDate,
        classId: selectedClass.id,
        subjectId: selectedSubject,
        presences: students.map(s => ({
          studentId: s.id,
          status: s.status,
          notes: s.notes || undefined
        }))
      };

      await attendanceService.create(payload);
      await loadSheetData();
      alert(`✅ Chamada salva com sucesso!`);

    } catch (error: any) {
      console.error(error);
      alert("Erro ao salvar: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Filtro de Turmas
  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(classSearch.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(classSearch.toLowerCase())
  );

  // --- VIEW: CLASSES (DASHBOARD) ---
  if (view === 'classes') {
    return (
      <div className="animate-in fade-in duration-500 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Diário de Classe</h1>
            <p className="text-slate-500 mt-1">Selecione uma turma para realizar a chamada</p>
          </div>
          {/* Botão Novo Registro removido daqui para focar na seleção de turma */}
        </div>

        {/* Barra de Busca (Estilo Classes) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            placeholder="Buscar turmas por nome ou professor..."
            value={classSearch}
            onChange={(e) => setClassSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls)}
                className="group flex flex-col items-start bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-indigo-100/10 hover:shadow-xl hover:shadow-indigo-200/20 hover:-translate-y-1 transition-all duration-300 w-full text-left relative overflow-hidden"
              >
                <div className="flex w-full justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {cls.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg border border-indigo-100">
                    {cls.academicYear}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1">{cls.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{cls.teacherName}</p>

                <div className="flex items-center gap-2 text-slate-500 text-sm mt-auto">
                  <Users className="w-4 h-4" />
                  <span>{cls.studentsCount} Alunos</span>
                </div>

                {/* Barra de Progresso Animada */}
                <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-0 group-hover:w-full transition-all duration-700 ease-out" />
                </div>
              </button>
            ))}
            {filteredClasses.length === 0 && (
              <div className="col-span-3 text-center py-10 text-slate-500">Nenhuma turma encontrada.</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: SHEET (CHAMADA) ---
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6 pb-24">
      {/* Header Fixo */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg rounded-2xl p-6 sticky top-4 z-20">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            <button onClick={() => setView('classes')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedClass?.name}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {students.length} Alunos</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {selectedClass?.teacherName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 ml-1">Data da Aula</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 ml-1">Disciplina</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer min-w-[200px]"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="" disabled>Selecione...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Presença */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100/50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-700 ml-2">Lista de Presença</h3>
          <button onClick={markAllPresent} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors">
            Marcar Todos Presentes
          </button>
        </div>

        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold text-left">
                <tr>
                  <th className="px-6 py-4 w-1/3">Aluno</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 w-1/3">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${student.status === 'absent' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {student.name.charAt(0)}
                        </div>
                        <span className={`font-medium ${student.status === 'absent' ? 'text-red-600' : 'text-slate-700'}`}>{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        {[
                          { val: 'present', icon: CheckCircle2, label: 'P', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
                          { val: 'absent', icon: XCircle, label: 'F', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
                          { val: 'late', icon: Clock, label: 'A', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => handleStatusChange(student.id, opt.val as AttendanceStatus)}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-200 ${student.status === opt.val ? `${opt.bg} ${opt.color} ${opt.border} scale-110 shadow-sm` : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200 opacity-60 hover:opacity-100'}`}
                            title={opt.label}
                          >
                            <opt.icon className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Adicionar nota..."
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none text-sm py-1 text-slate-600 placeholder-slate-300 transition-all"
                        value={student.notes}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={handleSaveCall}
          disabled={isSaving || isLoading || !selectedSubject}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center gap-3 font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {isSaving ? 'Salvando...' : 'Salvar Chamada'}
        </button>
      </div>
    </div>
  );
}