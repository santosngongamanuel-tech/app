import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  DollarSign, 
  Settings, 
  LogOut,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  List,
  FileCode,
  BarChart3,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useFeedback } from '../context/FeedbackContext';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { alerts, updateAlert } = useData();
  const { showFeedback } = useFeedback();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadAlerts = alerts.filter(a => a.lawyerName === user?.displayName && a.status === 'unread');

  const handleLogout = () => {
    logout();
    showFeedback({
      title: 'Sessão Terminada',
      message: 'A sua sessão foi encerrada com sucesso.',
      type: 'success'
    });
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { icon: LayoutDashboard, label: 'Painel', path: '/admin', roles: ['admin', 'lawyer', 'assistant'] },
      ]
    },
    {
      title: 'Configurações',
      items: [
        { icon: Settings, label: 'Meu Perfil', path: '/admin/profile', roles: ['admin', 'lawyer', 'assistant'] },
      ]
    },
    {
      title: 'Gestão de Pessoal',
      items: [
        { icon: Users, label: 'Utilizadores', path: '/admin/users', roles: ['admin'] },
        { icon: UserCheck, label: 'Profissionais', path: '/admin/professionals', roles: ['admin'] },
        { icon: ShieldCheck, label: 'Cargos', path: '/admin/roles', roles: ['admin'] },
      ]
    },
    {
      title: 'Operacional',
      items: [
        { icon: Briefcase, label: 'Clientes', path: '/admin/clients', roles: ['admin', 'lawyer', 'assistant'] },
        { icon: List, label: 'Serviços', path: '/admin/services', roles: ['admin', 'lawyer', 'assistant'] },
        { icon: FileCode, label: 'Modelos de Contratos', path: '/admin/models', roles: ['admin', 'lawyer', 'assistant'] },
      ]
    },
    {
      title: 'Jurídico',
      items: [
        { icon: FileText, label: 'Contratos', path: '/admin/contracts', roles: ['admin', 'lawyer', 'assistant'] },
        { icon: Briefcase, label: 'Processos', path: '/admin/cases', roles: ['admin', 'lawyer', 'assistant'] },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { icon: Calendar, label: 'Agenda', path: '/admin/agenda', roles: ['admin', 'lawyer', 'assistant'] },
        { icon: DollarSign, label: 'Finanças', path: '/admin/finance', roles: ['admin', 'lawyer', 'assistant'] },
        { icon: BarChart3, label: 'Relatórios', path: '/admin/reports', roles: ['admin', 'assistant'] },
      ]
    }
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-bold tracking-tight text-accent">
            ANGADV
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            Gestão de Escritório
          </p>
        </div>

        <nav className="flex-1 py-4 space-y-6 overflow-y-auto scrollbar-none">
          {menuSections.map((section, sidx) => (
            <div key={sidx} className="space-y-1">
              <h3 className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                {section.title}
              </h3>
              {section.items.map((item) => (
                item.roles.includes(user?.role || '') && (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center px-6 py-2.5 text-sm transition-all duration-200 group
                      ${isActive 
                        ? 'border-l-4 border-accent bg-slate-800/50 text-white' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                      }
                    `}
                  >
                    <item.icon size={18} className="mr-3 opacity-70 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                    {location.pathname === item.path && <ChevronRight size={14} className="ml-auto opacity-50" />}
                  </NavLink>
                )
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.displayName.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">{user?.displayName}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-800">
              {user?.role === 'admin' ? 'Módulo Administrativo' : 
               user?.role === 'lawyer' ? 'Módulo de Advogado' : 'Módulo de Assistência'}
            </h2>
            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
              user?.role === 'admin' ? 'bg-blue-100 text-blue-700' : 
              user?.role === 'lawyer' ? 'bg-accent/20 text-primary' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {user?.role === 'admin' ? 'Acesso Total' : 
               user?.role === 'lawyer' ? 'Operacional' : 'Logística'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div 
                className="relative cursor-pointer group"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} className={`${unreadAlerts.length > 0 ? 'text-amber-500' : 'text-slate-400'} group-hover:text-primary transition-colors`} />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {unreadAlerts.length}
                  </span>
                )}
              </div>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Alertas Recebidos</span>
                    <button 
                      onClick={() => unreadAlerts.forEach(a => updateAlert(a.id, { status: 'read' }))}
                      className="text-[9px] font-bold text-accent hover:underline uppercase"
                    >
                      Limpar tudo
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {unreadAlerts.length > 0 ? unreadAlerts.map(a => (
                      <div 
                        key={a.id} 
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer border-l-4 ${
                          a.urgency === 'high' ? 'border-l-rose-500' : a.urgency === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'
                        }`}
                        onClick={() => updateAlert(a.id, { status: 'read' })}
                      >
                         <p className="text-xs font-bold text-slate-800 mb-1">{a.message}</p>
                         <div className="flex justify-between items-center">
                           <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">De: {a.senderName}</span>
                           <span className="text-[9px] text-slate-400 font-mono">
                             {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                         </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center">
                        <p className="text-xs text-slate-400 italic">Nenhum alerta pendente.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Settings 
              size={20} 
              className="text-slate-400 cursor-pointer hover:text-primary transition-colors" 
              onClick={() => navigate('/admin/profile')}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
