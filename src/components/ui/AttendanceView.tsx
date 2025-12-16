import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { AttendanceReport } from '../../services/reportsService';
// Certifique-se de que o caminho do import está correto conforme seu projeto
import { MetricCard } from './metricCard';

interface Props {
  data: AttendanceReport;
}

export function AttendanceView({ data }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

      {/* GRID 2x2 (md:grid-cols-2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Frequência Global"
          value={`${data.summary.attendanceRate}%`}
          subtitle="Média geral da turma"
          icon={Calendar}
          colorTheme="blue"
        />
        <MetricCard
          title="Aulas Dadas"
          value={data.summary.totalClasses.toString()}
          subtitle="Total de registros"
          icon={Clock}
          colorTheme="amber"
        />
        <MetricCard
          title="Presença Média"
          value={data.summary.presentAvg.toString()}
          subtitle="Alunos presentes por aula"
          icon={CheckCircle}
          colorTheme="emerald"
        />
        <MetricCard
          title="Faltas Média"
          value={data.summary.absentAvg.toString()}
          subtitle="Alunos ausentes por aula"
          icon={AlertTriangle}
          colorTheme="red"
        />
      </div>

      {/* Tabela de Detalhes */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 overflow-hidden">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Frequência Detalhada
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Frequência</th>
                <th className="px-4 py-3">Faltas (Total)</th>
                <th className="px-4 py-3">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{student.name}</td>
                  <td className="px-4 py-3 font-bold text-slate-600">{student.attendanceRate}%</td>
                  <td className="px-4 py-3 text-slate-500">{student.absences}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${student.status === 'Regular'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Nenhum registro de frequência encontrado para esta seleção.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}