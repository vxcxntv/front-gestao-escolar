import { useState } from 'react';
import { Settings as SettingsIcon, Save, Building, Calendar, Bell,
  Shield, Globe, Database, Users, Mail, Lock, BellRing, Palette,
  Upload, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('institution');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'institution', label: 'Instituição', icon: Building },
    { id: 'academic', label: 'Acadêmico', icon: Calendar },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'integrations', label: 'Integrações', icon: Globe }
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
    academicYear: '2024',
    semester: '2',
    gradeSystem: '0-10',
    attendanceThreshold: 75,
    maxAbsences: 25
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'institution':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome da Instituição
                </label>
                <input
                  type="text"
                  defaultValue={institutionSettings.name}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Institucional
                </label>
                <input
                  type="email"
                  defaultValue={institutionSettings.email}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  defaultValue={institutionSettings.phone}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  defaultValue={institutionSettings.cnpj}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  defaultValue={institutionSettings.address}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  defaultValue={institutionSettings.website}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Logotipo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Building className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <Button variant="outline" icon={Upload}>
                    Upload Novo Logo
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">
                    PNG, JPG ou SVG, máximo 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ano Letivo
                </label>
                <select className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50">
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Semestre
                </label>
                <select className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50">
                  <option value="1">1º Semestre</option>
                  <option value="2">2º Semestre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sistema de Notas
                </label>
                <select className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50">
                  <option value="0-10">0-10</option>
                  <option value="0-100">0-100</option>
                  <option value="A-F">A-F</option>
                  <option value="conceitos">Conceitos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mínimo de Frequência (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={academicSettings.attendanceThreshold}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Máximo de Faltas
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={academicSettings.maxAbsences}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Período de Matrícula
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                  />
                  <span className="self-center text-slate-500">até</span>
                  <input
                    type="date"
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Calendário Acadêmico
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" icon={Download}>
                  Baixar Modelo
                </Button>
                <Button variant="outline" icon={Upload}>
                  Importar Calendário
                </Button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50/50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-indigo-600" />
                <h4 className="text-lg font-bold text-slate-800">Configurações de Segurança</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Login com Dois Fatores</p>
                    <p className="text-sm text-slate-500">Requer autenticação adicional</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Sessão Simultânea</p>
                    <p className="text-sm text-slate-500">Permitir login em múltiplos dispositivos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Exigir Senha Forte</p>
                    <p className="text-sm text-slate-500">Mínimo 8 caracteres com números e símbolos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Tempo de Sessão</p>
                    <p className="text-sm text-slate-500">Tempo máximo de inatividade</p>
                  </div>
                  <select className="border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                    <option value="240">4 horas</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Permissões por Perfil
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Recurso</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Admin</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Professor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Aluno</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Dashboard', admin: true, teacher: true, student: true, parent: true },
                      { feature: 'Notas', admin: true, teacher: true, student: true, parent: true },
                      { feature: 'Frequência', admin: true, teacher: true, student: true, parent: true },
                      { feature: 'Financeiro', admin: true, teacher: false, student: true, parent: true },
                      { feature: 'Relatórios', admin: true, teacher: true, student: false, parent: false },
                      { feature: 'Configurações', admin: true, teacher: false, student: false, parent: false }
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-800">{row.feature}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.admin ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {row.admin ? 'Permitido' : 'Negado'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.teacher ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {row.teacher ? 'Permitido' : 'Negado'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.student ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {row.student ? 'Permitido' : 'Negado'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.parent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {row.parent ? 'Permitido' : 'Negado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Configurações em Desenvolvimento</h3>
            <p className="text-slate-500">Esta seção estará disponível em breve.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Configurações</h1>
          <p className="text-slate-500 mt-1">Personalize o sistema conforme as necessidades da sua instituição</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Download}
          >
            Backup
          </Button>
          <Button
            variant="primary"
            icon={Save}
            isLoading={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex flex-wrap gap-2 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo da Aba */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-indigo-600" />
            <h4 className="text-lg font-bold text-slate-800">Banco de Dados</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Status</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Tamanho</span>
              <span className="text-sm font-medium text-slate-800">245 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Último Backup</span>
              <span className="text-sm font-medium text-slate-800">Hoje, 02:00</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-indigo-600" />
            <h4 className="text-lg font-bold text-slate-800">API & Integrações</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Status API</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Ativa
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Versão</span>
              <span className="text-sm font-medium text-slate-800">v2.4.1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Requests/dia</span>
              <span className="text-sm font-medium text-slate-800">1,245</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BellRing className="w-6 h-6 text-indigo-600" />
            <h4 className="text-lg font-bold text-slate-800">Atividade Recente</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Usuários Ativos</span>
              <span className="text-sm font-medium text-slate-800">143</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Logs Hoje</span>
              <span className="text-sm font-medium text-slate-800">2,847</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Erros</span>
              <span className="text-sm font-medium text-slate-800">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}