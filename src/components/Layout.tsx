import { useState } from 'react';
import { ReactNode } from 'react'; // Adicionar import
import { AppSidebar } from './AppSidebar';
import { Home, Users, BookOpen, Award, Megaphone, Menu, X, Clock,
  DollarSign, Calendar, BarChart3, Settings, GraduationCap, FileText, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode; // Adicionar interface para props
}

export function Layout({ children }: LayoutProps) { // Receber children como prop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/users', label: 'Usuários', icon: Users },
    { path: '/students', label: 'Estudantes', icon: GraduationCap },
    { path: '/teachers', label: 'Professores', icon: User },
    { path: '/classes', label: 'Turmas', icon: BookOpen },
    { path: '/subjects', label: 'Disciplinas', icon: BookOpen },
    { path: '/grades', label: 'Notas', icon: Award },
    { path: '/attendance', label: 'Frequência', icon: Clock },
    { path: '/finance', label: 'Financeiro', icon: DollarSign },
    { path: '/events', label: 'Eventos', icon: Calendar },
    { path: '/announcements', label: 'Avisos', icon: Megaphone },
    { path: '/reports', label: 'Relatórios', icon: BarChart3 },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Backdrop para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 z-50 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out h-full`}>
          <AppSidebar
            menuItems={menuItems}
            onMobileClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Mobile */}
          <header className="lg:hidden bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-bold text-slate-800">Gestão Escolar</span>
            </div>
            
            <div className="w-10"></div>
          </header>

          {/* Conteúdo */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children} {/* Usar children em vez de Outlet */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}