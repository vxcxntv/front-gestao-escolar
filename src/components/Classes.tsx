import React, { useState, useEffect } from 'react';
import {
  Plus, Users, BookOpen, Edit2, Trash2, Calendar,
  Loader2, AlertCircle, Book, Check, X
} from 'lucide-react';
import { classesService } from '../services/classesService';
import { studentsService } from '../services/studentsService';
import { subjectsService } from '../services/subjectsService';
import type { User } from '../types';

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface ClassView {
  id: string;
  name: string;
  grade: string;
  teacherName: string;
  teacherId?: string;
  studentsCount: number;
  subjects?: Subject[];
}

export function Classes() {
  const [showModal, setShowModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dados
  const [classes, setClasses] = useState<ClassView[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]); // Todas as disciplinas para o modal

  // Estado de Seleção
  const [selectedClass, setSelectedClass] = useState<ClassView | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth' | 'connection'>('none');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    teacherId: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorType('none');
      setErrorMessage('');

      // 1. Busca Turmas, Professores, Alunos e Disciplinas em paralelo
      const [classesData, teachersList, allStudents, subjectsList] = await Promise.all([
        classesService.getClasses({ page: 1, limit: 100 }),
        studentsService.getTeachers(),
        studentsService.getAll(),
        subjectsService.getSubjects({ limit: 100 })
      ]);

      setTeachers(teachersList || []);
      setAllSubjects(subjectsList || []);

      // 2. Processa as turmas
      const adaptedClasses: ClassView[] = classesData.map((cls: any) => {
        // Cálculo Real da Quantidade de Alunos
        const count = allStudents.filter(s =>
          s.class && s.class.trim() === cls.name.trim()
        ).length;

        return {
          id: cls.id,
          name: cls.name,
          grade: cls.academic_year?.toString() || new Date().getFullYear().toString(),
          teacherName: cls.teacher?.name || 'Sem Professor',
          teacherId: cls.teacherId,
          studentsCount: count,
          subjects: cls.subjects || []
        };
      });

      setClasses(adaptedClasses);

    } catch (err: any) {
      console.error("Erro API Classes:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setErrorType('auth');
        setErrorMessage('Sessão expirada. Faça login novamente.');
      } else {
        setErrorType('connection');
        setErrorMessage('Não foi possível carregar os dados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade.includes(searchTerm)
  );

  // --- HANDLERS DE CRUD ---

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      grade: new Date().getFullYear().toString(),
      teacherId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (cls: ClassView) => {
    setEditingId(cls.id);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      teacherId: cls.teacherId || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        academic_year: parseInt(formData.grade),
        teacherId: formData.teacherId
      };

      if (editingId) {
        await classesService.update(editingId, payload);
        alert("✅ Turma atualizada!");
      } else {
        await classesService.create(payload);
        alert("✅ Turma criada!");
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert("Erro ao salvar: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta turma?")) return;
    try {
      await classesService.delete(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  // --- HANDLERS DE DISCIPLINAS (VÍNCULO) ---

  const handleManageSubjects = (cls: ClassView) => {
    setSelectedClass(cls);
    setShowSubjectModal(true);
  };

  const toggleSubject = async (subjectId: string, isLinked: boolean) => {
    if (!selectedClass) return;

    try {
      // 1. Chama API
      if (isLinked) {
        await classesService.removeSubject(selectedClass.id, subjectId);
      } else {
        await classesService.addSubject(selectedClass.id, subjectId);
      }

      // 2. Atualiza Estado Local (Optimistic Update)
      const subjectObj = allSubjects.find(s => s.id === subjectId);
      if (!subjectObj) return;

      const updatedClasses = classes.map(c => {
        if (c.id === selectedClass.id) {
          const currentSubjects = c.subjects || [];
          const newSubjects = isLinked
            ? currentSubjects.filter(s => s.id !== subjectId)
            : [...currentSubjects, subjectObj];

          // Atualiza também o objeto selecionado para o modal refletir a mudança
          const updatedClass = { ...c, subjects: newSubjects };
          if (selectedClass.id === c.id) setSelectedClass(updatedClass);

          return updatedClass;
        }
        return c;
      });

      setClasses(updatedClasses);

    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar disciplina da turma.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Turmas</h1>
          <p className="text-slate-500 mt-1">Gerenciamento de salas e grades horárias</p>
        </div>
        <button
          onClick={handleAddNew}
          className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-medium">Nova Turma</span>
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          placeholder="Buscar turmas por nome, professor ou ano..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Alerta de Erro */}
      {errorType !== 'none' && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 backdrop-blur-md shadow-sm ${errorType === 'auth' ? 'bg-amber-50/80 border-amber-200 text-amber-800' : 'bg-red-50/80 border-red-200 text-red-800'
          }`}>
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Atenção</h4>
            <p className="text-sm opacity-90 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Grid de Cards */}
      {isLoading ? (
        <div className="p-20 flex justify-center items-center flex-col gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <span className="text-slate-500 font-medium">Carregando turmas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="group bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-indigo-100/10 hover:shadow-xl hover:shadow-indigo-200/20 hover:-translate-y-1 transition-all duration-300">

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                    {cls.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{cls.name}</h3>
                    <p className="text-sm text-indigo-600 font-medium">Ano: {cls.grade}</p>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleManageSubjects(cls)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Gerenciar Disciplinas"
                  >
                    <Book className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(cls)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600 bg-white/50 p-2.5 rounded-xl border border-slate-100/50">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium">{cls.studentsCount} Alunos</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-white/50 p-2.5 rounded-xl border border-slate-100/50">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium truncate">{cls.teacherName}</span>
                </div>

                {/* Resumo de Disciplinas */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Disciplinas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.subjects && cls.subjects.length > 0 ? (
                      cls.subjects.slice(0, 3).map(s => (
                        <span key={s.id} className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 font-medium">
                          {s.code || s.name.substring(0, 15)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Nenhuma disciplina vinculada</span>
                    )}
                    {cls.subjects && cls.subjects.length > 3 && (
                      <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-400 rounded-md border border-slate-200">
                        +{cls.subjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-0 group-hover:w-full transition-all duration-700 ease-out" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar Turma */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-200" />
                {editingId ? 'Editar Turma' : 'Nova Turma'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da Turma</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 3º Ano A"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ano Letivo</label>
                <input
                  type="number"
                  required
                  placeholder="2025"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Professor</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer transition-all"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Salvar Alterações' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Disciplinas */}
      {showSubjectModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSubjectModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg flex gap-2"><Book className="w-5 h-5" /> Disciplinas da Turma</h2>
              <button onClick={() => setShowSubjectModal(false)} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Selecione quais disciplinas serão lecionadas na turma <strong>{selectedClass.name}</strong>.
              </p>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {allSubjects.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Nenhuma disciplina cadastrada.</p>}

                {allSubjects.map(subject => {
                  const isLinked = selectedClass.subjects?.some((s) => s.id === subject.id);
                  return (
                    <div
                      key={subject.id}
                      onClick={() => toggleSubject(subject.id, !!isLinked)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isLinked
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                    >
                      <div>
                        <p className={`font-semibold text-sm ${isLinked ? 'text-emerald-800' : 'text-slate-700'}`}>{subject.name}</p>
                        <p className="text-xs text-slate-400">{subject.code}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isLinked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                        }`}>
                        {isLinked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowSubjectModal(false)} className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium">Concluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}