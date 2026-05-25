import React, { useState } from 'react';
import { Plus, Search, DollarSign, Tag, Edit3, Trash2, List, XCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFeedback } from '../../context/FeedbackContext';

interface LegalService {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
}

const INITIAL_SERVICES: LegalService[] = [
  { id: '1', name: 'Consultoria Jurídica', category: 'Geral', price: '25.000 Kz', description: 'Atendimento inicial para análise de caso.' },
  { id: '2', name: 'Defesa Criminal', category: 'Criminal', price: 'Varia', description: 'Acompanhamento processual criminal completo.' },
  { id: '3', name: 'Contrato de Arrendamento', category: 'Civil', price: '50.000 Kz', description: 'Redacção e revisão de contratos imobiliários.' },
  { id: '4', name: 'Divórcio Consensual', category: 'Família', price: '150.000 Kz', description: 'Processo de divórcio por mútuo acordo.' },
];

export default function ServicesPage() {
  const { services, addService, deleteService } = useData();
  const { showFeedback, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: ''
  });

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addService(formData);
      showFeedback({
        title: 'Serviço Criado',
        message: `O serviço "${formData.name}" foi adicionado ao catálogo.`,
        type: 'success'
      });
      setShowModal(false);
      setFormData({ name: '', category: '', price: '', description: '' });
    } catch (error) {
      showFeedback({
        title: 'Erro ao Criar',
        message: 'Não foi possível salvar o novo serviço.',
        type: 'error'
      });
    }
  };

  const handleDeleteService = (id: string, name: string) => {
    confirmAction({
      title: 'Remover Serviço',
      message: `Confirma a remoção do serviço "${name}"?`,
      onConfirm: () => {
        try {
          deleteService(id);
          showFeedback({
            title: 'Serviço Removido',
            message: 'O serviço foi excluído do catálogo.',
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Remover',
            message: 'Houve um erro ao tentar eliminar o serviço.',
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
          <h2 className="text-2xl font-bold text-slate-800">Serviços & Preços</h2>
          <p className="text-slate-500 text-sm mt-1">Definição dos serviços jurídicos prestados e tabelas de valores.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Novo Serviço
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-card border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar serviços..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="card p-6 flex flex-col group hover:border-accent transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-accent transition-colors">
                 <List size={24} />
               </div>
               <button onClick={() => handleDeleteService(service.id, service.name)} title="Excluir" className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{service.name}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">{service.category}</span>
            <p className="text-xs text-slate-500 mb-6 flex-1 line-clamp-3 leading-relaxed">{service.description}</p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
               <span className="text-sm font-bold text-slate-900">{service.price}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Novo Serviço</h3>
                <p className="text-sm text-slate-500">Defina uma nova oferta jurídica.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Tag size={12} /> Nome do Serviço
                </label>
                <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-1.5">
                  <List size={12} /> Categoria
                </label>
                <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Ex: Cível, Criminal..." value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={12} /> Preço Base
                </label>
                <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Ex: 50.000 Kz" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Descrição</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-100 font-semibold text-slate-500 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
