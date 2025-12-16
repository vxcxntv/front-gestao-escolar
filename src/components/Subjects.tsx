import { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Plus, Clock, Edit2, Trash2,
  Search, Download, Loader2, AlertCircle
} from 'lucide-react';
import { subjectsService } from '../services/subjectsService';
import { Subject } from '../types/index';
// Import do componente de UI compartilhado
import { MetricCard } from './ui/metricCard';

export function SubjectsPage() {
  const currentYear = new Date().getFullYear().toString();

  // --- ESTADOS ---
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth' | 'connection'>('none');

  const [searchTerm, setSearchTerm] = useState('');

  // Modais e Edição
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulário
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: '',
    description: '',
    gradeYear: currentYear
  });

  // --- CARREGAMENTO ---
  const loadSubjects = async () => {
    setIsLoading(true);
    setErrorType('none');
    try {
      const data = await subjectsService.getSubjects({ limit: 100 });
      let filteredData = Array.isArray(data) ? data : [];

      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filteredData = filteredData.filter(s =>
          s.name.toLowerCase().includes(lowerTerm) ||
          s.code.toLowerCase().includes(lowerTerm)
        );
      }

      setSubjects(filteredData);
    } catch (error: any) {
      console.error('Erro ao carregar:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setErrorType('auth');
      } else {
        setErrorType('connection');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [searchTerm]);

  // --- HANDLERS (CRUD) ---

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', code: '', credits: '', description: '', gradeYear: currentYear });
    setShowModal(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      code: subject.code,
      credits: subject.credits.toString(),
      description: subject.description || '',
      gradeYear: subject.year?.toString() || currentYear
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta disciplina?")) return;
    try {
      await subjectsService.deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      alert("Erro ao excluir. Verifique se há turmas vinculadas.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        credits: Number(formData.credits),
        description: formData.description,
        year: Number(formData.gradeYear)
      };

      if (editingId) {
        await subjectsService.updateSubject(editingId, payload);
        alert("Disciplina atualizada!");
      } else {
        await subjectsService.createSubject(payload);
        alert("Disciplina criada!");
      }

      setShowModal(false);
      loadSubjects();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar. Verifique o console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportClick = () => {
    const header = ["Nome", "Código", "Créditos", "Ano", "Descrição"];
    let csvContent = header.join(",") + "\n";
    const rows = subjects.map(s => [
      `"${s.name}"`, `"${s.code}"`, s.credits, s.year, `"${s.description || ''}"`
    ]);
    csvContent += rows.map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `disciplinas_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CONFIGURAÇÃO DOS CARDS (METRICS) ---
  // Apenas "Total" e "Carga Horária", usando o MetricCard
  const stats = [
    {
      title: 'Total',
      value: subjects.length.toString(),
      subtitle: 'Disciplinas Cadastradas',
      icon: BookOpen,
      colorTheme: 'blue' as const
    },
    {
      title: 'Carga Horária Total',
      value: subjects.reduce((acc, curr) => acc + curr.credits, 0).toString() + 'h',
      subtitle: 'Soma de créditos da grade',
      icon: Clock,
      colorTheme: 'emerald' as const
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Disciplinas</h1>
          <p className="text-slate-500 mt-1">Gestão do currículo e grade curricular</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNew}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Nova Disciplina</span>
          </button>
        </div>
      </div>

      {/* Stats Cards (Usando MetricCard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Alerta de Erro */}
      {errorType !== 'none' && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 backdrop-blur-md shadow-sm ${errorType === 'auth' ? 'bg-amber-50/80 border-amber-200 text-amber-800' : 'bg-red-50/80 border-red-200 text-red-800'
          }`}>
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">{errorType === 'auth' ? 'Acesso Negado' : 'Erro de Conexão'}</h4>
            <p className="text-sm opacity-90 mt-1">
              {errorType === 'auth' ? 'Sessão expirada.' : 'Não foi possível carregar as disciplinas.'}
            </p>
          </div>
        </div>
      )}

      {/* Container Principal */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/10 overflow-hidden flex flex-col">

        {/* Barra de Ferramentas */}
        <div className="p-6 border-b border-slate-100/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportClick} className="px-4 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>
        </div>

        {/* Tabela */}
        {isLoading ? (
          <div className="p-20 flex justify-center items-center flex-col gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <span className="text-slate-500 font-medium">Carregando disciplinas...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold tracking-wider text-left">
                <tr>
                  <th className="px-6 py-4">Disciplina</th>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Créditos</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{subject.name}</p>
                          {subject.year && <p className="text-xs text-slate-500">Grade: {subject.year}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {subject.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{subject.credits}h</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 max-w-xs truncate">
                        {subject.description || <span className="italic opacity-50">Sem descrição</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      Nenhuma disciplina encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-200" />
                {editingId ? 'Editar Disciplina' : 'Nova Disciplina'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {editingId && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-sm text-slate-500">Código da Disciplina:</span>
                  <span className="font-mono font-bold text-slate-700">{formData.code}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ano da Grade</label>
                <input type="number" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" value={formData.gradeYear} onChange={e => setFormData({ ...formData, gradeYear: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da Disciplina</label>
                <input type="text" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Créditos (Horas)</label>
                <input type="number" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
                <textarea rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Salvar Alterações' : 'Criar Disciplina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}