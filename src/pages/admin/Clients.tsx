import React, { useState } from 'react';
import { Plus, Search, UserPlus, Mail, Phone, MapPin, MoreHorizontal, FileText, Filter, XCircle, Trash2, Edit3, Eye } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Link } from 'react-router-dom';

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const { user } = useAuth();
  const { showFeedback, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.nif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const clientDate = new Date(client.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = clientDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = clientDate >= lastWeek;
      } else if (dateFilter === 'month') {
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = clientDate >= lastMonth;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const [formData, setFormData] = useState({
    name: '',
    nif: '',
    email: '',
    phone: '',
    address: '',
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive'
  });

  const formatPhone = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Format as 9XX XXX XXX (Angola standard)
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        updateClient(editingClient, formData);
        showFeedback({
          title: 'Cliente Atualizado',
          message: `Os dados de ${formData.name} foram salvos com sucesso no sistema.`,
          type: 'success'
        });
      } else {
        addClient(formData);
        showFeedback({
          title: 'Cliente Cadastrado',
          message: `${formData.name} foi registado com sucesso na base de dados.`,
          type: 'success'
        });
      }
      closeModal();
    } catch (error) {
      showFeedback({
        title: 'Erro na Operação',
        message: 'Não foi possível processar o registo. Tente novamente.',
        type: 'error'
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    confirmAction({
      title: 'Excluir Cliente',
      message: `Tem certeza que deseja excluir o cliente ${name}?`,
      onConfirm: () => {
        try {
          deleteClient(id);
          showFeedback({
            title: 'Cliente Excluído',
            message: `O registo de ${name} foi removido permanentemente.`,
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Excluir',
            message: 'Ocorreu um problema ao tentar remover o cliente.',
            type: 'error'
          });
        }
      }
    });
  };

  const openEdit = (client: any) => {
    setEditingClient(client.id);
    setFormData({
      name: client.name,
      nif: client.nif,
      email: client.email,
      phone: client.phone,
      address: client.address,
      createdAt: client.createdAt || new Date().toISOString().split('T')[0],
      status: client.status
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({ 
      name: '', 
      nif: '', 
      email: '', 
      phone: '', 
      address: '',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Clientes</h2>
          <p className="text-slate-500 text-sm mt-1">Cadastro e manutenção da base de clientes do escritório.</p>
        </div>
        {user?.role !== 'lawyer' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <UserPlus size={16} />
            Novo Cliente
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-card border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome, NIF ou email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 outline-none focus:ring-1 focus:ring-slate-300 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 outline-none focus:ring-1 focus:ring-slate-300 transition-all"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Qualquer Data</option>
            <option value="today">Hoje</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="table-header">
              <tr>
                <th className="px-6">Cliente</th>
                <th className="px-6">NIF</th>
                <th className="px-6">Contato</th>
                <th className="px-6">Status</th>
                <th className="px-6">Cadastro</th>
                <th className="px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {filteredClients.map((client) => (
                <tr key={client.id} className="table-row group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <Link to={`/admin/clients/${client.id}`} className="font-semibold text-slate-900 hover:text-accent transition-colors">{client.name}</Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {client.nif}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Mail size={12} className="text-slate-300" /> {client.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs">
                        <Phone size={12} className="text-slate-300" /> {client.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        if (user?.role !== 'lawyer') {
                          const newStatus = client.status === 'active' ? 'inactive' : 'active';
                          updateClient(client.id, { status: newStatus });
                          showFeedback({
                            title: newStatus === 'active' ? 'Cliente Ativado' : 'Cliente Inativado',
                            message: `O status de ${client.name} foi alterado para ${newStatus === 'active' ? 'ativo' : 'inativo'}.`,
                            type: 'success'
                          });
                        }
                      }}
                      disabled={user?.role === 'lawyer'}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        client.status === 'active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      } ${user?.role === 'lawyer' ? 'cursor-default' : ''}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(client.createdAt).toLocaleDateString('pt-AO')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <Link to={`/admin/clients/${client.id}`} title="Ver Detalhes" className="p-1 hover:text-accent transition-colors"><Eye size={15} /></Link>
                      <button onClick={() => openEdit(client)} title="Editar" className="p-1 hover:text-blue-600 transition-colors"><Edit3 size={15} /></button>
                      <button onClick={() => handleDelete(client.id, client.name)} title="Excluir" className="p-1 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Search size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <p className="text-sm text-slate-500">Registe os dados oficiais do cliente no sistema.</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            
            <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Nome Completo / Razão Social</label>
                <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">NIF / BI</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none text-sm" 
                  value={formData.nif} 
                  onChange={e => setFormData({...formData, nif: e.target.value})} 
                  placeholder="Ex: 540112233LA045"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Telefone</label>
                <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none text-sm" value={formData.phone} onChange={handlePhoneChange} placeholder="9XX XXX XXX" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">E-mail</label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none text-sm invalid:border-red-500 invalid:text-red-600 peer" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="exemplo@email.com"
                />
                <p className="mt-1 invisible peer-invalid:visible text-[10px] text-red-500 font-medium">
                  Por favor, insira um endereço de e-mail válido.
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Morada / Sede</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Data de Registo</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none text-sm" 
                  value={formData.createdAt} 
                  onChange={e => setFormData({...formData, createdAt: e.target.value})} 
                />
              </div>
              
              <div className="col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-500 hover:bg-slate-50 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors text-sm shadow-lg">{editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
