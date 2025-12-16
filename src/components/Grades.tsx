import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Download, ChevronDown, ChevronRight, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';
import { studentsService } from '../services/studentsService';
import { gradesService } from '../services/gradesService';
import { subjectsService } from '../services/subjectsService';
import { classesService } from '../services/classesService';
import { User } from '../types';

interface Subject { id: string; name: string; }
interface GradeView {
  id: string; 
  studentName: string; enrollment: string; class: string; subject: string;
  grade1: number; grade2: number; grade3: number; grade4: number; average: number;
}

export function Grades() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- DADOS DA API ---
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]); 
  const [allStudents, setAllStudents] = useState<User[]>([]);

  // --- FILTROS DA TELA ---
  const [filterClassId, setFilterClassId] = useState(''); 
  const [filterSubjectId, setFilterSubjectId] = useState('');
  
  // Controle de Interface (Accordions)
  const [expandedClasses, setExpandedClasses] = useState<string[]>([]);

  // Dados Processados
  const [gradesData, setGradesData] = useState<GradeView[]>([]);
  
  // Loadings
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth' | 'connection'>('none');

  // --- MODAL ---
  const [modalClassId, setModalClassId] = useState('');
  const [formData, setFormData] = useState({
    studentId: '', subjectId: '', value: '', description: '1º Bimestre'
  });

  // 1. CARREGAMENTO INICIAL
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingInitial(true);
        const [subsData, classesData, studentsData] = await Promise.all([
            subjectsService.getSubjects({ limit: 100 }),
            classesService.getClasses({ limit: 100 }),
            studentsService.getAll()
        ]);
        setAllSubjects(subsData || []);
        setClassesList(classesData || []);
        setAllStudents(studentsData || []);
      } catch (err) {
        console.error("Erro inicial", err);
        setErrorType('connection');
      } finally {
        setIsLoadingInitial(false);
      }
    };
    loadInitialData();
  }, []);

  // 2. FILTRO DE MATÉRIAS (Depende da Turma selecionada)
  const availableSubjectsFilter = useMemo(() => {
    if (!filterClassId) return [];
    const selectedClass = classesList.find(c => c.id === filterClassId);
    return selectedClass?.subjects || [];
  }, [filterClassId, classesList]);

  // Limpa a matéria e fecha accordion se mudar a turma
  useEffect(() => {
    setFilterSubjectId(''); 
    setGradesData([]); 
    setExpandedClasses([]); 
  }, [filterClassId]);

  // 3. BUSCA NOTAS
  const fetchGrades = async () => {
    if (!filterClassId || !filterSubjectId) return;

    try {
      setIsLoadingGrades(true);
      setErrorType('none');

      // Atualiza alunos
      const students = await studentsService.getAll(); 
      setAllStudents(students);

      const currentClassObj = classesList.find(c => c.id === filterClassId);
      const currentSubjectObj = allSubjects.find(s => s.id === filterSubjectId);

      if (!currentClassObj) return;

      // Expandir o accordion da turma selecionada automaticamente
      setExpandedClasses([currentClassObj.name]);

      // --- FILTRO RIGOROSO ---
      const classStudents = students.filter((student: any) => 
        student.class && student.class === currentClassObj.name
      );

      const processedGrades: GradeView[] = classStudents.map((student: any) => {
        const notes = student.grades || [];
        const findGrade = (term: string) => {
          const note = notes.find((n: any) => 
            n.description && n.description.toLowerCase().includes(term.toLowerCase()) &&
            n.subjectId === filterSubjectId 
          );
          return note ? parseFloat(note.value) : 0;
        };
        const g1 = findGrade('1º');
        const g2 = findGrade('2º');
        const g3 = findGrade('3º');
        const g4 = findGrade('4º');
        const validGrades = [g1, g2, g3, g4].filter(g => g > 0);
        const sum = validGrades.reduce((a, b) => a + b, 0);
        const avg = validGrades.length > 0 ? sum / validGrades.length : 0;

        return {
          id: student.id,
          studentName: student.name,
          enrollment: student.enrollment || 'N/A',
          class: currentClassObj.name,
          subject: currentSubjectObj?.name || 'Disciplina',
          grade1: g1, grade2: g2, grade3: g3, grade4: g4, average: avg
        };
      });

      setGradesData(processedGrades);
    } catch (err: any) {
      console.error("Erro API Grades:", err);
      setErrorType('connection');
    } finally {
      setIsLoadingGrades(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [filterClassId, filterSubjectId]);

  // Filtros de Texto
  const filteredGrades = gradesData.filter(grade => {
    const term = searchTerm.toLowerCase();
    return grade.studentName.toLowerCase().includes(term) || 
           grade.enrollment.includes(term);
  });

  const gradesByClass = filteredGrades.reduce((acc, grade) => {
    if (!acc[grade.class]) acc[grade.class] = [];
    acc[grade.class].push(grade);
    return acc;
  }, {} as Record<string, GradeView[]>);

  const visibleClasses = Object.entries(gradesByClass);

  const toggleClass = (className: string) => {
    setExpandedClasses(prev =>
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  // --- MODAL HANDLERS ---
  const handleModalOpen = () => {
    setModalClassId('');
    setFormData({ studentId: '', subjectId: '', value: '', description: '1º Bimestre' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subjectId || !formData.value) {
      alert("Preencha todos os campos."); return;
    }
    setIsSaving(true);
    try {
      await gradesService.create({
        studentId: formData.studentId, subjectId: formData.subjectId,
        value: parseFloat(formData.value), description: formData.description
      });
      setShowModal(false);
      alert("Nota lançada com sucesso!");
      fetchGrades(); 
    } catch (err) {
      console.error(err);
      alert("Erro ao lançar nota.");
    } finally {
      setIsSaving(false);
    }
  };

  const getGradeColor = (avg: number) => {
    if (avg >= 9) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (avg >= 7) return 'text-indigo-700 bg-indigo-100 border-indigo-200';
    if (avg >= 5) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-rose-700 bg-rose-100 border-rose-200';
  };

  const getClassAverage = (classGrades: GradeView[]) => {
    const sum = classGrades.reduce((acc, grade) => acc + grade.average, 0);
    return classGrades.length > 0 ? (sum / classGrades.length).toFixed(2) : '0.00';
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Notas e Avaliações</h1>
          <p className="text-slate-500 mt-1">Selecione uma turma e disciplina para visualizar</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/50 backdrop-blur-md text-slate-600 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-white transition-all shadow-sm">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Exportar</span>
          </button>
          <button onClick={handleModalOpen} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Lançar Notas</span>
          </button>
        </div>
      </div>

      {/* --- BARRA DE FILTROS REORGANIZADA --- */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/10 p-6 space-y-4">
        
        {/* Linha 1: Turma e Disciplina (Mesmo Tamanho) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro Turma */}
            <div>
              <select 
                className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer text-slate-700"
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                disabled={isLoadingInitial}
              >
                <option value="">Selecione a Turma</option>
                {classesList.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro Matéria */}
            <div>
              <select 
                className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer disabled:bg-slate-100/50 disabled:text-slate-400 text-slate-700"
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                disabled={!filterClassId} 
              >
                <option value="">
                  {!filterClassId ? 'Aguardando Turma...' : 'Selecione a Disciplina'}
                </option>
                {availableSubjectsFilter.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
        </div>

        {/* Linha 2: Busca por Nome (Largura Total) */}
        <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar aluno por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!filterClassId || !filterSubjectId}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60"
            />
        </div>

      </div>

      {/* --- ÁREA DE CONTEÚDO (Visual de Accordions) --- */}
      {errorType !== 'none' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>Erro de conexão.</p>
        </div>
      )}

      {(isLoadingInitial || isLoadingGrades) ? (
        <div className="p-20 flex justify-center items-center flex-col gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <span className="text-slate-500 font-medium">Carregando dados...</span>
        </div>
      ) : (
        <div className="space-y-4">
          
          {(!filterClassId || !filterSubjectId) && (
            <div className="text-center p-10 text-slate-400 bg-white/50 rounded-2xl border border-white/60 border-dashed">
               <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p>Selecione uma <strong>Turma</strong> e uma <strong>Disciplina</strong> acima para ver as notas.</p>
            </div>
          )}

          {filterClassId && filterSubjectId && visibleClasses.length === 0 && (
             <div className="text-center p-10 text-slate-500">
                Nenhum aluno encontrado nesta turma.
             </div>
          )}

          {visibleClasses.map(([className, classGrades]) => {
              const isExpanded = expandedClasses.includes(className);
              const classAverage = getClassAverage(classGrades);

              return (
                <div key={className} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg shadow-indigo-100/10 overflow-hidden transition-all duration-300 hover:shadow-xl">
                  {/* Cabeçalho do Cartão */}
                  <button
                    onClick={() => toggleClass(className)}
                    className={`w-full px-6 py-5 flex items-center justify-between transition-colors ${isExpanded ? 'bg-indigo-50/50' : 'hover:bg-white/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-800">{className}</h3>
                        <p className="text-sm text-slate-500 font-medium">{classGrades.length} alunos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Média</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(parseFloat(classAverage))}`}>
                          {classAverage}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Tabela Expandida */}
                  {isExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50/50 border-y border-slate-100">
                            <tr className="text-slate-500 text-xs uppercase font-semibold tracking-wider text-left">
                              <th className="px-6 py-3">Estudante</th>
                              <th className="px-6 py-3">Disciplina</th>
                              <th className="px-6 py-3 text-center">1º Bim</th>
                              <th className="px-6 py-3 text-center">2º Bim</th>
                              <th className="px-6 py-3 text-center">3º Bim</th>
                              <th className="px-6 py-3 text-center">4º Bim</th>
                              <th className="px-6 py-3 text-center">Média</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/50">
                            {classGrades.map((grade) => (
                              <tr key={grade.id} className="hover:bg-indigo-50/20 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-slate-800">{grade.studentName}</div>
                                  <div className="text-xs text-slate-400">Mat: {grade.enrollment}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{grade.subject}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{grade.grade1 > 0 ? grade.grade1 : '-'}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{grade.grade2 > 0 ? grade.grade2 : '-'}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{grade.grade3 > 0 ? grade.grade3 : '-'}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{grade.grade4 > 0 ? grade.grade4 : '-'}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(grade.average)}`}>
                                    {grade.average.toFixed(2)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
          })}
        </div>
      )}

      {/* --- MODAL --- */}
      {showModal && (
        <ModalLancamento 
           onClose={() => setShowModal(false)} 
           classesList={classesList}
           allStudents={allStudents}
           onSubmit={handleSubmit}
           formData={formData}
           setFormData={setFormData}
           isSaving={isSaving}
           modalClassId={modalClassId}
           setModalClassId={setModalClassId}
        />
      )}
    </div>
  );
}

// Subcomponente do Modal
function ModalLancamento({ onClose, classesList, allStudents, onSubmit, formData, setFormData, isSaving, modalClassId, setModalClassId }: any) {
    const modalAvailableSubjects = useMemo(() => {
        if (!modalClassId) return [];
        const selectedClass = classesList.find((c: any) => c.id === modalClassId);
        return selectedClass?.subjects || [];
    }, [modalClassId, classesList]);

    const modalAvailableStudents = useMemo(() => {
        if (!modalClassId) return [];
        const selectedClass = classesList.find((c: any) => c.id === modalClassId);
        if (!selectedClass) return [];
        return allStudents.filter((s: User) => s.class === selectedClass.name);
    }, [modalClassId, allStudents, classesList]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-200" /> Lançar Nota
              </h2>
              <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">&times;</button>
            </div>
            
            <form onSubmit={onSubmit} className="p-6 space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Turma</label>
                <select 
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={modalClassId}
                  onChange={(e) => {
                    setModalClassId(e.target.value);
                    setFormData({ ...formData, subjectId: '', studentId: '' });
                  }}
                >
                  <option value="">Selecione a turma...</option>
                  {classesList.map((cls:any) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
                <select 
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-100"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  disabled={!modalClassId}
                >
                  <option value="">{!modalClassId ? "Escolha a turma primeiro" : "Selecione a disciplina..."}</option>
                  {modalAvailableSubjects.map((s:any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aluno</label>
                <select 
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-100"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  disabled={!modalClassId}
                >
                  <option value="">{!modalClassId ? "Escolha a turma primeiro" : "Selecione o aluno..."}</option>
                  {modalAvailableStudents.map((s: User) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bimestre</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}>
                        <option>1º Bimestre</option>
                        <option>2º Bimestre</option>
                        <option>3º Bimestre</option>
                        <option>4º Bimestre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nota</label>
                    <input type="number" step="0.1" max="10" min="0" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} />
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium border border-slate-200">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-md flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
    )
}