import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Shield, 
  Lock,
  Trash2,
  Filter,
  XCircle,
  UserPlus,
  Edit3
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFeedback } from '../../context/FeedbackContext';

export default function UsersManagement() {
  const { users, addUser, updateUser, deleteUser } = useData();
  const { showFeedback, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'lawyer' as any,
    password: '',
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormData({ name: '', email: '', role: 'lawyer', password: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete (updateData as any).password;
        }
        updateUser(editingUserId, updateData);
        showFeedback({
          title: 'Utilizador Atualizado',
          message: `Os dados de ${formData.name} foram salvos com sucesso.`,
          type: 'success'
        });
      } else {
        addUser({
          ...formData,
          status: 'active'
        });
        showFeedback({
          title: 'Utilizador Criado',
          message: `A conta para ${formData.name} foi criada e está ativa.`,
          type: 'success'
        });
      }
      setShowModal(false);
      setFormData({ name: '', email: '', role: 'lawyer', password: '' });
    } catch (error) {
      showFeedback({
        title: 'Erro na Operação',
        message: 'Não foi possível processar o pedido de utilizador.',
        type: 'error'
      });
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    confirmAction({
      title: 'Eliminar Utilizador',
      message: `Tem a certeza que deseja eliminar permanentemente o utilizador ${name}?`,
      onConfirm: () => {
        try {
          deleteUser(id);
          showFeedback({
            title: 'Utilizador Eliminado',
            message: `A conta de ${name} foi removida do sistema.`,
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Eliminar',
            message: 'Não foi possível remover o utilizador.',
            type: 'error'
          });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controle de Profissionais & Usuários</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie os acessos e perfis dos advogados e assistentes.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>Novo Profissional</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-card border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar no sistema..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 border-b border-slate-100">
              <tr className="h-10">
                <th className="px-6 font-semibold">Nome Completo</th>
                <th className="px-6 font-semibold">Cargo / Nível</th>
                <th className="px-6 font-semibold">E-mail Profissional</th>
                <th className="px-6 font-semibold">Status de Acesso</th>
                <th className="px-6 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="h-12 border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield size={16} className="text-slate-300" />
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      user.role === 'admin' ? 'bg-slate-900 text-white' : 
                      user.role === 'lawyer' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'lawyer' ? 'Advogado' : 'Assistente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-normal text-slate-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const newStatus = user.status === 'active' ? 'blocked' : 'active';
                        updateUser(user.id, { status: newStatus });
                        showFeedback({ 
                          title: newStatus === 'active' ? 'Acesso Reativado' : 'Acesso Bloqueado',
                          message: `O acesso de ${user.name} foi ${newStatus === 'active' ? 'reativado' : 'bloqueado'}.`,
                          type: 'success'
                        });
                      }}
                      className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    >
                      <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span className="text-[13px]">{user.status === 'active' ? 'Ativo' : 'Bloqueado'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button onClick={() => handleOpenEdit(user)} title="Editar" className="hover:text-blue-600 transition-colors"><Edit3 size={15} /></button>
                      <button 
                        onClick={() => {
                          updateUser(user.id, { status: user.status === 'active' ? 'blocked' : 'active' });
                          showFeedback({ 
                            title: user.status === 'active' ? 'Acesso Bloqueado' : 'Acesso Reativado',
                            message: `O status de acesso do utilizador ${user.name} foi alterado.`
                          });
                        }} 
                        title="Bloquear/Desbloquear" 
                        className="hover:text-amber-600 transition-colors"
                      >
                        <Shield size={14} />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id, user.name)} title="Excluir" className="hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {editingUserId ? 'Editar Dados' : 'Novo Utilizador'}
                </h3>
                <p className="text-sm text-slate-500">
                  {editingUserId ? 'Actualize as informações do membro.' : 'Cadastre um novo membro para a equipa.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Nome Completo</label>
                <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Email Profissional</label>
                <input required type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Nível de Acesso</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                  <option value="lawyer">Advogado</option>
                  <option value="assistant">Assistente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-2">
                  <Lock size={12} /> Senha de Acesso
                </label>
                <input 
                  required={!editingUserId} 
                  type="password" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" 
                  placeholder={editingUserId ? "Deixe em branco para não alterar" : "Defina uma senha forte"}
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">Esta senha será usada para autenticação no sistema.</p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-100 font-semibold text-slate-500 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-lg">
                  {editingUserId ? 'Guardar Alterações' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
