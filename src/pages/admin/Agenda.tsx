import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, MoreVertical, XCircle, Trash2, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { AgendaItem } from '../../lib/mockData';

export default function AgendaPage() {
  const { agenda, addAgenda, updateAgenda, deleteAgenda, clients } = useData();
  const { user } = useAuth();
  const { showFeedback, confirmAction } = useFeedback();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'reunião' as AgendaItem['type'],
    time: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    client: '',
    description: ''
  });

  const myAgenda = (user?.role === 'admin' || user?.role === 'assistant') ? agenda : agenda.filter(item => item.lawyerName === user?.displayName);
  const filteredAgenda = myAgenda.filter(item => item.date === selectedDate);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addAgenda({
        ...formData,
        status: 'pending',
        lawyerName: user?.role === 'lawyer' ? user.displayName : undefined
      });
      
      showFeedback({
        title: 'Agendamento Concluído',
        message: `O compromisso "${formData.title}" foi registado na agenda.`,
        type: 'success'
      });

      setShowModal(false);
      setFormData({ 
        title: '', 
        type: 'reunião', 
        time: '', 
        date: new Date().toISOString().split('T')[0], 
        location: '', 
        client: '',
        description: ''
      });
    } catch (error) {
      showFeedback({
        title: 'Erro ao Agendar',
        message: 'Ocorreu um erro ao tentar salvar o compromisso.',
        type: 'error'
      });
    }
  };

  const handleDeleteItem = (id: string, title: string) => {
    confirmAction({
      title: 'Eliminar Compromisso',
      message: `Deseja realmente eliminar o compromisso "${title}"?`,
      onConfirm: () => {
        try {
          deleteAgenda(id);
          showFeedback({
            title: 'Agendamento Removido',
            message: 'O compromisso foi excluído da agenda com sucesso.',
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Remover',
            message: 'Ocorreu um problema ao tentar eliminar o agendamento.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: AgendaItem['status'], title: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateAgenda(id, { status: newStatus });
    showFeedback({
      title: newStatus === 'completed' ? 'Compromisso Concluído' : 'Compromisso Pendente',
      message: `O status de "${title}" foi atualizado.`,
      type: 'success'
    });
  };

  const daysInMonth = 31;
  const currentMonthName = new Intl.DateTimeFormat('pt-AO', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Agenda & Tarefas</h2>
          <p className="text-slate-500 text-sm mt-1">Gestão centralizada de audiências, reuniões e tarefas pendentes.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shadow-lg shadow-slate-900/10">
          <Plus size={16} />
          Agendar Novo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Calendar & Filters */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="card p-6 divide-y divide-slate-50">
            <div className="pb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 capitalize">{currentMonthName}</h3>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={16} /></button>
                  <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronRight size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-center text-slate-400 mb-2 uppercase tracking-widest">
                <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `2024-05-${day.toString().padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const hasItems = agenda.some(item => item.date === dateStr);
                  
                  return (
                    <button 
                      key={i} 
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative py-2.5 rounded-xl text-xs transition-all ${
                        isSelected 
                          ? 'bg-slate-900 text-white font-bold shadow-md shadow-slate-900/20' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                      {hasItems && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">Legenda de Cores</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span>Audiências Judiciais</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span>Reuniões com Clientes</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span>Tarefas Administrativas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Daily Schedule */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">
              {selectedDate === new Date().toISOString().split('T')[0] ? 'Hoje, ' : ''}
              {new Date(selectedDate).toLocaleDateString('pt-AO', { day: 'numeric', month: 'long' })}
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {filteredAgenda.length} {filteredAgenda.length === 1 ? 'Compromisso' : 'Compromissos'}
            </span>
          </div>

          <div className="space-y-4">
            {filteredAgenda.length > 0 ? (
              filteredAgenda.sort((a, b) => a.time.localeCompare(b.time)).map((item) => (
                <div 
                  key={item.id} 
                  className={`card overflow-hidden group transition-all ${
                    item.status === 'completed' ? 'opacity-60 bg-slate-50/50' : 'hover:border-accent'
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className={`w-1 md:w-2 shrink-0 ${
                      item.type === 'audiência' ? 'bg-red-500' : 
                      item.type === 'reunião' ? 'bg-blue-500' : 'bg-amber-500'
                    }`}></div>
                    
                    <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row gap-6">
                      <div className="w-20 shrink-0 flex flex-col items-center justify-center md:border-r border-slate-100 pr-0 md:pr-6">
                        <span className="text-xl font-bold text-slate-800">{item.time}</span>
                        <Clock size={14} className="text-slate-300 mt-1" />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                item.type === 'audiência' ? 'bg-red-50 text-red-600 border-red-100' : 
                                item.type === 'reunião' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {item.type}
                              </span>
                              <h4 className={`font-bold text-lg leading-tight ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {item.title}
                              </h4>
                            </div>
                            
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                <MapPin size={14} className="text-slate-300" />
                                {item.location}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                <User size={14} className="text-slate-300" />
                                {item.client}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleStatus(item.id, item.status, item.title)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                item.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                              }`}
                            >
                              <CheckCircle size={14} />
                              {item.status === 'completed' ? 'Concluído' : 'Marcar Concluído'}
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id, item.title)} 
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-dotted border-slate-200">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card p-20 flex flex-col items-center text-center space-y-4 bg-slate-50/50 border-dashed border-2">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-200 shadow-sm">
                  <CalendarIcon size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Sem compromissos agendados</h4>
                  <p className="text-sm text-slate-400 mt-1 max-w-xs">Não existem reuniões, audiências ou tarefas registadas para este dia.</p>
                </div>
                <button 
                  onClick={() => {
                    setFormData({...formData, date: selectedDate});
                    setShowModal(true);
                  }} 
                  className="text-xs font-bold text-accent uppercase tracking-widest hover:underline"
                >
                  Agendar agora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agenda Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-slate-800">Novo Compromisso</h4>
                <p className="text-[11px] text-slate-500">Insira os detalhes do evento ou tarefa.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 font-mono">Título / Assunto</label>
                <input 
                  required 
                  placeholder="Ex: Audiência de Julgamento Cível"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 font-mono">Tipo</label>
                  <select 
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-sm bg-slate-50" 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="reunião">Reunião</option>
                    <option value="audiência">Audiência</option>
                    <option value="tarefa">Tarefa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 font-mono">Data</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-sm" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 font-mono">Horário</label>
                  <input 
                    required 
                    type="time" 
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-sm" 
                    value={formData.time} 
                    onChange={e => setFormData({...formData, time: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 font-mono">Cliente</label>
                  <input 
                    required 
                    placeholder="Nome do cliente"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all" 
                    value={formData.client} 
                    onChange={e => setFormData({...formData, client: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 font-mono">Localização</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
                  <input 
                    required 
                    placeholder="Ex: Tribunal Provincial de Luanda"
                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 font-mono">Notas</label>
                <textarea 
                  rows={2}
                  placeholder="Detalhes adicionais..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all resize-none font-sans" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-2.5 rounded-xl border border-slate-100 font-bold text-slate-400 text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
