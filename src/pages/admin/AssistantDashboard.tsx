import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  Clock, 
  Bell, 
  CheckCircle2, 
  ClipboardList,
  AlertCircle,
  Plus,
  Search,
  Send,
  XCircle,
  UserCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Link } from 'react-router-dom';

export default function AssistantDashboard() {
  const { clients, agenda, transactions, cases, professionals, alerts, addAlert } = useData();
  const { user } = useAuth();
  const { showFeedback } = useFeedback();
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyData, setNotifyData] = useState({ lawyer: '', message: '', urgency: 'medium' as any });

  const assistantName = user?.displayName || 'Rosa Silva';
  const today = new Date().toISOString().split('T')[0];
  const todaysAgenda = agenda.filter(a => a.date === today);
  
  const stats = [
    { label: 'Clientes Registados', value: clients.length, icon: Users, color: 'text-blue-600', path: '/admin/clients' },
    { label: 'Compromissos Hoje', value: todaysAgenda.length, icon: Calendar, color: 'text-amber-600', path: '/admin/agenda' },
    { label: 'Processos Ativos', value: cases.filter(c => c.status === 'active').length, icon: ClipboardList, color: 'text-emerald-600', path: '/admin/cases' },
    { label: 'Finanças (Rec.)', value: transactions.filter(t => t.type === 'revenue').length, icon: DollarSign, color: 'text-rose-600', path: '/admin/finance' },
  ];

  const lawyers = professionals.filter(p => p.role === 'Advogado');

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addAlert({
        lawyerName: notifyData.lawyer,
        message: notifyData.message,
        urgency: notifyData.urgency,
        senderName: assistantName
      });

      showFeedback({
        title: 'Alerta Enviado',
        message: `O advogado ${notifyData.lawyer} foi notificado com sucesso.`,
        type: 'success'
      });

      setShowNotifyModal(false);
      setNotifyData({ lawyer: '', message: '', urgency: 'medium' });
    } catch (error) {
      showFeedback({
        title: 'Erro no Envio',
        message: 'Não foi possível enviar a notificação ao advogado.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Módulo Administrativo • {assistantName}</h2>
          <p className="text-slate-500 text-sm mt-1">Gestão de Logística, Clientes e Apoio Jurídico.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => setShowNotifyModal(true)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"
           >
             <Bell size={16} className="text-amber-500" />
             Alertar Advogado
           </button>
           <Link to="/admin/clients" className="btn-primary shadow-lg shadow-primary/20 flex items-center gap-2">
             <Plus size={16} />
             Registar Cliente
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link key={i} to={stat.path} className="card p-6 border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
               <stat.icon size={80} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">{stat.label}</p>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono">Controlo de Logística</h3>
            <span className="text-[10px] text-slate-400">Andamento de Hoje: {new Date().toLocaleDateString()}</span>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                   <th className="px-6 py-3 text-left border-b border-slate-100">Horário</th>
                   <th className="px-6 py-3 text-left border-b border-slate-100">Evento / Advogado</th>
                   <th className="px-6 py-3 text-left border-b border-slate-100">Localização</th>
                   <th className="px-6 py-3 text-right border-b border-slate-100">Notificar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {todaysAgenda.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">{item.time}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-tighter mt-0.5">{item.lawyerName || 'A definir'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{item.location}</td>
                    <td className="px-6 py-4 text-right">
                       <button 
                        onClick={() => {
                          setNotifyData({...notifyData, lawyer: item.lawyerName || '', message: `Lembrete: ${item.title} às ${item.time}`});
                          setShowNotifyModal(true);
                        }}
                        className="p-1.5 text-slate-300 hover:text-accent group transition-colors"
                       >
                         <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                       </button>
                    </td>
                  </tr>
                ))}
                {todaysAgenda.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                       Sem compromissos agendados para hoje.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Assistant Specific Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="card p-6 bg-slate-900 border-none shadow-xl shadow-slate-200/50">
              <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <FileText size={16} className="text-accent" />
                Gestão Documental
              </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer">
                    <span className="text-xs text-white/70">Contratos p/ Validação</span>
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded">3</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer">
                    <span className="text-xs text-white/70">Pagamentos a Confirmar</span>
                    <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded">2</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer">
                    <span className="text-xs text-white/70">Documentos do Tribunal</span>
                    <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded">5</span>
                  </div>
                </div>
            </div>
            
            <div className="card p-6 border-accent/20 bg-accent/5">
              <h4 className="text-primary font-black text-sm mb-4 flex items-center gap-2">
                <AlertCircle size={16} />
                Lembretes Internos
              </h4>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl border border-accent/10 shadow-sm">
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    "Recolher assinaturas pendentes do João Silva para o processo #0054 hoje."
                  </p>
                </div>
                <button 
                  onClick={() => setShowNotifyModal(true)}
                  className="w-full py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Criar Novo Alerta
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status of notified lawyers */}
        <div className="space-y-6">
          <div className="px-2">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2">
               <UserCheck size={16} className="text-accent" />
               Status de Alerta (Adv)
             </h3>
          </div>

          <div className="card divide-y divide-slate-50">
             {alerts.slice(0, 5).map((n) => (
                <div key={n.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="text-xs font-bold text-slate-800 leading-none group-hover:text-accent transition-colors">{n.lawyerName}</h5>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3 line-clamp-1">{n.message}</p>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className={`w-1.5 h-1.5 rounded-full ${n.status === 'read' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    {n.status === 'read' ? 'Lida' : 'Enviada'}
                  </div>
                </div>
             ))}
             {alerts.length === 0 && (
               <div className="p-8 text-center text-slate-400 italic text-xs">
                 Nenhuma notificação enviada.
               </div>
             )}
             <div className="p-4">
                <button className="w-full py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-colors">
                  Ver Todo Histórico
                </button>
             </div>
          </div>

          {/* Quick Client Search */}
          <div className="card p-5 bg-white border-2 border-dashed border-slate-200">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Pesquisa Rápida Gestão</h4>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
               <input 
                 type="text" 
                 placeholder="Cód. Cliente ou Processo"
                 className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-accent"
               />
             </div>
             <p className="text-[9px] text-slate-400 mt-3 italic line-clamp-1 italic">Organize a documentação antes do contacto.</p>
          </div>
        </div>
      </div>

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Enviar Alerta Interno</h3>
                <p className="text-[11px] text-slate-500">Notificação direta ao painel do advogado.</p>
              </div>
              <button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            
            <form onSubmit={handleNotify} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Seleccionar Advogado</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-accent outline-none"
                  value={notifyData.lawyer}
                  onChange={e => setNotifyData({...notifyData, lawyer: e.target.value})}
                >
                  <option value="">Escolher profissional...</option>
                  {lawyers.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Mensagem do Alerta</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-accent outline-none font-medium"
                  placeholder="Ex: Cliente aguardando na sala de reuniões."
                  value={notifyData.message}
                  onChange={e => setNotifyData({...notifyData, message: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Nível de Urgência</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNotifyData({...notifyData, urgency: level as any})}
                      className={`py-2 text-[9px] font-black uppercase rounded-lg border transition-all ${
                        notifyData.urgency === level 
                          ? (level === 'high' ? 'bg-rose-500 text-white border-rose-500' : level === 'medium' ? 'bg-amber-500 text-white border-amber-500' : 'bg-emerald-500 text-white border-emerald-500')
                          : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {level === 'low' ? 'Baixa' : level === 'medium' ? 'Média' : 'Urgente'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Send size={14} /> Enviar Notificação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
