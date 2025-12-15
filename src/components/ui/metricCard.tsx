import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorTheme: 'emerald' | 'blue' | 'red' | 'amber';
}

export function MetricCard({ title, value, subtitle, icon: Icon, colorTheme }: MetricCardProps) {
  const themes = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600', icon: 'text-red-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'text-amber-600' },
  };

  const theme = themes[colorTheme];

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 relative overflow-hidden group transition-all hover:shadow-2xl">
      {/* Background Icon Effect */}
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
        <Icon className={`w-24 h-24 ${theme.icon}`} />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h4 className="text-lg font-bold text-slate-800">{title}</h4>
        <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <p className="text-3xl font-bold text-slate-800 relative z-10">
        {value}
      </p>
      <p className="text-sm text-slate-500 mt-2 relative z-10 font-medium">
        {subtitle}
      </p>
    </div>
  );
}