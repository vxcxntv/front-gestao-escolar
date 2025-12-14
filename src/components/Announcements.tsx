import { useState, useEffect } from 'react';
import {
  Plus, Pin, Trash2, Calendar, User, Megaphone,
  AlertTriangle, Info, Star, Edit2, Loader2, AlertCircle
} from 'lucide-react';
import { announcementsService, AnnouncementData } from '../services/announcementsService';

interface Announcement extends AnnouncementData {
  category: 'general' | 'event' | 'urgent' | 'academic';
  authorDisplayName: string;
  date: string;
}

export function Announcements() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth' | 'connection'>('none');
  const [errorMessage, setErrorMessage] = useState('');

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Announcement['category'],
    pinned: false
  });

  const categoryConfig = {
    general: { label: 'Geral', bg: 'bg-slate-100', text: 'text-slate-600', icon: Info },
    event: { label: 'Evento', bg: 'bg-purple-100', text: 'text-purple-600', icon: Calendar },
    urgent: { label: 'Urgente', bg: 'bg-rose-100', text: 'text-rose-600', icon: AlertTriangle },
    academic: { label: 'Acadêmico', bg: 'bg-emerald-100', text: 'text-emerald-600', icon: Star },
  };

  const loadAnnouncements = async () => {
    setIsLoading(true);
    setErrorType('none');
    try {
      const rawData = await announcementsService.getAnnouncements();

      const safeArray = Array.isArray(rawData) ? rawData : [];

      const adaptedData: Announcement[] = safeArray.map((item: any) => {
        // 1. CORREÇÃO CRÍTICA DO AUTOR
        // O backend manda um objeto author: { name: '...' }, o frontend precisa de uma string.
        let displayAuthor = 'Escola';

        if (item.author && typeof item.author === 'object' && item.author.name) {
          displayAuthor = item.author.name; // Pega de dentro do objeto
        } else if (typeof item.author === 'string') {
          displayAuthor = item.author;
        } else if (item.authorName) {
          displayAuthor = item.authorName;
        }

        // 2. Normalização de Categoria
        let safeCategory: Announcement['category'] = 'general';
        if (item.category && ['general', 'event', 'urgent', 'academic'].includes(item.category)) {
          safeCategory = item.category;
        }

        // 3. Tratamento de Data
        let displayDate = new Date().toISOString();
        if (item.date) displayDate = item.date;
        else if (item.createdAt) displayDate = item.createdAt;

        return {
          id: item.id || Math.random().toString(),
          title: item.title || 'Sem Título',
          content: item.content || '',
          category: safeCategory,
          pinned: !!item.pinned,
          authorDisplayName: displayAuthor, // Usamos essa propriedade segura na renderização
          date: displayDate
        };
      });

      setAnnouncements(adaptedData);
    } catch (error: any) {
      console.error("Erro no componente Announcements:", error);
      if (error.response?.status === 401) {
        setErrorType('auth');
      } else {
        setErrorType('connection');
        setErrorMessage(error.message || 'Erro desconhecido');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', category: 'general', pinned: false });
    setShowModal(true);
  };

  const handleEdit = (item: Announcement) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      pinned: item.pinned ?? false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este aviso?")) return;
    try {
      await announcementsService.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (e) { alert("Erro ao excluir."); }
  };

  const handleTogglePin = async (item: Announcement) => {
    const newStatus = !item.pinned;
    setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, pinned: newStatus } : a));
    try {
      await announcementsService.updateAnnouncement(item.id, { pinned: newStatus });
    } catch (e) {
      setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, pinned: !newStatus } : a));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (editingId) {
        await announcementsService.updateAnnouncement(editingId, payload);
      } else {
        await announcementsService.createAnnouncement(payload);
      }
      setShowModal(false);
      loadAnnouncements();
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const sorted = [...announcements].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Quadro de Avisos</h1>
          <p className="text-slate-500 mt-1">Comunicação oficial</p>
        </div>
        <button onClick={handleAddNew} className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> <span className="font-medium">Novo Anúncio</span>
        </button>
      </div>

      {errorType !== 'none' && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{errorType === 'auth' ? 'Sessão expirada.' : `Erro: ${errorMessage || 'Falha ao carregar dados'}`}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="grid gap-4">
          {sorted.map((item) => {
            const config = categoryConfig[item.category] || categoryConfig.general;
            const CatIcon = config.icon;

            // Tratamento de data seguro
            let dateStr = 'Data inválida';
            try {
              dateStr = new Date(item.date).toLocaleDateString('pt-BR');
            } catch (e) { }

            return (
              <div key={item.id} className={`relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md ${item.pinned ? 'border-indigo-200 shadow-indigo-100/50 bg-indigo-50/30' : 'border-white/50'}`}>
                {item.pinned && <div className="absolute -top-3 -left-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg z-10"><Pin className="w-4 h-4 fill-current" /></div>}

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${config.bg} ${config.text}`}>
                        <CatIcon className="w-3.5 h-3.5" /> {config.label}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                    </div>
                    <p className="text-slate-600 mb-4 whitespace-pre-wrap">{item.content}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {/* Aqui usamos a propriedade segura, não o objeto */}
                        {item.authorDisplayName}
                      </span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 justify-end sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                    <button onClick={() => handleTogglePin(item)} className={`p-2 rounded-lg transition-colors ${item.pinned ? 'text-indigo-600 bg-indigo-100' : 'text-slate-400 hover:text-indigo-600'}`}><Pin className="w-5 h-5" /></button>
                    <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && <div className="text-center text-slate-500 py-10">Nenhum aviso encontrado.</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-in zoom-in-95 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex gap-2"><Megaphone className="w-5 h-5" /> {editingId ? 'Editar' : 'Novo'} Anúncio</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl hover:text-white/80">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input required className="w-full px-4 py-2 border rounded-xl" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select className="w-full px-4 py-2 border rounded-xl" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                    <option value="general">Geral</option>
                    <option value="event">Evento</option>
                    <option value="urgent">Urgente</option>
                    <option value="academic">Acadêmico</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.pinned} onChange={e => setFormData({ ...formData, pinned: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-medium text-slate-700">Fixar no topo</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Conteúdo</label>
                <textarea required rows={4} className="w-full px-4 py-2 border rounded-xl resize-none" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border rounded-xl">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2">
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