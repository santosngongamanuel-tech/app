import React from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function AdminDashboard() {
  const { users, clients, contracts, cases } = useData();

  const stats = [
    { label: 'Total de Clientes', value: clients.length, icon: Users, change: '+12%', color: 'text-blue-600' },
    { label: 'Processos Ativos', value: cases.filter(c => c.status === 'active').length, icon: Briefcase, change: '+5%', color: 'text-green-600' },
    { label: 'Contratos este mês', value: contracts.length, icon: FileText, change: '+18%', color: 'text-accent' },
    { label: 'Receita Mensal', value: '4.5M Kz', icon: TrendingUp, change: '+7%', color: 'text-emerald-600' },
  ];

  const recentCases = cases.slice(-4).map(c => ({
    id: c.id,
    title: c.title,
    status: c.status === 'active' ? 'Em curso' : c.status === 'pending' ? 'Pendente' : 'Concluído',
    date: c.lastUpdate
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel de Controle</h2>
          <p className="text-slate-500 text-sm mt-1">Bem-vindo de volta ao sistema de gestão jurídica.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status do Escritório</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-700">Online & Sincronizado</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`card p-5 border-l-4 ${
            i === 0 ? 'border-accent' : 
            i === 1 ? 'border-primary' : 
            i === 2 ? 'border-emerald-500' : 'border-purple-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <stat.icon size={16} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            <p className={`text-[10px] mt-2 font-semibold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
              {stat.change} em relação ao mês anterior
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-700">Actividade Recente</h3>
            <button className="text-xs text-primary font-bold hover:underline">Ver Processos</button>
          </div>
          <div className="card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {recentCases.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                      {item.status === 'Concluído' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Clock size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] uppercase font-bold tracking-tight px-1.5 py-0.5 rounded ${
                    item.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' : 
                    item.status === 'Pendente' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications/Alerts */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700">Alertas do Sistema</h3>
          <div className="space-y-3">
            <div className="p-4 bg-white border border-slate-200 border-l-4 border-l-red-500 rounded-lg shadow-sm">
              <div className="flex gap-3">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Prazo Crítico</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Audiência de custódia agendada para amanhã às 09:30.</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-lg shadow-sm">
              <div className="flex gap-3">
                <AlertCircle size={18} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Pendência Financeira</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">3 contratos vencidos aguardando regularização.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
