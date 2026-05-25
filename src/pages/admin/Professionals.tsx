import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  UserCircle2, 
  Briefcase, 
  GraduationCap, 
  Phone, 
  Mail,
  MoreVertical,
  XCircle,
  Edit3,
  Trash2,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Professional } from '../../lib/mockData';

export default function ProfessionalsPage() {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = useData();
  const { showFeedback, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Advogado' as Professional['role'],
    license: '',
    email: '',
    phone: ''
  });

  const filteredProfessionals = professionals.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: 'Advogado',
      license: '',
      email: '',
      phone: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prof: Professional, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(prof.id);
    setFormData({
      name: prof.name,
      role: prof.role,
      license: prof.license === '-' ? '' : prof.license,
      email: prof.email,
      phone: prof.phone
    });
    setShowModal(true);
  };

  const handleOpenProfile = (prof: Professional) => {
    setSelectedProfessional(prof);
    setShowProfileModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        license: formData.role === 'Advogado' ? formData.license : '-'
      };

      if (editingId) {
        updateProfessional(editingId, data);
        showFeedback({
          title: 'Perfil Atualizado',
          message: `Os dados do profissional ${formData.name} foram atualizados.`,
          type: 'success'
        });
      } else {
        addProfessional(data);
        showFeedback({
          title: 'Profissional Adicionado',
          message: `${formData.name} foi integrado à equipa com sucesso.`,
          type: 'success'
        });
      }
      setShowModal(false);
    } catch (error) {
      showFeedback({
        title: 'Erro no Cadastro',
        message: 'Ocorreu um erro ao processar os dados do profissional.',
        type: 'error'
      });
    }
  };

  const handleDeleteProf = (id: string, name: string) => {
    confirmAction({
      title: 'Remover Profissional',
      message: `Tem a certeza que deseja remover ${name} do corpo profissional?`,
      onConfirm: () => {
        try {
          deleteProfessional(id);
          showFeedback({
            title: 'Profissional Removido',
            message: `${name} foi removido do sistema.`,
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Remover',
            message: 'Não foi possível remover o profissional.',
            type: 'error'
          });
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Corpo Profissional</h2>
          <p className="text-slate-500 text-sm mt-1">Gestão da equipa jurídica e administrativa do escritório.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus size={16} />
          Adicionar Profissional
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar profissionais por nome, cargo ou email..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-slate-200 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.map((prof) => (
          <div key={prof.id} className="card p-6 group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={(e) => handleOpenEdit(prof, e)} className="p-1.5 hover:bg-blue-50 rounded-full text-slate-400 hover:text-blue-600"><Edit3 size={16} /></button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleDeleteProf(prof.id, prof.name); 
                }} 
                title="Excluir"
                className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                {prof.role === 'Advogado' ? <Briefcase size={28} /> : 
                 prof.role === 'Estagiário' ? <GraduationCap size={28} /> : <UserCircle2 size={28} />}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-800 text-lg truncate">{prof.name}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-accent">{prof.role}</p>
                {prof.license !== '-' && <p className="text-[10px] text-slate-400 mt-0.5">Cédula: {prof.license}</p>}
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Mail size={14} className="text-slate-300" />
                <span className="truncate">{prof.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Phone size={14} className="text-slate-300" />
                <span>{prof.phone}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Status: Ativo</p>
              <button onClick={() => handleOpenProfile(prof)} className="text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-widest">Ver Perfil</button>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{editingId ? 'Editar Profissional' : 'Novo Profissional'}</h3>
                <p className="text-sm text-slate-500">Introduza os dados do prestador de serviços.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Nome Completo</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Cargo</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-slate-50"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as any})}
                  >
                    <option value="Advogado">Advogado</option>
                    <option value="Assistente">Assistente</option>
                    <option value="Estagiário">Estagiário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Cédula Profissional</label>
                  <input 
                    disabled={formData.role !== 'Advogado'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm disabled:opacity-50 disabled:bg-slate-50"
                    placeholder="Ex: OAA/XXXX"
                    value={formData.license}
                    onChange={e => setFormData({...formData, license: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">E-mail</label>
                <input 
                  required 
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Telefone</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-2.5 rounded-xl border border-slate-100 font-semibold text-slate-500 text-sm hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-lg hover:bg-slate-800 transition-all"
                >
                  {editingId ? 'Guardar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {showProfileModal && selectedProfessional && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="relative h-32 bg-slate-100 flex items-end px-8 pb-4">
               <button 
                onClick={() => setShowProfileModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-2 bg-white rounded-full shadow-sm"
              >
                <XCircle size={20} />
              </button>
              <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-slate-300">
                   {selectedProfessional.role === 'Advogado' ? <Briefcase size={40} /> : 
                   selectedProfessional.role === 'Estagiário' ? <GraduationCap size={40} /> : <UserCircle2 size={40} />}
                </div>
              </div>
            </div>

            <div className="pt-14 pb-8 px-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedProfessional.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest">{selectedProfessional.role}</span>
                  {selectedProfessional.license !== '-' && (
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cédula: {selectedProfessional.license}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-2">
                       <Mail size={12} /> Contacto de E-mail
                    </p>
                    <p className="text-sm text-slate-700 font-medium">{selectedProfessional.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-2">
                       <Phone size={12} /> Telefone / WhatsApp
                    </p>
                    <p className="text-sm text-slate-700 font-medium">{selectedProfessional.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-2">
                       <FileText size={12} /> Processos Ativos
                    </p>
                    <p className="text-sm text-slate-700 font-medium">12 Casos em andamento</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                      Estatísticas
                    </button>
                    <button className="flex-1 py-2 rounded-lg border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                      Agenda
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex gap-4">
                <button 
                  onClick={() => setShowProfileModal(false)} 
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest"
                >
                  Fechar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
