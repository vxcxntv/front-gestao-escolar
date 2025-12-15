import React, { useState } from 'react';
import { Users, Eye, Clock, CheckCircle, ArrowUpDown } from 'lucide-react';

interface Defaulter {
  id: string;
  name: string;
  totalDue: number;
  overdueDays: number;
  invoices: any[];
}

interface DefaultersTableProps {
  students: Defaulter[] | undefined;
}

export function DefaultersTable({ students = [] }: DefaultersTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Defaulter; direction: 'asc' | 'desc' } | null>(null);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Lógica de Ordenação Interna (Complexidade)
  const sortedStudents = React.useMemo(() => {
    if (!students) return [];
    let sortableStudents = [...students];
    if (sortConfig !== null) {
      sortableStudents.sort((a, b) => {
        // CORREÇÃO: Comparando com 'asc' ao invés de 'ascending'
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableStudents;
  }, [students, sortConfig]);

  const requestSort = (key: keyof Defaulter) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden flex flex-col max-h-[600px] animate-in fade-in slide-in-from-bottom-2">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          Lista de Inadimplência
        </h4>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {students?.length || 0} Alunos
        </span>
      </div>

      <div className="overflow-auto custom-scrollbar">
        <table className="w-full">
          <thead className="bg-slate-50/90 text-slate-500 text-xs uppercase font-semibold text-left sticky top-0 backdrop-blur-md z-10 shadow-sm">
            <tr>
              <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => requestSort('name')}>
                <div className="flex items-center gap-1">Aluno <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50"/></div>
              </th>
              <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => requestSort('totalDue')}>
                <div className="flex items-center gap-1">Valor Total <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50"/></div>
              </th>
              <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => requestSort('overdueDays')}>
                <div className="flex items-center gap-1">Atraso <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50"/></div>
              </th>
              <th className="py-4 px-6">Faturas</th>
              <th className="py-4 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-red-50/30 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-red-50">
                      {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{student.name || 'Desconhecido'}</p>
                      <p className="text-xs text-slate-500">ID: {student.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                    {formatCurrency(student.totalDue || 0)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1.5 ${
                    student.overdueDays > 30 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {student.overdueDays} dias
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {student.invoices?.length || 0} pendentes
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4" /> Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!students || students.length === 0) && (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Tudo em dia!</h3>
            <p>Nenhum aluno inadimplente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}