import React, { useState, useEffect } from 'react';
import { Plus, Users, BookOpen, Edit2, Trash2, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { classesService } from '../services/classesService';
import { studentsService } from '../services/studentsService';
import type { User } from '../types';

interface ClassView {
  id: string;
  name: string;
  grade: string;
  teacherName: string;
  teacherId?: string;
  studentsCount: number;
  schedule?: string;
  room?: string;
}

export function Classes() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [classes, setClasses] = useState<ClassView[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth' | 'connection'>('none');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [editingId, setEditingId] = useState<string | null>(null);
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

      // 1. Busca Turmas, Professores e Alunos em paralelo
      const [classesData, teachersList, allStudents] = await Promise.all([
        classesService.getClasses({ page: 1, limit: 100 }),
        studentsService.getTeachers(),
        studentsService.getAll() // Buscamos alunos para calcular a contagem localmente
      ]);

      setTeachers(teachersList || []);

      // 2. Processa as turmas e calcula contagem
      const adaptedClasses: ClassView[] = classesData.map((cls: any) => {
        // Cálculo Real da Quantidade de Alunos
        // Filtramos a lista total de alunos verificando quem pertence a esta turma (pelo nome)
        const count = allStudents.filter(s =>
          s.class && s.class.trim() === cls.name.trim()
        ).length;

        return {
          id: cls.id,
          name: cls.name,
          grade: cls.academic_year?.toString() || new Date().getFullYear().toString(),
          teacherName: cls.teacher?.name || 'Sem Professor',
          teacherId: cls.teacherId,
          studentsCount: count, // Usa o contador calculado
          schedule: cls.schedule || '',
          room: cls.room || ''
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

  // --- HANDLERS ---
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
      fetchData(); // Recarrega para atualizar contadores e lista
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
          placeholder="Buscar turmas..."
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

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                    {cls.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{cls.name}</h3>
                    <p className="text-sm text-indigo-600 font-medium">Ano: {cls.grade}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => handleEdit(cls)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cls.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600 bg-white/50 p-3 rounded-xl border border-slate-100/50">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium">{cls.studentsCount} Alunos Matriculados</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-white/50 p-3 rounded-xl border border-slate-100/50">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium truncate">{cls.teacherName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Simplificado para brevidade, manter a estrutura do seu arquivo original */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar' : 'Nova'} Turma</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ano</label>
                <input type="number" className="w-full border p-2 rounded-lg" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Professor</label>
                <select className="w-full border p-2 rounded-lg" value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}