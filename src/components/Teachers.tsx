import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { studentsService } from '../services/studentsService';
import { User } from '../types';

export function Teachers() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const data = await studentsService.getAllByRole('teacher');
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
    } finally {
      setIsLoading(false);
  }
};

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(t =>
    (t.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData, role: 'teacher', enrollment: '' };
      if (editingId) {
        await studentsService.update(editingId, payload);
      } else {
        await studentsService.create(payload);
      }
      setShowModal(false);
      fetchTeachers();
      alert("Professor salvo com sucesso!");
    } catch (error) {
      alert("Erro ao salvar professor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este professor?")) return;
    try {
      await studentsService.delete(id);
      setTeachers(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Professores</h1>
          <p className="text-slate-500 mt-1">Gerencie o corpo docente</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '' }); setShowModal(true); }}
          className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Professor</span>
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Telefone</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                          {(teacher.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600"><div className="flex items-center gap-2"><Mail className="w-4 h-4"/>{teacher.email}</div></td>
                    <td className="px-6 py-4 text-slate-600"><div className="flex items-center gap-2"><Phone className="w-4 h-4"/>{teacher.phone}</div></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(teacher.id); setFormData({ name: teacher.name, email: teacher.email, phone: teacher.phone || '' }); setShowModal(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(teacher.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-emerald-800">{editingId ? 'Editar' : 'Novo'} Professor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700">Nome</label>
                  <input required className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input required type="email" className="w-full border p-2 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Telefone</label>
                  <input className="w-full border p-2 rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
               <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
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
