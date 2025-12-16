import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Plus, Clock, 
  Edit2, Trash2, ChevronLeft, ChevronRight, Loader2,
  Search, Info, CheckCircle
} from 'lucide-react';
import { eventsService, Event } from '../services/eventsService';
import { 
  format, parseISO, startOfMonth, endOfMonth, 
  addMonths, subMonths, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, isToday 
} from 'date-fns';
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

  // Estado para visualização (Lista ou Calendário) - Opcional, mas deixei fixo o calendário acima da lista
  // por enquanto.

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meeting',
    date: '',
  });

  useEffect(() => {
    loadEvents();
  }, [currentMonth, selectedType]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      // Para garantir que o calendário pegue eventos dos dias visíveis do mês anterior/próximo na grade
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      const startDate = format(calendarStart, 'yyyy-MM-dd');
      const endDate = format(calendarEnd, 'yyyy-MM-dd');
      
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
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type as any,
        date: formData.date
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
      alert("Erro ao salvar evento. Verifique os dados.");
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

  const openModal = (event?: Event, preSelectedDate?: Date) => {
    if (event) {
      setEditingId(event.id);
      setFormData({
        title: event.title,
        description: event.description || '',
        type: event.type,
        date: event.date,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        type: 'meeting',
        date: preSelectedDate ? format(preSelectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setShowModal(true);
  };

  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'holiday': return { label: 'Feriado', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
      case 'exam': return { label: 'Prova', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
      case 'meeting': return { label: 'Reunião', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' };
      case 'reunion': return { label: 'Confraternização', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' };
      case 'other': return { label: 'Outro', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' };
      default: return { label: 'Outro', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' };
    }
  };

  const typeFilters = [
    { value: '', label: 'Todos' },
    { value: 'meeting', label: 'Reuniões' },
    { value: 'exam', label: 'Provas' },
    { value: 'holiday', label: 'Feriados' },
    { value: 'reunion', label: 'Confraternização' },
    { value: 'other', label: 'Outros' }
  ];

  // Filtro local
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Lógica de Geração do Grid do Calendário
  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

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
        
        {/* Controls */}
        <div className="p-6 border-b border-slate-100/50 flex flex-col lg:flex-row items-center justify-between gap-6">
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

        {/* Calendar Grid View */}
        <div className="p-6 bg-slate-50/30">
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            {calendarDays.map((day, dayIdx) => {
              // Encontra eventos deste dia específico
              const dayEvents = filteredEvents.filter(e => isSameDay(parseISO(e.date), day));
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  onClick={() => openModal(undefined, day)}
                  className={`
                    min-h-[100px] bg-white p-2 relative hover:bg-indigo-50/30 transition-colors cursor-pointer group
                    ${!isCurrentMonth ? 'bg-slate-50/50' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`
                      text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                      ${isTodayDate ? 'bg-indigo-600 text-white shadow-md' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                       <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                         {dayEvents.length}
                       </span>
                    )}
                  </div>
                  
                  {/* Dots / Small List for Events */}
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                       const config = getEventTypeConfig(event.type);
                       return (
                         <div 
                            key={event.id} 
                            onClick={(e) => { e.stopPropagation(); openModal(event); }}
                            className={`text-[10px] truncate px-1.5 py-0.5 rounded ${config.color} hover:opacity-80 transition-opacity`}
                            title={event.title}
                         >
                           {event.title}
                         </div>
                       )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 pl-1">
                        + {dayEvents.length - 3} mais...
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Plus Icon */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* List Table (Mantida abaixo para detalhamento) */}
        <div className="overflow-x-auto border-t border-slate-100">
            {/* Tabela existente... */}
          {isLoading ? (
             <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Evento</th>
                  <th className="px-6 py-4">Detalhes</th> 
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-500">Nenhum evento neste período.</td>
                    </tr>
                ) : filteredEvents.slice(0, 10).map((event) => { // Limitei a 10 na lista para não ficar gigante com o calendário em cima
                  const typeConfig = getEventTypeConfig(event.type);
                  const dateObj = parseISO(event.date);

                  return (
                    <tr key={event.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{format(dateObj, 'dd/MM')}</span>
                            <span className="text-xs text-slate-500 capitalize">{format(dateObj, 'EEEE', { locale: ptBR })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.color} bg-opacity-20`}>
                            <CalendarIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{event.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                         {event.description ? (
                             <span className="text-sm truncate max-w-[200px] block" title={event.description}>
                                {event.description}
                             </span>
                         ) : (
                             <span className="text-sm text-slate-400 italic">Sem descrição</span>
                         )}
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
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-2 items-start text-sm text-blue-700">
               <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
               <p>Eventos são registrados para o dia inteiro.</p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                        <option value="meeting">Reunião</option>
                        <option value="exam">Prova</option>
                        <option value="holiday">Feriado</option>
                        <option value="reunion">Confraternização</option>
                        <option value="other">Outro</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input required type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                 </div>
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