import { AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  totalDue: number;
  overdueDays: number;
  invoices: any[];
}

interface DefaultersTableProps {
  students?: Student[];
}

export function DefaultersTable({ students = [] }: DefaultersTableProps) {
  if (!students || students.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
        Nenhum inadimplente encontrado.
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h3 className="font-bold text-slate-700">Lista de Inadimplência</h3>
        <span className="ml-auto bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">
          {students.length} Alunos
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Aluno</th>
              <th className="px-6 py-4">Valor Total</th>
              <th className="px-6 py-4">Atraso</th>
              <th className="px-6 py-4">Faturas</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-xs border border-red-100">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">{student.name}</div>
                      {/* REMOVIDO: Linha que exibia o ID */}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-red-600 bg-red-50/30">
                  {formatCurrency(student.totalDue)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                    <ClockIcon /> {student.overdueDays} dias
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                    {student.invoices?.length || 0} pendentes
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Ícone auxiliar
function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}