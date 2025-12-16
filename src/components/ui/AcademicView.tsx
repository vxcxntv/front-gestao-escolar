import { GraduationCap, Users, CheckCircle, XCircle } from 'lucide-react';
import { AcademicReport } from '../../services/reportsService';
// Certifique-se de que o caminho do import está correto conforme seu projeto
import { MetricCard } from './metricCard';

interface Props {
  data: AcademicReport;
}

export function AcademicView({ data }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

      {/* GRID 2x2 (md:grid-cols-2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Média Geral"
          value={data.summary.averageGrade.toFixed(1)}
          subtitle="Nota média da turma"
          icon={GraduationCap}
          colorTheme="blue"
        />
        <MetricCard
          title="Total Alunos"
          value={data.summary.totalStudents.toString()}
          subtitle="Matriculados na turma"
          icon={Users}
          colorTheme="amber"
        />
        <MetricCard
          title="Aprovados"
          value={data.summary.approvedCount.toString()}
          subtitle="Acima da média"
          icon={CheckCircle}
          colorTheme="emerald"
        />
        <MetricCard
          title="Reprovados/Rec"
          value={data.summary.failedCount.toString()}
          subtitle="Abaixo da média"
          icon={XCircle}
          colorTheme="red"
        />
      </div>

      {/* Tabela de Detalhes */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 overflow-hidden">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          Desempenho por Aluno
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold text-left">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Média</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{student.name}</td>
                  <td className="px-4 py-3 font-bold text-slate-600">{student.averageGrade.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${student.status === 'Aprovado'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : student.status === 'Recuperação'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.students.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    Nenhum dado acadêmico encontrado para esta seleção.
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