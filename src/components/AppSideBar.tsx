import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LucideIcon, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
    path: string;
    label: string;
    icon: LucideIcon;
}

interface AppSidebarProps {
    menuItems: MenuItem[];
    onMobileClose?: () => void;
}

export function AppSidebar({ menuItems, onMobileClose }: AppSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
        onMobileClose?.();
    };

    return (
        // Glassmorphism Dark para a Sidebar
        <aside className="w-64 h-screen bg-slate-900/95 backdrop-blur-xl text-white flex flex-col flex-shrink-0 border-r border-white/10">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">EduGestão</h1>
                        <p className="text-slate-400 text-xs">Sistema Escolar</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto space-y-1">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</p>
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={onMobileClose}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {/* Indicador ativo */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-300 rounded-r-full" />
                                    )}

                                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/20">
                {/* ADICIONE onClick AQUI (ÚNICA ALTERAÇÃO VISÍVEL) */}
                <div 
                    onClick={handleLogout} // ADICIONE ESTE onClick
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-sm">
                            AD
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium text-sm text-white group-hover:text-indigo-300 transition-colors">Administrador</p>
                        <p className="text-xs text-slate-400 truncate">admin@escola.com</p>
                    </div>
                    <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                </div>
            </div>
        </aside>
    );
}