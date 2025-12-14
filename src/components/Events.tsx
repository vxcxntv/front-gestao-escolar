import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Filter, Clock, MapPin,
  Users, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { eventsService, type Event } from '../services/eventsService';
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    loadEvents();
  }, [page, limit, selectedType, currentMonth]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const params: any = {
        page,
        limit,
        type: selectedType || undefined,
        startDate,
        endDate
      };
      
      const response = await eventsService.getEvents(params);
      setEvents(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'holiday': return 'bg-emerald-100 text-emerald-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'exam': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'academic': return 'Acadêmico';
      case 'holiday': return 'Feriado';
      case 'meeting': return 'Reunião';
      case 'exam': return 'Prova';
      default: return type;
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Evento',
      render: (value: string, row: Event) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getEventTypeColor(row.type)}`}>
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-500">{row.description?.substring(0, 60)}...</p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(value)}`}>
          {getEventTypeText(value)}
        </span>
      )
    },
    {
      key: 'startDate',
      header: 'Data',
      render: (value: string, row: Event) => (
        <div>
          <p className="font-medium text-slate-800">
            {format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR })}
          </p>
          {!row.allDay && (
            <p className="text-sm text-slate-500">
              {format(parseISO(value), 'HH:mm', { locale: ptBR })} - {format(parseISO(row.endDate), 'HH:mm', { locale: ptBR })}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'location',
      header: 'Local',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>{value || 'Não informado'}</span>
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: Event) => console.log('Visualizar:', row),
      variant: 'default' as const
    },
    {
      label: 'Editar',
      icon: <Edit className="w-4 h-4" />,
      onClick: (row: Event) => console.log('Editar:', row),
      variant: 'default' as const
    },
    {
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Event) => console.log('Excluir:', row),
      variant: 'danger' as const
    }
  ];

  const typeFilters = [
    { value: '', label: 'Todos' },
    { value: 'academic', label: 'Acadêmicos' },
    { value: 'holiday', label: 'Feriados' },
    { value: 'meeting', label: 'Reuniões' },
    { value: 'exam', label: 'Provas' },
    { value: 'other', label: 'Outros' }
  ];

  const monthEvents = events.filter(event => {
    const eventDate = parseISO(event.startDate);
    return eventDate.getMonth() === currentMonth.getMonth() &&
           eventDate.getFullYear() === currentMonth.getFullYear();
  });

  const upcomingEvents = monthEvents
    .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Calendário de Eventos</h1>
          <p className="text-slate-500 mt-1">Gestão de eventos escolares e acadêmicos</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Filter}
          >
            Filtros
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => console.log('Novo evento')}
          >
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Controles do Mês */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR }).toUpperCase()}
            </h2>
            <p className="text-slate-500">{monthEvents.length} eventos este mês</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            />
          </div>
        </div>

        {/* Filtros de Tipo */}
        <div className="flex flex-wrap gap-2 mb-6">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedType(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedType === filter.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Próximos Eventos */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Próximos Eventos
          </h3>
          
          {upcomingEvents.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Nenhum evento próximo</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600">
                        {event.title}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">{event.description?.substring(0, 80)}...</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                      {getEventTypeText(event.type)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 mt-4">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(parseISO(event.startDate), 'dd/MM', { locale: ptBR })}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.participants && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{event.participants.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabela Completa */}
      <DataTable
        columns={columns}
        data={events}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
        onSearch={(search) => console.log('Search:', search)}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="Nenhum evento encontrado para o período selecionado"
      />
    </div>
  );
}