import React, { useState } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Edit3, 
  Trash2,
  ChevronRight,
  XCircle,
  Check
} from 'lucide-react';

import { useFeedback } from '../../context/FeedbackContext';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  members: number;
}

const INITIAL_ROLES: Role[] = [
  { 
    id: '1', 
    name: 'Administrador', 
    description: 'Acesso total a todas as funcionalidades do sistema, incluindo finanças e gestão de pessoal.',
    permissions: ['Gestão de Utilizadores', 'Finanças', 'Processos', 'Contratos', 'Agenda'],
    members: 2
  },
  { 
    id: '2', 
    name: 'Advogado', 
    description: 'Responsável pela gestão jurídica dos processos e criação de contratos para os seus clientes.',
    permissions: ['Processos', 'Contratos', 'Agenda', 'Consultar Finanças'],
    members: 8
  },
  { 
    id: '3', 
    name: 'Assistente / Secretário', 
    description: 'Apoio administrativo, cadastro de clientes e organização documental inicial.',
    permissions: ['Cadastro de Clientes', 'Agenda', 'Consultar Processos'],
    members: 5
  },
];

const AVAILABLE_PERMISSIONS = [
  'Gestão de Utilizadores',
  'Finanças',
  'Processos',
  'Contratos',
  'Agenda',
  'Consultar Finanças',
  'Consultar Processos',
  'Cadastro de Clientes',
  'Relatórios'
];

export default function RolesPage() {
  const { showFeedback, confirmAction } = useFeedback();
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setShowModal(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingId(role.id);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setShowModal(true);
  };

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setRoles(roles.map(r => r.id === editingId ? { ...r, ...formData } : r));
      showFeedback({
        title: 'Cargo Atualizado',
        message: `As permissões do cargo ${formData.name} foram salvas.`,
        type: 'success'
      });
    } else {
      const newRole: Role = {
        id: Math.random().toString(36).substring(2, 9),
        ...formData,
        members: 0
      };
      setRoles([...roles, newRole]);
      showFeedback({
        title: 'Novo Cargo Criado',
        message: `O cargo ${formData.name} já está disponível para atribuição.`,
        type: 'success'
      });
    }
    setShowModal(false);
  };

  const deleteRole = (id: string, name: string) => {
    confirmAction({
      title: 'Excluir Cargo',
      message: `Tem certeza que deseja excluir o cargo ${name}?`,
      onConfirm: () => {
        setRoles(roles.filter(r => r.id !== id));
        showFeedback({
          title: 'Cargo Removido',
          message: `O cargo ${name} foi eliminado do sistema.`,
          type: 'success'
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cargos e Permissões</h2>
          <p className="text-slate-500 text-sm mt-1">Definição da estrutura hierárquica e níveis de acesso do sistema.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus size={16} />
          Criar Cargo
        </button>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="card p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-accent transition-colors">
            <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 transition-transform group-hover:scale-105">
              <ShieldCheck size={28} />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-slate-800">{role.name}</h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">{role.members} Membros</span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl">{role.description}</p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {role.permissions.map((perm, i) => (
                  <span key={i} className="text-[9px] font-bold uppercase tracking-tight bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-400">
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 md:border-l md:border-slate-100 md:pl-6">
              <button 
                onClick={() => handleOpenEdit(role)}
                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button 
                onClick={() => deleteRole(role.id, role.name)}
                title="Excluir"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} />
              </button>
              <button className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:text-accent transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-dashed border-slate-200 rounded-lg p-8 text-center mt-8">
        <Lock size={24} className="mx-auto text-slate-300 mb-3" />
        <h4 className="font-bold text-slate-700">Controle de Segurança</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-medium">As permissões alteradas aqui reflectem-se instantaneamente em todos os utilizadores associados ao cargo.</p>
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {editingId ? 'Editar Cargo' : 'Novo Cargo'}
                </h3>
                <p className="text-sm text-slate-500">Configure o nome e as permissões de acesso.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Nome do Cargo</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all"
                  placeholder="Ex: Gestor Financeiro"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Descrição</label>
                <textarea 
                  required 
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-accent transition-all resize-none"
                  placeholder="Breve descrição das responsabilidades..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3 font-mono">Permissões de Acesso</label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isSelected = formData.permissions.includes(perm);
                    return (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => togglePermission(perm)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          isSelected 
                            ? 'bg-accent/10 border-accent text-accent border' 
                            : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-accent' : 'bg-slate-200'}`}>
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        {perm}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 rounded-xl border border-slate-100 font-bold text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
                >
                  {editingId ? 'Salvar Alterações' : 'Criar Cargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
