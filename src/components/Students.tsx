import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { studentsService } from '../services/studentsService';
import { User } from '../types';

export function Students() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth' | 'connection'>('none');

  // Estado para Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    enrollment: '',
  });

  // Lógica de Matrícula Automática (Incremental)
  const generateNextEnrollment = (currentList: User[]) => {
    try {
        const numbers = currentList
            .map(u => parseInt(u.enrollment || '0'))
            .filter(n => !isNaN(n) && n > 0);
        
        if (numbers.length === 0) return '2025001';
        
        const max = Math.max(...numbers);
        return (max + 1).toString();
    } catch (e) {
        return '2025001';
    }
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setErrorType('none');
      
      const data = await studentsService.getAll();
      
      // Garante que é array antes de setar o estado
      setStudents(Array.isArray(data) ? data : []);
      
    } catch (err: any) {
      console.error("Erro no componente Students:", err);
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

  // Filtro Seguro
  const filteredStudents = students.filter(student => {
    const sName = student.name?.toLowerCase() || '';
    const sEnroll = student.enrollment || '';
    const term = searchTerm.toLowerCase();
    return sName.includes(term) || sEnroll.includes(term);
  });

  // Handlers
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
        name: '',
        email: '',
        phone: '',
        class: '',
        enrollment: generateNextEnrollment(students) // Gera automático
    });
    setShowModal(true);
  };

  const handleEdit = (student: User) => {
    setEditingId(student.id);
    setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        class: student.class || '',
        enrollment: student.enrollment || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        if (editingId) {
            await studentsService.update(editingId, formData);
            alert("Atualizado com sucesso!");
        } else {
            await studentsService.create(formData);
            alert("Criado com sucesso!");
        }
        setShowModal(false);
        fetchStudents();
    } catch (error) {
        alert("Erro ao salvar. Verifique o console.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Deseja excluir?")) return;
      try {
          await studentsService.delete(id);
          setStudents(prev => prev.filter(s => s.id !== id));
      } catch (e) {
          alert("Erro ao excluir.");
      }
  };

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
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{errorType === 'auth' ? 'Sessão expirada.' : 'Erro de conexão.'}</p>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/10 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Matrícula</th>
                  <th className="px-6 py-4">Turma</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{student.enrollment}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.class}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex flex-col">
                            <span>{student.email}</span>
                            <span className="text-xs text-slate-400">{student.phone}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(student)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar' : 'Novo'} Estudante</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                        <input required type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula</label>
                        <input required readOnly={!editingId} type="text" className={`w-full border rounded-lg p-2 ${!editingId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} value={formData.enrollment} onChange={e => setFormData({...formData, enrollment: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input required type="email" className="w-full border rounded-lg p-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                        <input type="text" className="w-full border rounded-lg p-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Turma (Visual)</label>
                        <input type="text" className="w-full border rounded-lg p-2" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} />
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
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