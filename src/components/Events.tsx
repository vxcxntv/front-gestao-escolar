import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Plus, Filter, Clock, MapPin,
  Users, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2,
  Search, CheckCircle
} from 'lucide-react';
import { eventsService, Event } from '../services/eventsService';
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filtros
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'academic',
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '10:00',
    location: '',
    allDay: false
  });

  useEffect(() => {
    loadEvents();
  }, [currentMonth, selectedType]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const params: any = {
        type: selectedType || undefined,
        startDate,
        endDate
      };
      
      const data = await eventsService.getAll(params);
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Combina data e hora
      const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
      const endDateTime = `${formData.endDate || formData.startDate}T${formData.endTime}:00`;

      const payload = {
        ...formData,
        startDate: startDateTime,
        endDate: endDateTime
      };

      if (editingId) {
        await eventsService.update(editingId, payload);
      } else {
        await eventsService.create(payload);
      }
      
      setShowModal(false);
      loadEvents();
      alert("Evento salvo com sucesso!");
    } catch (error) {
      alert("Erro ao salvar evento.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      await eventsService.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingId(event.id);
      // Separa data e hora para os inputs
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      
      setFormData({
        title: event.title,
        description: event.description,
        type: event.type,
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
        startTime: format(start, 'HH:mm'),
        endTime: format(end, 'HH:mm'),
        location: event.location || '',
        allDay: event.allDay
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        type: 'academic',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '08:00',
        endTime: '10:00',
        location: '',
        allDay: false
      });
    }
    setShowModal(true);
  };

  // Lógica de UI
  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'academic': return { label: 'Acadêmico', color: 'bg-blue-100 text-blue-700' };
      case 'holiday': return { label: 'Feriado', color: 'bg-emerald-100 text-emerald-700' };
      case 'meeting': return { label: 'Reunião', color: 'bg-purple-100 text-purple-700' };
      case 'exam': return { label: 'Prova', color: 'bg-red-100 text-red-700' };
      default: return { label: 'Outro', color: 'bg-slate-100 text-slate-700' };
    }
  };

  const typeFilters = [
    { value: '', label: 'Todos' },
    { value: 'academic', label: 'Acadêmicos' },
    { value: 'holiday', label: 'Feriados' },
    { value: 'meeting', label: 'Reuniões' },
    { value: 'exam', label: 'Provas' }
  ];

  // Filtro local de busca
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const upcomingEvents = filteredEvents
    .filter(e => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Calendário</h1>
          <p className="text-slate-500 mt-1">Gestão de eventos e cronograma escolar</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openModal()}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
        
        {/* Calendar Controls & Stats */}
        <div className="p-6 border-b border-slate-100/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Month Navigation */}
            <div className="flex items-center gap-4 bg-white/50 p-2 rounded-xl border border-slate-200">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-800 min-w-[180px] text-center capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {typeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedType(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === filter.value
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar evento..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          {/* Upcoming Cards */}
          {upcomingEvents.length > 0 && (
             <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Próximos Eventos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingEvents.map(event => {
                         const typeConfig = getEventTypeConfig(event.type);
                         return (
                            <div key={event.id} onClick={() => openModal(event)} className="bg-white/60 border border-slate-200 p-4 rounded-xl hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${typeConfig.color}`}>
                                        {typeConfig.label}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">
                                        {format(parseISO(event.startDate), 'dd/MM')}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {event.allDay ? 'Dia todo' : `${format(parseISO(event.startDate), 'HH:mm')} - ${format(parseISO(event.endDate), 'HH:mm')}`}
                                </div>
                            </div>
                         )
                    })}
                </div>
             </div>
          )}
        </div>

        {/* List Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Evento</th>
                  <th className="px-6 py-4">Local</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-500">Nenhum evento encontrado.</td>
                    </tr>
                ) : filteredEvents.map((event) => {
                  const typeConfig = getEventTypeConfig(event.type);
                  return (
                    <tr key={event.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{format(parseISO(event.startDate), 'dd/MM')}</span>
                            <span className="text-xs text-slate-500">{format(parseISO(event.startDate), 'EEEE', { locale: ptBR })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.color} bg-opacity-20`}>
                            <CalendarIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{event.title}</p>
                            {!event.allDay && (
                                <p className="text-xs text-slate-500">
                                    {format(parseISO(event.startDate), 'HH:mm')} - {format(parseISO(event.endDate), 'HH:mm')}
                                </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                         <div className="flex items-center gap-2">
                            {event.location ? (
                                <>
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm">{event.location}</span>
                                </>
                            ) : (
                                <span className="text-sm text-slate-400 italic">Sem local</span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(event)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(event.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-indigo-900 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                {editingId ? 'Editar Evento' : 'Novo Evento'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                        <option value="academic">Acadêmico</option>
                        <option value="holiday">Feriado</option>
                        <option value="meeting">Reunião</option>
                        <option value="exam">Prova</option>
                        <option value="other">Outro</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Local</label>
                    <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
                    <input required type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hora Início</label>
                    <input type="time" disabled={formData.allDay} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
                    <input required type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fim</label>
                    <input type="time" disabled={formData.allDay} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                 </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                 <input type="checkbox" id="allDay" checked={formData.allDay} onChange={e => setFormData({ ...formData, allDay: e.target.checked })} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                 <label htmlFor="allDay" className="text-sm font-medium text-slate-700 select-none cursor-pointer">Evento de dia inteiro</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">
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