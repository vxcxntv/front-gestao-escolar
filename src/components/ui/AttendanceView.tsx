import { Calendar, UserCheck, AlertTriangle, Clock } from 'lucide-react';
import { MetricCard } from './metricCard';
import { AttendanceReport } from '../../services/reportsService';

export function AttendanceView({ data }: { data: AttendanceReport }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Frequência Global" value={`${data.summary.attendanceRate}%`} subtitle="Presença média" icon={Calendar} colorTheme="blue" />
        <MetricCard title="Aulas Dadas" value={data.summary.totalClasses} subtitle="No período" icon={Clock} colorTheme="amber" />
        <MetricCard title="Presença Média" value={data.summary.presentAvg} subtitle="Alunos por aula" icon={UserCheck} colorTheme="emerald" />
        <MetricCard title="Faltas Média" value={data.summary.absentAvg} subtitle="Alunos por aula" icon={AlertTriangle} colorTheme="red" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-700">Relatório de Frequência ({data.className})</h3></div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Aluno</th>
              <th className="px-6 py-4">Frequência</th>
              <th className="px-6 py-4">Faltas</th>
              <th className="px-6 py-4">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                <td className="px-6 py-4"><span className="font-bold text-slate-700">{student.attendanceRate}%</span></td>
                <td className="px-6 py-4 text-slate-600">{student.absences} aulas</td>
                <td className="px-6 py-4">
                  {student.attendanceRate < 75 ? 
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" /> Risco</span> : 
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Regular</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}