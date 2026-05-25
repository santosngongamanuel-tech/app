import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Scale,
  Save,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { clients, contracts, cases, updateClient, deleteContract, deleteCase } = useData();
  const { user } = useAuth();
  const { showFeedback, confirmAction } = useFeedback();

  const client = clients.find(c => c.id === id);
  const clientContracts = contracts.filter(c => c.clientId === id);
  const clientCases = cases.filter(c => c.clientId === id);

  const [isEditingObs, setIsEditingObs] = useState(false);
  const [obsText, setObsText] = useState(client?.legalObservations || '');

  const handleSaveObs = () => {
    if (client) {
      updateClient(client.id, { legalObservations: obsText });
      setIsEditingObs(false);
    }
  };

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <h2 className="text-xl font-bold text-slate-800">Cliente não encontrado</h2>
        <Link to="/admin/clients" className="mt-4 text-accent hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/clients" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Detalhes do Cliente</h2>
            <p className="text-slate-500 text-sm">Informações completas e histórico do cliente.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <User size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">{client.name}</h3>
              <p className="text-xs font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">{client.nif}</p>
              <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                client.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {client.status === 'active' ? 'Ativo' : 'Inativo'}
              </div>
            </div>

            <div className="pt-6 space-y-5">
              <div className="flex items-start gap-4 group">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">E-mail de Contacto</p>
                  <p className="text-sm text-slate-700 truncate font-medium">{client.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Telefone Principal</p>
                  <p className="text-sm text-slate-700 font-medium">{client.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Endereço Residencial/Sede</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{client.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group pt-2 border-t border-slate-50">
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-300 tracking-widest mb-0.5">Data de Registo</p>
                  <p className="text-sm text-slate-500 font-medium">{new Date(client.createdAt).toLocaleDateString('pt-AO')}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legal Observations Section */}
          {(user?.role === 'admin' || user?.role === 'lawyer' || user?.role === 'assistant') && (
            <div className="card p-6 border-l-4 border-accent">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={12} className="text-accent" />
                  Observações Jurídicas
                </h4>
                {!isEditingObs ? (
                  <button 
                    onClick={() => setIsEditingObs(true)}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                  >
                    Editar
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveObs}
                    className="p-1 px-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800 transition-colors"
                  >
                    <Save size={12} /> Salvar
                  </button>
                )}
              </div>
              
              {isEditingObs ? (
                <textarea 
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-accent min-h-[150px] font-sans leading-relaxed"
                  value={obsText}
                  onChange={(e) => setObsText(e.target.value)}
                  placeholder="Insira detalhes jurídicos, antecedentes ou notas importantes sobre o cliente..."
                />
              ) : (
                <div className="bg-slate-50/50 p-4 rounded-xl border border-dotted border-slate-200">
                  <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                    {client.legalObservations || 'Nenhuma observação jurídica registada até ao momento.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contracts Section */}
          <div className="card overflow-hidden border-none shadow-xl shadow-slate-200/50">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-tighter flex items-center gap-2">
                <FileText size={16} className="text-accent" />
                Contratos Associados
              </h4>
              <Link 
                to="/admin/contracts" 
                className="btn-primary py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 shadow-sm"
              >
                <Plus size={14} /> Novo Contrato
              </Link>
            </div>
            
            <div className="overflow-auto max-h-[300px]">
              {clientContracts.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/30 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">ID Contratual</th>
                      <th className="px-6 py-3">Serviço Jurídico</th>
                      <th className="px-6 py-3">Valor</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-600 font-sans">
                    {clientContracts.map((contract) => (
                      <tr key={contract.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-[11px] font-bold text-primary">
                          {contract.id}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {contract.service}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {contract.value}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight ${
                            contract.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                            contract.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                            contract.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {contract.status === 'active' ? 'Vigente' :
                             contract.status === 'pending' ? 'Suspenso' :
                             contract.status === 'completed' ? 'Concluído' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-400 whitespace-nowrap">
                          {contract.date}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              confirmAction({
                                title: 'Excluir Contrato',
                                message: `Confirma a exclusão do contrato com ID ${contract.id}?`,
                                onConfirm: () => {
                                  try {
                                    deleteContract(contract.id);
                                    showFeedback({
                                      title: 'Contrato Removido',
                                      message: 'O contrato foi removido do sistema com sucesso.',
                                      type: 'success'
                                    });
                                  } catch (error) {
                                    showFeedback({
                                      title: 'Erro ao Remover',
                                      message: 'Não foi possível remover o contrato.',
                                      type: 'error'
                                    });
                                  }
                                }
                              });
                            }}
                            title="Excluir"
                            className="p-1 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-white">
                  <FileText size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-medium">Nenhum vínculo contratual encontrado.</p>
                </div>
              )}
            </div>
          </div>

          {/* Cases Section */}
          <div className="card overflow-hidden border-none shadow-xl shadow-slate-200/50">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-tighter flex items-center gap-2">
                <Scale size={16} className="text-primary" />
                Processos Judiciais
              </h4>
              <Link 
                to="/admin/cases" 
                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Novo Processo
              </Link>
            </div>
            
            <div className="overflow-auto max-h-[300px]">
              {clientCases.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/30 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Número</th>
                      <th className="px-6 py-3">Título da Acção</th>
                      <th className="px-6 py-3">Advogado</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-600 font-sans">
                    {clientCases.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400">
                          {c.caseNumber}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {c.title}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {c.lawyer}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            c.status === 'active' ? 'text-emerald-500' : 'text-slate-400'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              confirmAction({
                                title: 'Excluir Processo',
                                message: `Confirma a exclusão do processo ${c.caseNumber}?`,
                                onConfirm: () => {
                                  try {
                                    deleteCase(c.id);
                                    showFeedback({
                                      title: 'Processo Removido',
                                      message: 'O processo foi excluído do sistema.',
                                      type: 'success'
                                    });
                                  } catch (error) {
                                    showFeedback({
                                      title: 'Erro ao Remover',
                                      message: 'Não foi possível remover o processo.',
                                      type: 'error'
                                    });
                                  }
                                }
                              });
                            }}
                            title="Excluir"
                            className="p-1 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-white">
                  <Scale size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-medium">Nenhum processo em andamento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
