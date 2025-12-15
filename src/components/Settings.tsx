import { useState } from 'react';
import { 
  Building, Calendar, Shield, Database, Save, 
  Download, Globe, BellRing, Upload, Activity, Server, RotateCcw
} from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('institution');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'institution', label: 'Instituição', icon: Building },
    { id: 'academic', label: 'Acadêmico', icon: Calendar },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'monitoring', label: 'Monitoramento', icon: Activity }
  ];

  const institutionSettings = {
    name: 'Escola Exemplo',
    email: 'contato@escolaexemplo.edu.br',
    phone: '(11) 99999-9999',
    address: 'Rua Exemplo, 123 - São Paulo, SP',
    cnpj: '12.345.678/0001-99',
    website: 'https://escolaexemplo.edu.br'
  };

  const academicSettings = {
    attendanceThreshold: 75,
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        alert("Configurações salvas com sucesso!");
    }, 1000);
  };

  const handleReset = () => {
    if (confirm("ATENÇÃO: Deseja restaurar todas as configurações para o padrão de fábrica? Essa ação não pode ser desfeita.")) {
        alert("Configurações restauradas com sucesso.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'institution':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Instituição</label>
                <input
                  type="text"
                  defaultValue={institutionSettings.name}
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Institucional</label>
                <input
                  type="email"
                  defaultValue={institutionSettings.email}
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  defaultValue={institutionSettings.phone}
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">CNPJ</label>
                <input
                  type="text"
                  defaultValue={institutionSettings.cnpj}
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Endereço</label>
                <input
                  type="text"
                  defaultValue={institutionSettings.address}
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                <input
                  type="url"
                  defaultValue={institutionSettings.website}
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-4">Identidade Visual</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium shadow-sm">
                      <Upload className="w-4 h-4" />
                      Alterar Logo
                    </button>
                    <button className="text-sm text-red-500 hover:text-red-600 font-medium px-2">
                      Remover
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Recomendado: PNG ou SVG com fundo transparente. Máximo 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ano Letivo Corrente</label>
                <select className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Semestre Atual</label>
                <select className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  <option value="1">1º Semestre</option>
                  <option value="2">2º Semestre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sistema de Avaliação</label>
                <select className="w-full pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  <option value="0-10">Numérico (0-10)</option>
                  <option value="0-100">Percentual (0-100)</option>
                  <option value="A-F">Conceitual (A-F)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mínimo de Frequência (%)</label>
                <div className="relative">
                    <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={academicSettings.attendanceThreshold}
                    className="w-full pl-4 pr-12 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Período de Matrícula</label>
                <div className="flex gap-4 items-center">
                  <input type="date" className="flex-1 pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <span className="text-slate-400 font-medium">até</span>
                  <input type="date" className="flex-1 pl-4 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Calendário Acadêmico
              </h4>
              <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100/50">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all font-medium shadow-sm">
                        <Download className="w-4 h-4" />
                        Baixar Modelo CSV
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium shadow-lg shadow-indigo-500/20">
                        <Upload className="w-4 h-4" />
                        Importar Calendário
                    </button>
                  </div>
                  <p className="text-center text-xs text-indigo-400 mt-3">Formatos aceitos: .csv, .xlsx</p>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Políticas de Acesso</h4>
              </div>
              
              <div className="space-y-5">
                {[
                    { label: 'Autenticação em Dois Fatores (2FA)', desc: 'Exigir código extra via email/app para todos os administradores', checked: false },
                    { label: 'Sessão Simultânea', desc: 'Permitir que o mesmo usuário esteja logado em múltiplos dispositivos', checked: true },
                    { label: 'Exigir Senha Forte', desc: 'Mínimo de 8 caracteres, letras maiúsculas, números e símbolos', checked: true }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-slate-800">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                ))}

                <div className="pt-4 border-t border-slate-200">
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Tempo Limite de Sessão</p>
                            <p className="text-sm text-slate-500">Logout automático após inatividade</p>
                        </div>
                        <select className="border border-slate-300 bg-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700">
                            <option value="30">30 minutos</option>
                            <option value="60">1 hora</option>
                            <option value="120">2 horas</option>
                            <option value="240">4 horas</option>
                        </select>
                    </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'monitoring':
        return (
            <div className="animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Status do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Banco de Dados', status: 'Online', value: '245 MB', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                        { label: 'Status da API', status: 'v2.4.1', value: '99.9% Uptime', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
                        { label: 'Logs de Segurança', status: 'Monitorando', value: '0 Ameaças', icon: BellRing, color: 'text-purple-600', bg: 'bg-purple-100' },
                        { label: 'Servidor', status: 'Ubuntu 22.04', value: '4 vCPU / 8GB', icon: Server, color: 'text-slate-600', bg: 'bg-slate-200' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-slate-50/50 rounded-2xl border border-slate-200 p-5 flex items-center justify-between group hover:shadow-md transition-all">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-2 h-2 rounded-full ${stat.label === 'Logs de Segurança' ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">{stat.value}</h4>
                                <p className="text-xs text-slate-500 mt-1">{stat.status}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-sm overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Live Logs</span>
                    </div>
                    <div className="space-y-2 opacity-80">
                        <p>[20:45:01] <span className="text-blue-400">INFO</span> Database backup completed successfully.</p>
                        <p>[20:45:12] <span className="text-blue-400">INFO</span> API Health Check: OK (24ms).</p>
                        <p>[20:46:05] <span className="text-yellow-400">WARN</span> High memory usage detected on Worker-2.</p>
                        <p>[20:46:10] <span className="text-blue-400">INFO</span> Auto-scaling triggered. New instance created.</p>
                    </div>
                </div>
            </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Configurações</h1>
          <p className="text-slate-500 mt-1">Personalize o comportamento do sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all font-medium shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Padrão</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Main Container Glassmorphism */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Top Navigation Bar (Horizontal) */}
        <div className="border-b border-slate-100/50 bg-white/40 px-6 py-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                        isActive
                            ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100 ring-1 ring-black/5'
                            : 'text-slate-500 hover:bg-white/60 hover:text-indigo-600'
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        {tab.label}
                    </button>
                    );
                })}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            {renderTabContent()}
        </div>
      </div>
    </div>
  );
}