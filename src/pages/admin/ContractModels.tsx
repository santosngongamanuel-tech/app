import React, { useState } from 'react';
import { Plus, Search, FileText, Edit3, Trash2, Copy, FileCheck, XCircle, Tag, AlignLeft } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { ContractModel } from '../../lib/mockData';

export default function ContractModelsPage() {
  const { contractModels, addContractModel, updateContractModel, deleteContractModel } = useData();
  const { showFeedback, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: ''
  });

  const filteredModels = contractModels.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: '',
      content: 'Este contrato é celebrado entre [NOME DO ESCRITÓRIO], adiante designado por CONTRATADO, e {{CLIENT_NAME}}, adiante designado por CONTRATANTE.\n\nCláusula 1ª (Objecto)...\nCláusula 2ª (Honorários)...'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (model: ContractModel) => {
    setEditingId(model.id);
    setFormData({
      title: model.title,
      category: model.category,
      content: model.content
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        lastUpdated: new Date().toLocaleDateString('pt-AO')
      };

      if (editingId) {
        updateContractModel(editingId, data);
        showFeedback({
          title: 'Modelo Atualizado',
          message: `O template "${formData.title}" foi atualizado com sucesso.`,
          type: 'success'
        });
      } else {
        addContractModel(data);
        showFeedback({
          title: 'Modelo Criado',
          message: `O novo modelo "${formData.title}" foi adicionado ao sistema.`,
          type: 'success'
        });
      }
      setShowModal(false);
    } catch (error) {
      showFeedback({
        title: 'Erro no Modelo',
        message: 'Ocorreu um erro ao processar o modelo de contrato.',
        type: 'error'
      });
    }
  };

  const handleDeleteModel = (id: string, title: string) => {
    confirmAction({
      title: 'Eliminar Modelo',
      message: `Confirma a eliminação permanente do modelo "${title}"?`,
      onConfirm: () => {
        try {
          deleteContractModel(id);
          showFeedback({
            title: 'Modelo Removido',
            message: 'O template foi excluído do sistema.',
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Eliminar',
            message: 'Não foi possível remover o modelo.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleDuplicate = (model: ContractModel) => {
    try {
      addContractModel({
        title: `${model.title} (Cópia)`,
        category: model.category,
        content: model.content,
        lastUpdated: new Date().toLocaleDateString('pt-AO')
      });
      showFeedback({
        title: 'Modelo Duplicado',
        message: `Uma cópia de "${model.title}" foi criada.`,
        type: 'success'
      });
    } catch (error) {
       showFeedback({
          title: 'Erro ao Duplicar',
          message: 'Não foi possível criar a cópia do modelo.',
          type: 'error'
        });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Modelos de Contratos</h2>
          <p className="text-slate-500 text-sm mt-1">Gestão de cláusulas e templates para geração automática.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus size={16} />
          Novo Modelo
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar modelos por título ou categoria..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-slate-200 outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <div key={model.id} className="card p-6 group hover:border-accent transition-colors flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 group-hover:text-accent group-hover:bg-accent/5 transition-all">
                <FileText size={24} />
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleOpenEdit(model)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar Modelo"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => handleDuplicate(model)}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Duplicar"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteModel(model.id, model.title)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-accent transition-colors">
              {model.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/5 border border-accent/10 px-2.5 py-1 rounded-full">
                <Tag size={10} /> {model.category}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Última actualização: {model.lastUpdated}
              </span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-3 mb-6 flex-1 italic">
              "{model.content.substring(0, 150)}..."
            </p>

            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
               <button 
                onClick={() => handleOpenEdit(model)}
                className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-widest hover:text-accent transition-colors"
              >
                 <FileCheck size={12} />
                 Gerir Cláusulas
               </button>
               <span className="text-[10px] font-bold text-slate-300 font-mono">ID: {model.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {editingId ? 'Editar Modelo de Contrato' : 'Novo Modelo de Contrato'}
                </h3>
                <p className="text-sm text-slate-500">Configure o template e as cláusulas jurídicas padrão.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Título do Modelo</label>
                  <label className="relative block">
                    <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      required 
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all"
                      placeholder="Ex: Contrato de Prestação de Serviços"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Categoria</label>
                  <label className="relative block">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      required 
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all"
                      placeholder="Ex: Cível, Penal, Comercial"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5 px-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">Conteúdo e Cláusulas Jurídicas</label>
                  <div className="text-[9px] text-slate-400 flex gap-2">
                    <span>Variavéis:</span>
                    <code className="bg-slate-50 px-1 rounded text-accent">{"{{CLIENT_NAME}}"}</code>
                    <code className="bg-slate-50 px-1 rounded text-accent">{"{{CLIENT_NIF}}"}</code>
                    <code className="bg-slate-50 px-1 rounded text-accent">{"{{VALUE}}"}</code>
                  </div>
                </div>
                <textarea 
                  required 
                  rows={12}
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all resize-none font-serif leading-relaxed custom-scrollbar"
                  placeholder="Insera aqui as cláusulas do contrato..."
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 rounded-xl border border-slate-100 font-bold text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-50"
                >
                  Descartar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
                >
                  {editingId ? 'Actualizar Modelo' : 'Criar Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

