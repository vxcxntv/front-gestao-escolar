import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock,
  Filter, Plus, Download, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { invoicesService, type Invoice } from '../services/invoicesService';
import { reportsService } from '../services/reportsService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [financialData, setFinancialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    loadInvoices();
    loadFinancialReport();
  }, [page, limit, selectedStatus]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
        status: selectedStatus || undefined
      };
      
      const response = await invoicesService.getInvoices(params);
      setInvoices(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFinancialReport = async () => {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const response = await reportsService.getFinancialRevenue(
        format(firstDay, 'yyyy-MM-dd'),
        format(lastDay, 'yyyy-MM-dd')
      );
      setFinancialData(response);
    } catch (error) {
      console.error('Erro ao carregar relatório financeiro:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <Clock className="w-5 h-5 text-slate-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const columns = [
    {
      key: 'studentName',
      header: 'Aluno',
      render: (value: string, row: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-600">
              {value?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{row.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (value: number) => (
        <span className="font-bold text-slate-800">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'dueDate',
      header: 'Vencimento',
      render: (value: string) => format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR })
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${value === 'paid' ? 'bg-green-100 text-green-800' : ''}
            ${value === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
            ${value === 'overdue' ? 'bg-red-100 text-red-800' : ''}
            ${value === 'cancelled' ? 'bg-slate-100 text-slate-800' : ''}
          `}>
            {getStatusText(value)}
          </span>
        </div>
      )
    },
    {
      key: 'paidAt',
      header: 'Pagamento',
      render: (value: string | undefined) => 
        value ? format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR }) : '-'
    }
  ];

  const actions = [
    {
      label: 'Visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: Invoice) => console.log('Visualizar:', row),
      variant: 'default' as const
    },
    {
      label: 'Marcar como Pago',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: (row: Invoice) => invoicesService.markAsPaid(row.id),
      variant: 'default' as const
    },
    {
      label: 'Cancelar',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Invoice) => invoicesService.cancelInvoice(row.id),
      variant: 'danger' as const
    }
  ];

  const statusFilters = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'paid', label: 'Pagos' },
    { value: 'overdue', label: 'Vencidos' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Financeiro</h1>
          <p className="text-slate-500 mt-1">Gestão de faturas e relatórios financeiros</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Download}
          >
            Exportar
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => console.log('Nova fatura')}
          >
            Nova Fatura
          </Button>
          <Button
            variant="secondary"
            icon={BarChart3}
            onClick={() => console.log('Relatórios')}
          >
            Relatórios
          </Button>
        </div>
      </div>

      {/* Estatísticas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Receita do Mês', 
            value: financialData?.totalRevenue ? formatCurrency(financialData.totalRevenue) : 'R$ 0,00',
            color: 'from-emerald-500 to-teal-400',
            icon: DollarSign
          },
          { 
            label: 'Faturas Pagas', 
            value: financialData?.paidInvoices?.toString() || '0',
            color: 'from-blue-500 to-cyan-400',
            icon: CheckCircle
          },
          { 
            label: 'Faturas Pendentes', 
            value: financialData?.pendingInvoices?.toString() || '0',
            color: 'from-amber-500 to-yellow-400',
            icon: Clock
          },
          { 
            label: 'Faturas Vencidas', 
            value: financialData?.overdueInvoices?.toString() || '0',
            color: 'from-red-500 to-pink-400',
            icon: AlertCircle
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl shadow-indigo-100/20">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                  +12.5%
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Filtrar por:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === filter.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Criar em lote')}
            >
              Criar em Lote
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => reportsService.getFinancialDefaults()}
            >
              Ver Inadimplentes
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela de Faturas */}
      <DataTable
        columns={columns}
        data={invoices}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
        onSearch={(search) => console.log('Search:', search)}
        actions={actions}
        isLoading={isLoading}
      />
    </div>
  );
}