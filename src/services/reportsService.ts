import { api } from '../lib/api';

// --- Interfaces ---

export interface ClassSummary {
  id: string;
  name: string;
  academic_year?: string | number;
  academicYear?: string | number;
}

export interface FinancialReport {
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number; // Quantidade
  totalOverdue: number;    // Valor em R$ (NOVO)
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

export interface DefaultersReport {
  students: Array<{
    id: string;
    name: string;
    totalDue: number;
    overdueDays: number;
    invoices: any[];
  }>;
}

export interface AcademicReport {
  classId: string;
  className: string;
  summary: {
    averageGrade: number;
    totalStudents: number;
    approvedCount: number;
    failedCount: number;
  };
  students: Array<{
    id: string;
    name: string;
    averageGrade: number;
    status: 'Aprovado' | 'Recuperação' | 'Reprovado';
  }>;
}

export interface AttendanceReport {
  classId: string;
  className: string;
  summary: {
    attendanceRate: number;
    totalClasses: number;
    presentAvg: number;
    absentAvg: number;
  };
  students: Array<{
    id: string;
    name: string;
    attendanceRate: number;
    absences: number;
    status: 'Regular' | 'Crítico';
  }>;
}

// --- SERVIÇO ---

export const reportsService = {
  
  // 1. Turmas
  getClasses: async (): Promise<ClassSummary[]> => {
    try {
      const response = await api.get('/classes');
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    } catch (error) {
      console.error("reportsService: Erro ao buscar turmas", error);
      return []; 
    }
  },

  // 2. Financeiro (CORRIGIDO: Busca valor total de inadimplência)
  getFinancialRevenue: async (startDate: string, endDate: string): Promise<FinancialReport> => {
    try {
      // 1. Busca dados gerais de receita
      const response = await api.get('/reports/financial/revenue', { params: { startDate, endDate } });
      const data = response.data || {};

      // 2. Busca dados de inadimplência para somar o VALOR total (R$)
      // (Muitas vezes o endpoint de receita só dá a quantidade, não o valor da dívida)
      let totalOverdueValue = 0;
      try {
        const defaults = await reportsService.getFinancialDefaults();
        // Soma o total devido por todos os alunos
        totalOverdueValue = defaults.students.reduce((acc, curr) => acc + curr.totalDue, 0);
      } catch (err) {
        console.warn("Não foi possível calcular o total da dívida", err);
      }

      // Tenta pegar a contagem de pagas de forma robusta
      const paidCount = Number(
        data.paidInvoices || 
        data.paidCount || 
        (data.invoices ? data.invoices.filter((i: any) => i.status === 'paid').length : 0)
      );

      return {
        totalRevenue: Number(data.totalRevenue || data.receitaTotal || 0),
        paidInvoices: paidCount,
        pendingInvoices: Number(data.pendingInvoices || 0),
        overdueInvoices: Number(data.overdueInvoices || 0),
        totalOverdue: totalOverdueValue, // Campo novo com o valor em R$
        revenueByMonth: Array.isArray(data.monthlyData) ? data.monthlyData : 
                        Array.isArray(data.revenueByMonth) ? data.revenueByMonth : []
      };
    } catch (error) {
      console.error("reportsService: Erro financeiro", error);
      return { totalRevenue: 0, paidInvoices: 0, pendingInvoices: 0, overdueInvoices: 0, totalOverdue: 0, revenueByMonth: [] };
    }
  },

  // 3. Inadimplentes
  getFinancialDefaults: async (): Promise<DefaultersReport> => {
    try {
      const response = await api.get('/reports/financial/defaults');
      const rawInvoices = response.data;

      if (!Array.isArray(rawInvoices)) return { students: [] };

      const studentsMap = new Map<string, any>();

      rawInvoices.forEach((inv: any) => {
        const studentId = inv.student?.id || inv.studentId;
        if (!studentId) return;

        // Pega nome com fallback
        const studentName = inv.student?.name || inv.studentName || 'Aluno Desconhecido';
        const amount = Number(inv.amount || 0);
        const dueDate = new Date(inv.dueDate);

        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            id: studentId,
            name: studentName, 
            totalDue: 0,
            oldestDueDate: dueDate,
            invoices: []
          });
        }

        const entry = studentsMap.get(studentId);
        entry.totalDue += amount;
        entry.invoices.push(inv);

        if (dueDate < entry.oldestDueDate) {
          entry.oldestDueDate = dueDate;
        }
      });

      const groupedList = Array.from(studentsMap.values()).map(s => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - s.oldestDueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: s.id,
          name: s.name,
          totalDue: s.totalDue,
          overdueDays: diffDays,
          invoices: s.invoices
        };
      });

      return { students: groupedList.sort((a, b) => b.totalDue - a.totalDue) };

    } catch (error) {
      console.error("reportsService: Erro inadimplentes", error);
      return { students: [] };
    }
  },

  // 4. Acadêmico
  getAcademicReport: async (classId: string): Promise<AcademicReport> => {
    try {
      const response = await api.get(`/reports/classes/${classId}/performance`);
      const data = response.data || {};

      const studentsList = Array.isArray(data.students) ? data.students : [];
      const classInfo = data.class || {};
      const summaryInfo = data.summary || {};

      const studentsFormatted = studentsList.map((item: any) => ({
        id: item.student?.id || 'unknown',
        name: item.student?.name || 'Aluno',
        averageGrade: Number(item.averageGrade || 0),
        status: (item.averageGrade || 0) >= 7 ? 'Aprovado' as const : 
                (item.averageGrade || 0) >= 5 ? 'Recuperação' as const : 'Reprovado' as const
      }));

      return {
        classId: classInfo.id || classId,
        className: `${classInfo.name || 'Turma'} (${classInfo.academicYear || classInfo.academic_year || ''})`,
        summary: {
          averageGrade: Number(summaryInfo.classAverage || 0),
          totalStudents: Number(summaryInfo.totalStudents || 0),
          approvedCount: studentsFormatted.filter((s: any) => s.status === 'Aprovado').length,
          failedCount: studentsFormatted.filter((s: any) => s.status !== 'Aprovado').length
        },
        students: studentsFormatted
      };
    } catch (error) {
      console.error("reportsService: Erro acadêmico", error);
      return {
        classId, className: 'Sem dados', 
        summary: { averageGrade: 0, totalStudents: 0, approvedCount: 0, failedCount: 0 }, 
        students: [] 
      };
    }
  },

  // 5. Frequência
  getAttendanceReport: async (classId: string): Promise<AttendanceReport> => {
    try {
      const response = await api.get(`/reports/classes/${classId}/performance`);
      const data = response.data || {};

      const studentsList = Array.isArray(data.students) ? data.students : [];
      const classInfo = data.class || {};
      const summaryInfo = data.summary || {};

      const studentsFormatted = studentsList.map((item: any) => {
        const attRate = Number(item.attendanceRate || 0);
        const totalAtt = Number(item.totalAttendances || 0);
        const presentCount = (attRate / 100) * totalAtt;
        const absentCount = Math.round(totalAtt - presentCount);

        return {
          id: item.student?.id || 'unknown',
          name: item.student?.name || 'Aluno',
          attendanceRate: attRate,
          absences: absentCount,
          status: attRate < 75 ? 'Crítico' as const : 'Regular' as const
        };
      });

      const totalAbsences = studentsFormatted.reduce((acc: number, curr: any) => acc + curr.absences, 0);
      const totalStudents = studentsFormatted.length || 1;

      return {
        classId: classInfo.id || classId,
        className: `${classInfo.name || 'Turma'} (${classInfo.academicYear || classInfo.academic_year || ''})`,
        summary: {
          attendanceRate: Number(summaryInfo.classAttendanceRate || 0),
          totalClasses: Number(studentsList[0]?.totalAttendances || 0),
          presentAvg: Math.round(totalStudents * ((summaryInfo.classAttendanceRate || 0) / 100)),
          absentAvg: Math.round(totalAbsences / totalStudents)
        },
        students: studentsFormatted
      };
    } catch (error) {
      console.error("reportsService: Erro frequência", error);
      return {
        classId, className: 'Sem dados', 
        summary: { attendanceRate: 0, totalClasses: 0, presentAvg: 0, absentAvg: 0 }, 
        students: [] 
      };
    }
  }
};