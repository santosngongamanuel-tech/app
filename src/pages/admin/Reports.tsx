import React, { useState } from 'react';
import { 
  BarChart3, 
  FilePieChart, 
  Users, 
  Briefcase, 
  Download, 
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GeneratedReport {
  id: string;
  title: string;
  date: string;
  type: string;
}

export default function ReportsPage() {
  const { transactions, clients, cases, agenda, contracts } = useData();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const reports = [
    { id: 'fin', title: 'Performance Financeira', description: 'Relatório detalhado de honorários e despesas no período selecionado.', icon: BarChart3, type: 'Financeiro' },
    { id: 'jur', title: 'Eficiência de Processos', description: 'Listagem de processos ativos, arquivados e pendentes.', icon: Briefcase, type: 'Jurídico' },
    { id: 'cli', title: 'Relatório de Clientes', description: 'Visão geral da base de clientes e distribuição por serviços.', icon: Users, type: 'Clientes' },
    { id: 'age', title: 'Mapa de Compromissos', description: 'Resumo de audiências e reuniões agendadas para o período.', icon: Calendar, type: 'Agenda' },
  ];

  const generateReport = async (reportId: string) => {
    setIsGenerating(reportId);
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 800));

    const doc = new jsPDF();
    const now = new Date().toLocaleString();
    const reportInfo = reports.find(r => r.id === reportId);
    
    if (!reportInfo) return;

    // Report Header
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Escritório António Bunga/Tuko, Soyo/Angola', 14, 20);
    
    doc.setFontSize(14);
    doc.text(reportInfo.title.toUpperCase(), 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${now}`, 14, 38);
    if (dateRange.start && dateRange.end) {
      doc.text(`Período: ${dateRange.start} até ${dateRange.end}`, 14, 43);
    }

    let tableData: any[][] = [];
    let tableHeaders: string[] = [];

    switch(reportId) {
      case 'fin':
        tableHeaders = ['Data', 'Descrição', 'Cliente', 'Categoria', 'Tipo', 'Valor'];
        tableData = transactions
          .filter(t => (!dateRange.start || t.date >= dateRange.start) && (!dateRange.end || t.date <= dateRange.end))
          .map(t => [
            new Date(t.date).toLocaleDateString('pt-AO'),
            t.description,
            t.clientId ? clients.find(c => c.id === t.clientId)?.name || 'N/A' : 'N/A',
            t.category,
            t.type === 'revenue' ? 'Entrada' : 'Saída',
            `${t.amount.toLocaleString()} Kz`
          ]);
        break;
      
      case 'jur':
        tableHeaders = ['Número', 'Título', 'Cliente', 'Status', 'Advogado'];
        tableData = cases.map(c => [
          c.caseNumber,
          c.title,
          c.clientName,
          c.status.toUpperCase(),
          c.lawyer
        ]);
        break;

      case 'cli':
        tableHeaders = ['Nome', 'NIF', 'Email', 'Telefone', 'Registo', 'Estado'];
        tableData = clients.map(c => [
          c.name,
          c.nif,
          c.email,
          c.phone,
          new Date(c.createdAt).toLocaleDateString('pt-AO'),
          c.status === 'active' ? 'Ativo' : 'Inativo'
        ]);
        break;

      case 'age':
        tableHeaders = ['Data', 'Hora', 'Tipo', 'Cliente', 'Local'];
        tableData = agenda
          .filter(a => (!dateRange.start || a.date >= dateRange.start) && (!dateRange.end || a.date <= dateRange.end))
          .map(a => [
            new Date(a.date).toLocaleDateString('pt-AO'),
            a.time,
            a.type.toUpperCase(),
            a.client,
            a.location
          ]);
        break;
    }

    autoTable(doc, {
      startY: 50,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    
    // Summary line
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Total de registos encontrados: ${tableData.length}`, 14, finalY + 15);

    // Office footer
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Escritório António Bunga/Tuko, Soyo/Angola', 14, finalY + 25);

    doc.save(`${reportInfo.title}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    setRecentReports(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      title: reportInfo.title,
      type: reportInfo.type,
      date: now
    }, ...prev].slice(0, 5));
    
    setIsGenerating(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios & Auditoria</h2>
          <p className="text-slate-500 text-sm mt-1">Extração de dados inteligentes para tomada de decisão e conformidade.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Filtro Global</span>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <input 
              type="date" 
              className="text-xs bg-slate-50 border-none outline-none p-1.5 rounded-lg text-slate-600" 
              value={dateRange.start}
              onChange={e => setDateRange({...dateRange, start: e.target.value})}
            />
            <span className="text-slate-300">/</span>
            <input 
              type="date" 
              className="text-xs bg-slate-50 border-none outline-none p-1.5 rounded-lg text-slate-600" 
              value={dateRange.end}
              onChange={e => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="card p-6 flex items-start gap-5 hover:border-accent group transition-all relative overflow-hidden">
            <div className={`p-4 rounded-2xl text-slate-400 group-hover:text-accent transition-all border border-slate-50 ${isGenerating === report.id ? 'animate-pulse bg-accent/5' : 'bg-slate-50'}`}>
              <report.icon size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{report.type}</span>
                 <CheckCircle2 size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{report.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{report.description}</p>
              
              <button 
                onClick={() => generateReport(report.id)}
                disabled={isGenerating !== null}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isGenerating === report.id 
                    ? 'bg-slate-100 text-slate-400 italic' 
                    : 'bg-slate-900 text-white hover:bg-accent hover:translate-x-1 shadow-md shadow-slate-900/10'
                }`}
              >
                {isGenerating === report.id ? (
                  <>
                    <Clock size={12} className="animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    Gerar Agora
                    <Download size={12} />
                  </>
                )}
              </button>
            </div>
            
            {/* Background Accent */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <report.icon size={120} />
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden mt-8">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Atividade de Exportação</h4>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Limpar Histórico</button>
        </div>
        
        {recentReports.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {recentReports.map((report) => (
              <div key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Download size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800">{report.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">Tipo: {report.type} • {report.date}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Pronto</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mx-auto mb-4 border border-slate-100">
              <AlertCircle size={32} />
            </div>
            <h5 className="text-slate-400 font-medium">Nenhum relatório foi gerado nesta sessão.</h5>
            <p className="text-[11px] text-slate-300 mt-1">Selecione um relatório acima e clique em "Gerar Agora".</p>
          </div>
        )}
      </div>
    </div>
  );
}

