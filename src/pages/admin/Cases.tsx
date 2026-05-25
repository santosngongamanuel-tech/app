import React, { useState, useMemo } from 'react';
import { Plus, Search, Gavel, FolderOpen, Archive, MoreHorizontal, Clock, User, Scale, XCircle, AlertCircle, Trash2, Paperclip, Upload, FileText, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Case } from '../../lib/mockData';

export default function CasesPage() {
  const { cases, clients, professionals, addCase, updateCase, deleteCase } = useData();
  const { user } = useAuth();
  const { showFeedback, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [selectedCaseForDocuments, setSelectedCaseForDocuments] = useState<Case | null>(null);

  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    clientId: '',
    lawyer: user?.role === 'lawyer' ? user.displayName : '',
    status: 'active' as any,
    priority: 'medium' as any,
    description: '',
    court: '',
    pageCount: 0,
    startDate: new Date().toISOString().split('T')[0],
    trialDate: '',
    decisionDate: ''
  });

  const myCases = useMemo(() => {
    if (user?.role === 'admin') return cases;
    return cases.filter(c => c.lawyer === user?.displayName || c.lawyer.includes(user?.displayName || ''));
  }, [cases, user]);

  const filteredCases = myCases.filter(c => 
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const client = clients.find(cl => cl.id === formData.clientId);
      const caseData = {
        ...formData,
        clientName: client?.name || 'Cliente Desconhecido',
        lastUpdate: 'Agora mesmo'
      };

      if (editingCase) {
        updateCase(editingCase, caseData);
        showFeedback({
          title: 'Processo Atualizado',
          message: 'As alterações no processo foram guardadas com sucesso.',
          type: 'success'
        });
      } else {
        addCase(caseData);
        showFeedback({
          title: 'Processo Aberto',
          message: `O processo ${formData.caseNumber} foi registado com sucesso.`,
          type: 'success'
        });
      }
      closeModal();
    } catch (error) {
      showFeedback({
        title: 'Erro no Registo',
        message: 'Ocorreu um erro ao processar os dados do processo.',
        type: 'error'
      });
    }
  };

  const handleDelete = (id: string, number: string) => {
    confirmAction({
      title: 'Excluir Processo',
      message: `Deseja realmente excluir o processo ${number}?`,
      onConfirm: () => {
        try {
          deleteCase(id);
          showFeedback({
            title: 'Processo Removido',
            message: `O processo ${number} foi excluído permanentemente.`,
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Excluir',
            message: 'Não foi possível remover o processo do sistema.',
            type: 'error'
          });
        }
      }
    });
  };

  const openEdit = (c: any) => {
    setEditingCase(c.id);
    setFormData({
      caseNumber: c.caseNumber,
      title: c.title,
      clientId: c.clientId,
      lawyer: c.lawyer,
      status: c.status,
      priority: c.priority,
      description: c.description || '',
      court: c.court || '',
      pageCount: c.pageCount || 0,
      startDate: c.startDate || '',
      trialDate: c.trialDate || '',
      decisionDate: c.decisionDate || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCase(null);
    setFormData({
      caseNumber: '',
      title: '',
      clientId: '',
      lawyer: '',
      status: 'active',
      priority: 'medium',
      description: '',
      court: '',
      pageCount: 0,
      startDate: new Date().toISOString().split('T')[0],
      trialDate: '',
      decisionDate: ''
    });
  };

  const handleSimulatedFileUpload = (fileList: FileList) => {
    if (!selectedCaseForDocuments) return;

    const newDocuments = Array.from(fileList).map(file => {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: user?.displayName || 'Sistema',
        fileSize: sizeStr,
        fileType: file.type || 'application/octet-stream'
      };
    });

    const updatedDocs = [...(selectedCaseForDocuments.documents || []), ...newDocuments];
    updateCase(selectedCaseForDocuments.id, { documents: updatedDocs });

    setSelectedCaseForDocuments({
      ...selectedCaseForDocuments,
      documents: updatedDocs
    });

    showFeedback({
      title: 'Upload Concluído',
      message: `${newDocuments.length} arquivo(s) anexado(s) com sucesso ao processo.`,
      type: 'success'
    });
  };

  const handleSimulatedDownload = (fileName: string) => {
    showFeedback({
      title: 'A Transferir Ficheiro',
      message: `A descarregar "${fileName}" para o seu computador...`,
      type: 'success'
    });
    
    const element = document.createElement("a");
    const file = new Blob(["Processo Jurídico ANGADV - Conteúdo Simulado de " + fileName], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRemoveDocument = (docId: string, docName: string) => {
    if (!selectedCaseForDocuments) return;
    confirmAction({
      title: 'Desanexar Documento',
      message: `Tem certeza que deseja desanexar o documento "${docName}"?`,
      confirmText: 'Desanexar',
      onConfirm: () => {
        const updatedDocs = (selectedCaseForDocuments.documents || []).filter(d => d.id !== docId);
        updateCase(selectedCaseForDocuments.id, { documents: updatedDocs });

        setSelectedCaseForDocuments({
          ...selectedCaseForDocuments,
          documents: updatedDocs
        });

        showFeedback({
          title: 'Documento Desanexado',
          message: `O documento "${docName}" foi removido do processo.`,
          type: 'success'
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Processos Judiciais</h2>
          <p className="text-slate-500 text-sm mt-1">Acompanhamento e gestão de andamentos processuais.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Gavel size={16} />
          Abrir Processo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-5 border-l-4 border-blue-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Processos Ativos</p>
          <h3 className="text-2xl font-bold text-slate-800">{cases.filter(c => c.status === 'active').length}</h3>
        </div>
        <div className="card p-5 border-l-4 border-amber-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Pendentes</p>
          <h3 className="text-2xl font-bold text-slate-800">{cases.filter(c => c.status === 'pending').length}</h3>
        </div>
        <div className="card p-5 border-l-4 border-emerald-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Alta Prioridade</p>
          <h3 className="text-2xl font-bold text-slate-800">{cases.filter(c => c.priority === 'high').length}</h3>
        </div>
        <div className="card p-5 border-l-4 border-slate-300">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Arquivados</p>
          <h3 className="text-2xl font-bold text-slate-800">{cases.filter(c => c.status === 'archived').length}</h3>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
             <h4 className="font-bold text-slate-700 text-sm uppercase tracking-tight">Listagem de Processos</h4>
          </div>
          <div className="relative">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input 
              type="text" 
              placeholder="Nº Processo ou Cliente..." 
              className="pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-xs w-64 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="table-header">
              <tr>
                <th className="px-6">Processo</th>
                <th className="px-6">Cliente & Advogado</th>
                <th className="px-6">Status</th>
                <th className="px-6">Prioridade</th>
                <th className="px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {filteredCases.map((item) => (
                <tr key={item.id} className="table-row group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] font-bold text-primary">{item.caseNumber}</span>
                      <span className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <User size={12} className="text-slate-300" /> {item.clientName}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Scale size={12} className="text-slate-300" /> {item.lawyer}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <button 
                      onClick={() => {
                        const newStatus = item.status === 'active' ? 'archived' : 'active';
                        updateCase(item.id, { status: newStatus });
                        showFeedback({
                          title: newStatus === 'active' ? 'Processo Reativado' : 'Processo Arquivado',
                          message: `O processo ${item.caseNumber} foi ${newStatus === 'active' ? 'reativado' : 'arquivado'}.`,
                          type: 'success'
                        });
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                       item.status === 'active' ? 'bg-blue-50 text-blue-600' : 
                       item.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                     }`}>
                       {item.status}
                     </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase ${
                      item.priority === 'high' ? 'text-red-500' : 
                      item.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button onClick={() => setSelectedCaseForDocuments(item)} title="Documentos Anexos" className="p-1 hover:text-accent transition-colors border border-transparent rounded"><Paperclip size={16} /></button>
                      <button onClick={() => openEdit(item)} title="Editar Informações" className="p-1 hover:text-blue-600 transition-colors border border-transparent rounded"><FolderOpen size={16} /></button>
                      <button 
                        onClick={() => {
                          updateCase(item.id, { status: 'archived' });
                          showFeedback({ title: 'Processo Arquivado', message: `O processo ${item.caseNumber} foi movido para o arquivo.` });
                        }} 
                        title="Arquivar" 
                        className="p-1 hover:text-slate-600 transition-colors"
                      >
                        <Archive size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.caseNumber)} title="Excluir" className="p-1 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      <button className="p-1 hover:text-primary transition-colors"><MoreHorizontal size={16} /></button>
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
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] p-8 shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                   <Gavel size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800">{editingCase ? 'Editar Processo' : 'Novo Processo Judicial'}</h3>
                    <p className="text-sm text-slate-500">Registo oficial de andamento jurídico Bunga/Tuko.</p>
                 </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            
            <form className="flex-1 flex flex-col min-h-0 overflow-hidden" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 pb-4 flex-1 min-h-0">
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Número do Processo (OAA)</label>
                  <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="Ex: 0054/24.1" value={formData.caseNumber} onChange={e => setFormData({...formData, caseNumber: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Tribunal / Comarca</label>
                  <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ex: Tribunal Provincial de Luanda" value={formData.court} onChange={e => setFormData({...formData, court: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Título do Processo / Acção</label>
                  <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" placeholder="Ex: Recurso de Apelação Cível" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Cliente</label>
                  <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                    <option value="">Selecionar Cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Advogado Responsável</label>
                  <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={formData.lawyer} onChange={e => setFormData({...formData, lawyer: e.target.value})}>
                    <option value="">Selecionar Advogado...</option>
                    {professionals.filter(p => p.role === 'Advogado').map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Prioridade</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta / Urgente</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Nº de Páginas</label>
                  <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" value={formData.pageCount} onChange={e => setFormData({...formData, pageCount: parseInt(e.target.value) || 0})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Data de Início</label>
                  <input type="date" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Data de Julgamento</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.trialDate} onChange={e => setFormData({...formData, trialDate: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Data de Decisão</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.decisionDate} onChange={e => setFormData({...formData, decisionDate: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Estado do Processo</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="judgment">Em Julgamento</option>
                    <option value="suspended">Suspenso</option>
                    <option value="completed">Concluído</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Observações Jurídicas</label>
                  <textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Resumo do caso, prazos e documentos em falta..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex gap-3 shrink-0">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-500 hover:bg-slate-50 text-sm whitespace-nowrap">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors text-sm shadow-xl whitespace-nowrap">{editingCase ? 'Salvar Tudo' : 'Abrir Processo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
