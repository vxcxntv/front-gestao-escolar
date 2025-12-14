import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Plus, Filter, Clock, Edit, Trash2, Eye,
  GraduationCap, Search, Upload, Download, X, Save, SlidersHorizontal, Calendar, Loader2 
} from 'lucide-react'; 
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button'; 
import { subjectsService } from '../services/subjectsService';
import { Subject } from '../types/index';

export function SubjectsPage() {
  const currentYear = new Date().getFullYear().toString();

  // --- ESTADOS ---
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado de salvamento
  
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Formulário
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    credits: '', 
    description: '',
    gradeYear: currentYear 
  });
  
  // Filtros
  const [filters, setFilters] = useState({ 
    minCredits: '', 
    maxCredits: '', 
    onlyActive: false,
    year: currentYear 
  });
  
  const [activeFilters, setActiveFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSubjects();
  }, [page, limit, searchTerm, activeFilters]);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit, search: searchTerm || undefined };
      const response = await subjectsService.getSubjects(params);
      let data = response?.data || [];
      
      // Filtros locais (se o backend não suportar nativamente)
      if (activeFilters) {
         if (filters.minCredits) data = data.filter(s => s.credits >= Number(filters.minCredits));
         if (filters.maxCredits) data = data.filter(s => s.credits <= Number(filters.maxCredits));
         // if (filters.year) data = data.filter(s => s.year === Number(filters.year));
      }

      setSubjects(data);
      setTotalItems(response?.total || 0);
    } catch (error) {
      console.error('Erro ao carregar:', error);
      setSubjects([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => { setSearchTerm(value); setPage(1); };

  // --- FUNCIONALIDADES ---
  const handleImportClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    alert(`Arquivo "${file.name}" selecionado! Processando...`); 
    setTimeout(() => { alert("Importação concluída!"); loadSubjects(); }, 1000);
    event.target.value = '';
  };

  const handleExportClick = () => {
    const header = ["Nome", "Código", "Créditos", "Ano Grade", "Descrição"];
    let csvContent = header.join(",") + "\n";

    if (subjects.length > 0) {
        const rows = subjects.map(s => [
          `"${s.name}"`, `"${s.code}"`, s.credits, filters.year, `"${s.description || ''}"`
        ]);
        csvContent += rows.map(row => row.join(",")).join("\n");
    }
    
    try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `disciplinas_${filters.year}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) { alert("Erro ao baixar arquivo."); }
  };

  // --- SALVAR (CreateSubjectDto) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Prepara o payload conforme a interface CreateSubjectDto
      const payload = {
        name: formData.name,
        code: formData.code,
        credits: Number(formData.credits),
        description: formData.description,
        year: Number(formData.gradeYear) // Converte para number conforme DTO
      };

      await subjectsService.createSubject(payload);

      alert(`Disciplina "${formData.name}" cadastrada!`);
      setShowModal(false);
      setFormData({ name: '', code: '', credits: '', description: '', gradeYear: currentYear }); 
      loadSubjects();

    } catch (error) {
      console.error("Erro ao criar disciplina:", error);
      alert("Erro ao salvar. Verifique se o código já existe ou conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyFilters = () => { setActiveFilters(true); setShowFilterModal(false); loadSubjects(); };
  const handleClearFilters = () => { setFilters({ minCredits: '', maxCredits: '', onlyActive: false, year: currentYear }); setActiveFilters(false); setShowFilterModal(false); loadSubjects(); };

  // --- RENDER ---
  const columns = [
    { key: 'name', header: 'Disciplina', render: (v: string, r: Subject) => <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><BookOpen className="w-5 h-5 text-indigo-600" /></div><div><p className="font-bold text-slate-800">{v}</p><p className="text-sm text-slate-500">Código: {r.code}</p></div></div> },
    { key: 'code', header: 'Código' },
    { key: 'credits', header: 'Créditos', render: (v: number) => <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /><span className="font-medium">{v} horas</span></div> },
    { key: 'description', header: 'Descrição', render: (v: string) => <p className="text-sm text-slate-600 max-w-xs truncate">{v || 'Sem descrição'}</p> }
  ];
  const actions = [ { label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => {}, variant: 'default' as const }, { label: 'Excluir', icon: <Trash2 className="w-4 h-4" />, onClick: () => {}, variant: 'danger' as const } ];
  const stats = [ { label: 'Total de Disciplinas', value: totalItems.toString(), color: 'from-blue-500 to-cyan-400' }, { label: 'Média de Créditos', value: '4.2', color: 'from-emerald-500 to-teal-400' }, { label: 'Ativas Este Semestre', value: '24', color: 'from-purple-500 to-pink-400' }, { label: 'Com Professores', value: '22', color: 'from-amber-500 to-yellow-400' } ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.json,.xlsx" onChange={handleFileChange} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
        <div><h1 className="text-3xl font-bold text-slate-800 tracking-tight">Disciplinas</h1><p className="text-slate-500 mt-1">Gestão do currículo e grade curricular</p></div>
        <div className="flex items-center gap-3">
          <Button variant={activeFilters ? "primary" : "outline"} icon={Filter} onClick={() => setShowFilterModal(true)} className={activeFilters ? "bg-indigo-100 text-indigo-700 border-indigo-200" : ""}>{activeFilters ? `Filtros (${filters.year})` : "Filtros"}</Button>
          <button onClick={() => setShowModal(true)} className="cursor-pointer relative z-10 group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /><span>Nova Disciplina</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat, index) => (<div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl shadow-indigo-100/20"><p className="text-slate-500 text-sm font-medium mb-2">{stat.label}</p><div className="flex items-end justify-between"><h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} opacity-20`} /></div></div>))}
      </div>

      {/* Busca */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Buscar disciplinas por nome ou código..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Upload} onClick={handleImportClick}>Importar CSV</Button>
            <Button variant="outline" icon={Download} onClick={handleExportClick}>Exportar Grade</Button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="relative z-0">
        <DataTable columns={columns} data={subjects} totalItems={totalItems} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} onSearch={handleSearch} actions={actions} isLoading={isLoading} emptyMessage="Nenhuma disciplina encontrada" />
      </div>

      {/* Grade Preview */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-indigo-500" />Grade Curricular - {filters.year || currentYear}</h3>
        <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">Preview da Grade de {filters.year || currentYear}</div>
      </div>

      {/* MODAL NOVO */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 scale-100">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between shadow-md">
              <h2 className="text-white font-bold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-200" /> Nova Disciplina</h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Ano da Grade</label><input type="number" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.gradeYear} onChange={e => setFormData({...formData, gradeYear: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da Disciplina</label><input type="text" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Código</label><input type="text" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Créditos</label><input type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} /></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label><textarea className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Salvando...' : 'Criar Disciplina'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Filtros */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFilterModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 scale-100">
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100"><h2 className="text-slate-800 font-bold text-lg flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-indigo-600" /> Filtrar Disciplinas</h2><button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Ano da Grade</label><div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="number" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Ex: 2024" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} /></div></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Intervalo de Créditos</label><div className="flex items-center gap-3"><input type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Mín" value={filters.minCredits} onChange={e => setFilters({...filters, minCredits: e.target.value})} /><span className="text-slate-400">-</span><input type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Máx" value={filters.maxCredits} onChange={e => setFilters({...filters, maxCredits: e.target.value})} /></div></div>
                <div className="flex items-center gap-2"><input type="checkbox" id="activeOnly" checked={filters.onlyActive} onChange={e => setFilters({...filters, onlyActive: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300" /><label htmlFor="activeOnly" className="text-sm text-slate-700">Apenas disciplinas ativas</label></div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100"><button onClick={handleClearFilters} className="text-sm text-slate-500 hover:text-red-600 font-medium mr-auto">Limpar</button><button onClick={() => setShowFilterModal(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg">Cancelar</button><button onClick={handleApplyFilters} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md">Aplicar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}