import { GraduationCap, Users, CheckCircle, XCircle } from 'lucide-react';
import { MetricCard } from './metricCard';
import { AcademicReport } from '../../services/reportsService';

export function AcademicView({ data }: { data: AcademicReport }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Média Geral" value={data.summary.averageGrade.toFixed(1)} subtitle="Nota média da turma" icon={GraduationCap} colorTheme="blue" />
        <MetricCard title="Total Alunos" value={data.summary.totalStudents} subtitle="Matriculados" icon={Users} colorTheme="emerald" />
        <MetricCard title="Aprovados" value={data.summary.approvedCount} subtitle="Acima da média" icon={CheckCircle} colorTheme="emerald" />
        <MetricCard title="Atenção" value={data.summary.failedCount} subtitle="Abaixo da média" icon={XCircle} colorTheme="red" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-700">Desempenho por Aluno ({data.className})</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Aluno</th>
              <th className="px-6 py-4">Média Atual</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 w-1/3">Progresso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{student.averageGrade.toFixed(1)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' :
                    student.status === 'Recuperação' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>{student.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${student.averageGrade >= 7 ? 'bg-emerald-500' : student.averageGrade >= 5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(student.averageGrade / 10) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}