import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Download, Printer, CheckCircle, Clock, Eye, Send, FilePlus, XCircle, Trash2, User, AlertTriangle, FileCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFeedback } from '../../context/FeedbackContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ContractsPage() {
  const { contracts, addContract, updateContract, deleteContract, clients, contractModels } = useData();
  const { showFeedback, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Selection, 2: Preview
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    modelId: '',
    service: '',
    value: '',
    status: 'draft' as any
  });

  const [previewContent, setPreviewContent] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const filteredContracts = contracts.filter(c => 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (auto = false) => {
    setIsAutoGenerating(auto);
    setModalStep(1);
    setFormData({
      clientId: '',
      clientName: '',
      modelId: '',
      service: '',
      value: '',
      status: 'draft'
    });
    setPreviewContent('');
    setValidationErrors([]);
    setShowModal(true);
  };

  const handlePreview = () => {
    const client = clients.find(c => c.id === formData.clientId);
    const model = contractModels.find(m => m.id === formData.modelId);
    
    if (client && model) {
      let content = model.content;
      content = content.replace(/{{CLIENT_NAME}}/g, client.name);
      content = content.replace(/{{CLIENT_NIF}}/g, client.nif);
      content = content.replace(/{{CLIENT_ADDRESS}}/g, client.address);
      content = content.replace(/{{VALUE}}/g, formData.value || '[VALOR NÃO DEFINIDO]');
      content = content.replace(/{{DATE}}/g, new Date().toLocaleDateString('pt-AO'));
      
      // Validation Check
      const errors = [];
      if (!formData.value) errors.push('O valor do contrato não foi definido.');
      if (content.includes('{{')) errors.push('Existem campos variáveis não preenchidos no documento.');
      
      setPreviewContent(content);
      setValidationErrors(errors);
      setModalStep(2);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      let clientName = formData.clientName;
      let clientId = formData.clientId;
      let service = formData.service;

      if (isAutoGenerating) {
        const client = clients.find(c => c.id === formData.clientId);
        const model = contractModels.find(m => m.id === formData.modelId);
        if (client) clientName = client.name;
        if (model) service = model.title;
      }

      addContract({
        clientId,
        clientName,
        service,
        value: formData.value,
        status: isAutoGenerating ? 'active' : formData.status,
        date: new Date().toLocaleDateString()
      });

      showFeedback({
        title: isAutoGenerating ? 'Contrato Gerado' : 'Contrato Registado',
        message: `O contrato para ${clientName} foi salvo com sucesso.`,
        type: 'success'
      });

      setShowModal(false);
    } catch (error) {
      showFeedback({
        title: 'Erro no Contrato',
        message: 'Não foi possível processar os dados do contrato.',
        type: 'error'
      });
    }
  };

  const handleDeleteContract = (id: string, clientName: string) => {
    confirmAction({
      title: 'Eliminar Contrato',
      message: `Confirma a eliminação do contrato de ${clientName}?`,
      onConfirm: () => {
        try {
          deleteContract(id);
          showFeedback({
            title: 'Contrato Removido',
            message: 'O registo do contrato foi excluído do sistema.',
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Eliminar',
            message: 'Não foi possível remover o contrato.',
            type: 'error'
          });
        }
      }
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Contrato - ${formData.clientName || 'Documento'}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
              .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 40px; }
              .header-logo { width: 80px; height: 80px; object-fit: contain; }
              .header-info { text-align: right; }
              .firm-name { font-size: 18pt; font-weight: bold; color: #1e293b; margin: 0; }
              .firm-detail { font-size: 9pt; color: #64748b; margin: 2px 0; }
              h1 { text-align: center; font-size: 16pt; margin-bottom: 40px; text-transform: uppercase; margin-top: 20px; }
              .content { white-space: pre-wrap; font-size: 11pt; text-align: justify; }
              .footer { margin-top: 100px; display: flex; justify-content: space-between; gap: 50px; }
              .signature { border-top: 1px solid #333; width: 100%; text-align: center; padding-top: 10px; font-size: 10pt; font-weight: bold; }
              @media print {
                body { padding: 0; }
                @page { margin: 2cm; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/src/assets/images/law_firm_logo_1779114856317.png" class="header-logo" alt="Logo" onerror="this.style.display='none'"/>
              <div class="header-info">
                <p class="firm-name">Escritório António Bunga/Tuko</p>
                <p class="firm-detail">Sociedade de Advogados, RL</p>
                <p class="firm-detail">Luanda, Angola | Tel: +244 923 000 000</p>
                <p class="firm-detail">geral@bungatuko.ao</p>
              </div>
            </div>
            <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS</h1>
            <div class="content">${previewContent}</div>
            <div class="footer">
              <div class="signature">PELO CONTRATANTE<br/><span style="font-weight: normal; font-size: 8pt; color: #999;">(Assinatura)</span></div>
              <div class="signature">PELO CONTRATADO<br/><span style="font-weight: normal; font-size: 8pt; color: #999;">(Assinatura)</span></div>
            </div>
            <script>
              window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    
    // Create a temporary element for PDF rendering to ensure it looks like a document
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '60px';
    tempDiv.style.fontFamily = "'Times New Roman', serif";
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.color = '#333';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    
    tempDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 40px;">
        <img src="/src/assets/images/law_firm_logo_1779114856317.png" style="width: 80px; height: 80px; object-fit: contain;" alt="Logo" />
        <div style="text-align: right;">
          <p style="font-size: 18pt; font-weight: bold; color: #1e293b; margin: 0;">Escritório António Bunga/Tuko</p>
          <p style="font-size: 9pt; color: #64748b; margin: 2px 0;">Sociedade de Advogados, RL</p>
          <p style="font-size: 9pt; color: #64748b; margin: 2px 0;">Luanda, Angola | Tel: +244 923 000 000</p>
          <p style="font-size: 9pt; color: #64748b; margin: 2px 0;">geral@bungatuko.ao</p>
        </div>
      </div>
      <h1 style="text-align: center; font-size: 20pt; margin-bottom: 40px; text-transform: uppercase;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
      <div style="white-space: pre-wrap; font-size: 11pt; text-align: justify;">${previewContent}</div>
      <div style="margin-top: 100px; display: flex; justify-content: space-between; gap: 50px;">
        <div style="border-top: 1px solid #333; flex: 1; text-align: center; padding-top: 10px; font-weight: bold;">O CONTRATANTE</div>
        <div style="border-top: 1px solid #333; flex: 1; text-align: center; padding-top: 10px; font-weight: bold;">O CONTRATADO</div>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Contrato_${formData.clientName || 'Gerado'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Tente usar a opção de imprimir e Salvar como PDF.');
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Contratos</h2>
          <p className="text-slate-500 text-sm mt-1">Geração automática e controle de contratos jurídicos.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal(true)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all">
            <FilePlus size={16} className="text-accent" />
            Geração Automática
          </button>
          <button onClick={() => handleOpenModal(false)} className="btn-primary">
            <Plus size={16} />
            Novo Registro Manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 border-l-4 border-blue-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Rascunhos</p>
          <h3 className="text-2xl font-bold text-slate-800">{contracts.filter(c => c.status === 'draft').length}</h3>
        </div>
        <div className="card p-5 border-l-4 border-amber-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Pendentes</p>
          <h3 className="text-2xl font-bold text-slate-800">{contracts.filter(c => c.status === 'pending').length}</h3>
        </div>
        <div className="card p-5 border-l-4 border-emerald-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Ativos</p>
          <h3 className="text-2xl font-bold text-slate-800">{contracts.filter(c => c.status === 'active').length}</h3>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-bold text-slate-700 text-sm uppercase tracking-tight">Lista de Contratos</h4>
          <div className="relative">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input 
              type="text" 
              placeholder="Buscar contrato..." 
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
                <th className="px-6">Nº Contrato</th>
                <th className="px-6">Cliente</th>
                <th className="px-6">Serviço</th>
                <th className="px-6">Valor</th>
                <th className="px-6">Estado</th>
                <th className="px-6 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="table-row group">
                  <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400">
                    {contract.id}
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={`/admin/clients/${contract.clientId}`} 
                      className="font-semibold text-slate-900 hover:text-accent transition-colors"
                    >
                      {contract.clientName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {contract.service}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {contract.value}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max ${
                      contract.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                      contract.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                      contract.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'
                    }`}>
                      {contract.status === 'active' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {contract.status === 'active' ? 'Em Vigor' : 
                       contract.status === 'pending' ? 'Pendente' : 
                       contract.status === 'draft' ? 'Rascunho' : contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button 
                        onClick={() => {
                          const model = contractModels.find(m => m.title === contract.service);
                          if (model) {
                            setFormData({
                              clientId: contract.clientId || '',
                              clientName: contract.clientName,
                              service: contract.service,
                              value: contract.value,
                              modelId: model.id
                            });
                            // Re-generate preview if it's a draft or pending
                            let content = model.content;
                            content = content.replace(/{{CLIENT_NAME}}/g, contract.clientName);
                            content = content.replace(/{{VALUE}}/g, contract.value);
                            content = content.replace(/{{DATE}}/g, contract.date || new Date().toLocaleDateString('pt-AO'));
                            setPreviewContent(content);
                            setModalStep(2);
                            setShowModal(true);
                          }
                        }} 
                        title="Ver Documento" 
                        className="p-1.5 hover:text-accent hover:bg-slate-50 rounded transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {contract.status === 'pending' && (
                        <button 
                          onClick={() => {
                            updateContract(contract.id, { status: 'active' });
                            showFeedback({ title: 'Contrato Ativado', message: `O contrato de ${contract.clientName} está agora em vigor.`, type: 'success' });
                          }}
                          title="Aprovar Contrato" 
                          className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeleteContract(contract.id, contract.clientName)} 
                        title="Excluir"
                        className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
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
          <div className={`bg-white rounded-3xl w-full shadow-2xl transition-all duration-300 ${modalStep === 2 ? 'max-w-5xl max-h-[90vh]' : 'max-w-md max-h-[90vh]'} p-8 flex flex-col overflow-hidden`}>
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {isAutoGenerating 
                    ? (modalStep === 1 ? 'Gerador Automático' : 'Visualização do Contrato') 
                    : 'Registo de Contrato'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isAutoGenerating 
                    ? (modalStep === 1 ? 'Preencha os dados para gerar o documento.' : 'Verifique os detalhes antes de finalizar.') 
                    : 'Introduza os dados do contrato físico.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            
            {modalStep === 1 ? (
              <form className="space-y-4 overflow-y-auto pr-1" onSubmit={(e) => { e.preventDefault(); isAutoGenerating ? handlePreview() : handleSubmit(); }}>
                {isAutoGenerating ? (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={12} /> Modelo base
                      </label>
                      <select 
                        required 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm appearance-none bg-slate-50"
                        value={formData.modelId}
                        onChange={e => setFormData({...formData, modelId: e.target.value})}
                      >
                        <option value="">Seleccione um modelo...</option>
                        {contractModels.map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 flex items-center gap-2">
                        <User size={12} /> Cliente
                      </label>
                      <select 
                        required 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm appearance-none bg-slate-50"
                        value={formData.clientId}
                        onChange={e => setFormData({...formData, clientId: e.target.value})}
                      >
                        <option value="">Seleccione o cliente...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Nome do Cliente</label>
                      <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Serviço</label>
                      <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Valor</label>
                    <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold" placeholder="Ex: 500.000 Kz" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Status Inicial</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="draft">Rascunho</option>
                      <option value="pending">Pendente</option>
                      <option value="active">Ativo</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-100 font-semibold text-slate-500 text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-lg hover:bg-slate-800 transition-colors">
                    {isAutoGenerating ? 'Visualizar Rascunho' : 'Salvar Registo'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-hidden animate-in slide-in-from-right duration-300">
                {validationErrors.length > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start shrink-0">
                    <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">O documento requer atenção</p>
                      <ul className="text-[10px] text-amber-700 list-disc list-inside mt-1">
                        {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-center shrink-0">
                    <FileCheck className="text-emerald-500 shrink-0" size={20} />
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Contrato Validado - Pronto para Finalizar</p>
                  </div>
                )}

                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono ml-1 shrink-0">Revisão e Edição Final do Documento</label>
                  
                  <div className="flex-1 min-h-[180px] bg-white border border-slate-200 rounded-2xl shadow-inner overflow-hidden flex flex-col">
                    {/* Visual Header in Preview */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0 scale-[0.95] origin-top">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/src/assets/images/law_firm_logo_1779114856317.png" alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800">Escritório António Bunga/Tuko</p>
                        <p className="text-[9px] text-slate-500">Sociedade de Advogados</p>
                      </div>
                    </div>
                    
                    <textarea 
                      className="flex-1 w-full p-6 overflow-y-auto font-serif text-slate-700 leading-relaxed text-sm outline-none transition-all resize-none border-none bg-transparent"
                      value={previewContent}
                      onChange={(e) => setPreviewContent(e.target.value)}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 italic shrink-0">O texto acima pode ser editado manualmente para ajustes finos antes da impressão ou exportação.</p>
                </div>
                
                <div className="pt-2 flex gap-4 shrink-0 border-t border-slate-100 mt-2">
                  <button 
                    onClick={() => setModalStep(1)} 
                    className="px-6 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-500 text-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Voltar a Editar
                  </button>
                  <div className="flex-1 flex gap-3">
                    <button 
                      onClick={handlePrint}
                      className="flex-1 py-2.5 rounded-xl border border-slate-900 font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Printer size={16} /> Imprimir
                    </button>
                    <button 
                      onClick={handleExportPDF}
                      className="flex-1 py-2.5 rounded-xl border border-accent font-semibold text-accent text-sm hover:bg-accent/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> Exportar PDF
                    </button>
                    <button 
                      onClick={() => handleSubmit()}
                      className="flex-1 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <CheckCircle size={16} /> Finalizar e Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
