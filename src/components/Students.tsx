import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { studentsService } from '../services/studentsService';
import { classesService } from '../services/classesService'; // Importando serviço de turmas
import { User } from '../types';

export function Students() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Lógica de Integração ---
  const [students, setStudents] = useState<User[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]); // Estado para armazenar as turmas
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth' | 'connection'>('none');

  // Estado para Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '', // Armazena o NOME da turma (para compatibilidade com o backend atual)
    enrollment: '',
  });

  // Carrega lista de turmas para o select
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await classesService.getClasses();
        // Ordena alfabeticamente pelo nome da turma
        const sortedClasses = response.sort((a: any, b: any) => 
          a.name.localeCompare(b.name)
        );
        setClassesList(sortedClasses);
      } catch (error) {
        console.warn("Não foi possível carregar a lista de turmas", error);
      }
    };
    loadClasses();
  }, []);

  // Lógica de Matrícula Automática
  const generateNextEnrollment = (currentStudents: User[]) => {
    try {
        const enrollments = currentStudents
          .map(s => parseInt(s.enrollment || '0'))
          .filter(n => !isNaN(n) && n > 0);

        if (enrollments.length === 0) return '2025001';

        const maxEnrollment = Math.max(...enrollments);
        return (maxEnrollment + 1).toString();
    } catch (e) {
        return '2025001';
    }
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setErrorType('none');

      const data = await studentsService.getAll();

      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        setStudents([]);
      }

    } catch (err: any) {
      console.error("Erro API Students:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setErrorType('auth');
      } else {
        setErrorType('connection');
      }
      setStudents([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (student.enrollment && student.enrollment.includes(searchTerm))
  );

  // --- HANDLERS ---

  const handleAddNew = () => {
    const nextEnrollment = generateNextEnrollment(students);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      class: '',
      enrollment: nextEnrollment
    });
    setShowModal(true);
  };

  const handleEdit = (student: User) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      class: student.class || '',
      enrollment: student.enrollment || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return;
    
    try {
      await studentsService.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      alert("Erro ao excluir. Verifique permissões.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        await studentsService.update(editingId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          enrollment: formData.enrollment, 
          class: formData.class
        });
        alert("Aluno atualizado!");
      } else {
        await studentsService.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          enrollment: formData.enrollment,
          class: formData.class
        });
        alert("Aluno cadastrado!");
      }
      
      setShowModal(false);
      fetchStudents(); 
    } catch (error) {
      console.error("Erro submit:", error);
      alert("Erro ao salvar. Verifique o console.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Estudantes</h1>
          <p className="text-slate-500 mt-1">Gerencie os estudantes cadastrados</p>
        </div>
        <button
          onClick={handleAddNew}
          className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Novo Estudante</span>
        </button>
      </div>

      {/* Alertas */}
      {errorType !== 'none' && (
        <div className={`mb-6 rounded-xl border p-4 flex items-start gap-3 backdrop-blur-md shadow-sm ${
          errorType === 'auth' ? 'bg-amber-50/80 border-amber-200 text-amber-800' : 'bg-red-50/80 border-red-200 text-red-800'
        }`}>
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">{errorType === 'auth' ? 'Sessão Expirada' : 'Erro de Conexão'}</h4>
            <p className="text-sm opacity-90 mt-1">
              {errorType === 'auth' ? 'Faça login novamente.' : 'Verifique se o backend está rodando.'}
            </p>
          </div>
        </div>
      )}

      {/* Tabela Glass */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/10 overflow-hidden flex flex-col">
        {/* Busca */}
        <div className="p-6 border-b border-slate-100/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 flex justify-center items-center flex-col gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <span className="text-slate-500 font-medium">Carregando...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold tracking-wider text-left">
                <tr>
                  <th className="px-6 py-4">Estudante</th>
                  <th className="px-6 py-4">Matrícula</th>
                  <th className="px-6 py-4">Turma</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                          {(student.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{student.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {student.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-600 bg-slate-100/80 px-2 py-1 rounded border border-slate-200">
                        {student.enrollment || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {student.class || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {student.phone || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(student)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar' : 'Novo'} Estudante</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Completo</label>
                        <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Maria Silva" />
                    </div>
                    
                    {/* Matrícula */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Matrícula</label>
                        <input required readOnly={!editingId} type="text" className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all ${!editingId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`} value={formData.enrollment} onChange={e => setFormData({...formData, enrollment: e.target.value})} />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input required type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                        <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>

                    {/* Turma (Dropdown Ordenado) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Turma</label>
                        <select 
                          value={formData.class} 
                          onChange={e => setFormData({...formData, class: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Selecione a turma...</option>
                          {classesList.map((cls: any) => (
                            <option key={cls.id} value={cls.name}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
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