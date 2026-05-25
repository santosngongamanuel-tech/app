import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
  ClipboardList,
  DollarSign,
  XCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';

export default function LawyerDashboard() {
  const { clients, cases, agenda, contracts, alerts, updateAlert, updateAgenda, addTransaction } = useData();
  const { user } = useAuth();
  const { showFeedback } = useFeedback();
  
  // State for attendance conclusion modal
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [attendanceDecision, setAttendanceDecision] = useState('');
  const [hasFee, setHasFee] = useState(false);
  const [feeAmount, setFeeAmount] = useState('50000'); // Standard consultation rate prefill (50k Kz)

  // Filter data for current lawyer
  const lawyerName = user?.displayName || '';
  const myCases = cases.filter(c => c.lawyer === lawyerName || c.lawyer.includes(lawyerName));
  const myAgenda = agenda.filter(a => (a.lawyerName === lawyerName || !a.lawyerName) && a.date >= new Date().toISOString().split('T')[0]);
  const myAlerts = alerts.filter(a => a.lawyerName === lawyerName).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Pending attendances (meetings or appointments designated for this lawyer)
  const pendingAttendances = agenda.filter(item => 
    (item.lawyerName === lawyerName) && 
    item.status === 'pending'
  );

  const stats = [
    { label: 'Meus Processos Ativos', value: myCases.filter(c => c.status === 'active').length, icon: Briefcase, color: 'text-primary' },
    { label: 'Atendimentos Pendentes', value: pendingAttendances.length, icon: Users, color: 'text-emerald-600' },
    { label: 'Tarefas para Hoje', value: myAgenda.filter(a => a.date === new Date().toISOString().split('T')[0]).length, icon: Calendar, color: 'text-amber-600' },
    { label: 'Contratos Vinculados', value: contracts.length, icon: FileText, color: 'text-accent' },
  ];

  const handleOpenAttendanceModal = (item: any) => {
    setSelectedAttendance(item);
    setAttendanceNotes('');
    setAttendanceDecision('');
    setHasFee(false);
    setFeeAmount('50000');
    setIsAttendanceModalOpen(true);
  };

  const handleCompleteAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendance) return;

    try {
      // 1. Build rich professional layout with date, notes and decision
      const timeString = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
      const dateString = new Date().toLocaleDateString('pt-AO');
      
      const sessionSummary = `\n\n--- NOTAS DE ATENDIMENTO CONCLUÍDO EM ${dateString} às ${timeString} ---\n` +
                             `Resumo do Atendimento: ${attendanceNotes || 'Sem observações lançadas.'}\n` +
                             `Decisões / Próximos Passos: ${attendanceDecision || 'Nenhuma acção definida.'}\n` +
                             `Faturado: ${hasFee ? `${parseFloat(feeAmount).toLocaleString()} Kz` : 'Não lançado'}\n` +
                             `-------------------------------------------------------------`;

      // Update agenda item to completed
      updateAgenda(selectedAttendance.id, {
        status: 'completed',
        description: selectedAttendance.description 
          ? `${selectedAttendance.description}${sessionSummary}` 
          : sessionSummary.trim()
      });

      // 2. Insert transaction if required
      if (hasFee) {
        const amountNum = parseFloat(feeAmount);
        if (!isNaN(amountNum) && amountNum > 0) {
          addTransaction({
            description: `Honorários de Atendimento - Cliente: ${selectedAttendance.client}`,
            amount: amountNum,
            displayAmount: amountNum.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }).replace('AOA', 'Kz'),
            type: 'revenue',
            category: 'Honorários',
            date: new Date().toISOString().split('T')[0],
            clientId: clients.find(c => c.name === selectedAttendance.client)?.id || undefined,
            lawyerName: lawyerName
          });
        }
      }

      showFeedback({
        title: 'Atendimento Concluído',
        message: `O atendimento prestado a ${selectedAttendance.client} foi encerrado e registado na ficha com sucesso.`,
        type: 'success'
      });

      setIsAttendanceModalOpen(false);
      setSelectedAttendance(null);
    } catch (error) {
      showFeedback({
        title: 'Erro de Submissão',
        message: 'Falha técnica ao tentar gravar o término do atendimento.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Olá, {lawyerName}</h2>
          <p className="text-slate-500 text-sm mt-1">Aqui está o resumo jurídico do seu dia no escritório.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <Clock size={16} className="text-accent" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest font-mono">
            {new Date().toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl bg-slate-50 group-hover:bg-accent/10 transition-colors ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-slate-200" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Client Services / Meetings list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight text-sm">Fila de Atendimento do Dia</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                {pendingAttendances.length} Por Concluir
              </span>
            </div>

            <div className="card overflow-hidden">
              <div className="divide-y divide-slate-100">
                {pendingAttendances.length > 0 ? pendingAttendances.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        item.type === 'audiência' ? 'bg-rose-50 text-rose-500' : 
                        item.type === 'reunião' ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-500'
                      } flex items-center justify-center`}>
                        {item.type === 'audiência' ? <Scale size={18} /> : <Users size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg font-mono bg-slate-100 text-slate-600 uppercase">
                            {item.type}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold font-mono">
                            {item.date} às {item.time}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mt-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Cliente: <span className="text-slate-700 font-semibold">{item.client}</span></p>
                        {item.location && <p className="text-[10px] text-slate-400 font-medium">Local: {item.location}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button 
                        onClick={() => handleOpenAttendanceModal(item)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
                      >
                        <CheckCircle2 size={14} />
                        Concluir Atendimento
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center flex flex-col items-center justify-center text-slate-400">
                    <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
                    <p className="text-sm font-bold text-slate-700">Todos os Atendimentos Feitos</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">Nenhum atendimento ou reunião com status pendente agendado para si.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Active Cases */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-accent rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight text-sm">Meus Processos Ativos</h3>
              </div>
              <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Gerir Tudo</button>
            </div>
            
            <div className="card overflow-hidden">
              <div className="divide-y divide-slate-50">
                {myCases.length > 0 ? myCases.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 font-mono text-[10px] font-bold">
                        #{c.caseNumber.split('/')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{c.title}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Cliente: {c.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                        c.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.priority}
                      </span>
                      <button className="text-slate-300 hover:text-accent transition-colors">
                        <Clock size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-400 italic text-sm">
                    Nenhum processo atribuído encontrado.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications and Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight text-sm">Alertas do Assistente</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">{myAlerts.filter(a => a.status === 'unread').length} Novos</span>
          </div>
          
          <div className="space-y-3">
            {myAlerts.slice(0, 4).map((n) => (
              <div 
                key={n.id} 
                className={`p-4 bg-white border rounded-2xl shadow-sm transition-all group cursor-pointer relative overflow-hidden ${
                  n.status === 'unread' ? 'border-amber-200' : 'border-slate-100 opacity-60'
                }`}
                onClick={() => updateAlert(n.id, { status: n.status === 'unread' ? 'read' : 'unread' })}
              >
                {n.status === 'unread' && (
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                    <div className="bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-tighter w-full py-1 text-center rotate-45 translate-x-5 translate-y-1">NOVO</div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    n.urgency === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                    n.urgency === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-xs font-bold leading-tight group-hover:text-accent transition-colors ${n.status === 'unread' ? 'text-slate-800' : 'text-slate-500'}`}>{n.message}</h4>
                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                       <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">DE: {n.senderName}</span>
                       {n.status === 'read' && <CheckCircle2 size={12} className="text-emerald-500" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {myAlerts.length === 0 && (
               <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400 text-xs italic">
                 Nenhum alerta recebido.
               </div>
            )}
          </div>

          <div className="flex items-center justify-between px-2 pt-4">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight text-sm">Próximos Compromissos</h3>
            <Calendar size={16} className="text-slate-300" />
          </div>
          
          <div className="space-y-3">
            {myAgenda.slice(0, 2).map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date} • {item.time}</span>
                  <div className={`w-1 h-1 rounded-full ${item.type === 'audiência' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                </div>
                <h5 className="text-xs font-bold text-slate-700 mt-1">{item.title}</h5>
              </div>
            ))}
          </div>

          <div className="card p-4 bg-primary text-white border-none mt-6 overflow-hidden relative group">
             <div className="relative z-10">
                <h4 className="font-bold text-sm tracking-tight">Produtividade Semanal</h4>
                <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest">Check-in Automático</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-black">92%</span>
                  <span className="text-[10px] opacity-60">eficiência</span>
                </div>
             </div>
             <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
               <CheckCircle2 size={80} />
             </div>
          </div>
        </div>
      </div>

      {/* Modern, Adaptive Attendance Conclusion Modal */}
      {isAttendanceModalOpen && selectedAttendance && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl transition-all duration-300 p-8 flex flex-col overflow-hidden border border-slate-200">
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Conclusão de Atendimento</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Ficha de Consulta de <span className="font-bold text-slate-700">{selectedAttendance.client}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setIsAttendanceModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleCompleteAttendance} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1 space-y-5 min-h-0 pb-4">
                {/* Meta details */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-200/60 space-y-2 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">Compromisso</span>
                    <span className="text-slate-700 font-bold">{selectedAttendance.title}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-slate-400 font-medium">Data / Hora</span>
                    <span className="text-slate-700 font-semibold font-mono">{selectedAttendance.date} às {selectedAttendance.time}</span>
                  </div>
                </div>

                {/* Consultation Notes */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-slate-400" /> Resumo do Atendimento / Notas do Advogado
                  </label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm leading-relaxed"
                    placeholder="Registe o parecer inicial do caso, as alegações do cliente, objectivos ou outros detalhes abordados."
                    value={attendanceNotes}
                    onChange={(e) => setAttendanceNotes(e.target.value)}
                  />
                </div>

                {/* Juridic steps / Decisao */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-1.5">
                    <ClipboardList size={12} className="text-slate-400" /> Deliberações & Próximos Passos recomendados
                  </label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm"
                    placeholder="Ex: Elaborar minuta de petição inicial; peticionar certidão etc."
                    value={attendanceDecision}
                    onChange={(e) => setAttendanceDecision(e.target.value)}
                  />
                </div>

                {/* Financial integration */}
                <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500/40 w-4 h-4"
                      checked={hasFee}
                      onChange={(e) => setHasFee(e.target.checked)}
                    />
                    <div className="select-none">
                      <p className="text-xs font-bold text-slate-700">Lançar taxa de atendimento no Financeiro</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Adiciona uma receita de honorários associada a este cliente.</p>
                    </div>
                  </label>

                  {hasFee && (
                    <div className="animate-in slide-in-from-top duration-200">
                      <label className="block text-[10px] uppercase font-bold text-emerald-700/80 mb-1 flex items-center gap-1">
                        <DollarSign size={10} /> Valor da Consulta (Kz)
                      </label>
                      <input 
                        type="number" 
                        required
                        className="w-full px-4 py-2 rounded-xl border border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/25 outline-none text-sm font-bold text-slate-700"
                        value={feeAmount}
                        onChange={(e) => setFeeAmount(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-500 hover:bg-slate-50 text-xs transition-colors"
                >
                  Continuar em Aberto
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors text-xs shadow-lg flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Confirmar & Concluir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
