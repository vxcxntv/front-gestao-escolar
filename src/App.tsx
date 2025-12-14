import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts e Páginas
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Classes } from './components/Classes';
import { Grades } from './components/Grades';
import { Announcements } from './components/Announcements';
import { Teachers } from './components/Teachers';

// Novas páginas que criamos
import { AttendancePage } from './components/Attendance';
import { FinancePage } from './components/Finance';
import { EventsPage } from './components/Events';
import { ReportsPage } from './components/Reports';
import { SubjectsPage } from './components/Subjects';
import { UsersPage } from './components/Users';
import { SettingsPage } from './components/Settings';

// Componente de Proteção de Rota
function PrivateRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

// Layout principal com Sidebar
function MainLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas (Requer Login) */}
          <Route element={<PrivateRoutes />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Módulo Acadêmico */}
              <Route path="/students" element={<Students />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/attendance" element={<AttendancePage />} />
              
              {/* Módulo Financeiro */}
              <Route path="/finance" element={<FinancePage />} />
              
              {/* Módulo Comunicação */}
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/events" element={<EventsPage />} />
              
              {/* Módulo Relatórios */}
              <Route path="/reports" element={<ReportsPage />} />
              
              {/* Módulo Administrativo */}
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}