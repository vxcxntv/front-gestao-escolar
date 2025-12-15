import { Filter, Calendar } from 'lucide-react';
import { subMonths, format } from 'date-fns';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
}

export function DateRangeFilter({ startDate, endDate, onRangeChange }: DateRangeFilterProps) {
  
  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = subMonths(end, days / 30);
    onRangeChange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  };

  const quickFilters = [
    { label: 'Este Mês', days: 30 },
    { label: 'Trimestre', days: 90 },
    { label: 'Semestre', days: 180 },
    { label: 'Este Ano', days: 365 }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros Rápidos
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => handleQuickFilter(filter.days)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="bg-white/50 p-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
                <Calendar className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 px-2">
                <input
                type="date"
                className="bg-transparent border-none text-slate-700 font-medium text-sm focus:ring-0 cursor-pointer outline-none"
                value={startDate}
                onChange={(e) => onRangeChange(e.target.value, endDate)}
                />
                <span className="text-slate-400 text-sm">até</span>
                <input
                type="date"
                className="bg-transparent border-none text-slate-700 font-medium text-sm focus:ring-0 cursor-pointer outline-none"
                value={endDate}
                onChange={(e) => onRangeChange(startDate, e.target.value)}
                />
            </div>
        </div>
      </div>
    </div>
  );
}