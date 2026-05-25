import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download, 
  Filter, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  XCircle, 
  Trash2, 
  Calendar,
  Wallet,
  Receipt,
  PieChart as PieChartIcon,
  BarChart3,
  Users
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Transaction } from '../../lib/mockData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function FinancePage() {
  const { transactions, addTransaction, deleteTransaction, clients, cases } = useData();
  const { user } = useAuth();
  const { showFeedback, confirmAction } = useFeedback();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'revenue' | 'expense'>('all');
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'revenue' as 'revenue' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    caseId: ''
  });

  const myTransactions = useMemo(() => {
    if (user?.role === 'admin' || user?.role === 'assistant') return transactions;
    return transactions.filter(t => t.lawyerName === user?.displayName || (t.type === 'revenue' && t.category === 'Honorários' && !t.lawyerName));
  }, [transactions, user]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTransactions = myTransactions.filter(t => t.date === date);
      const revenue = dayTransactions.filter(t => t.type === 'revenue').reduce((acc, t) => acc + t.amount, 0);
      const expense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      return {
        date: new Date(date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }),
        revenue,
        expense
      };
    });
  }, [myTransactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    myTransactions.filter(t => t.type === 'revenue').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [myTransactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const totals = useMemo(() => {
    const revenue = myTransactions
      .filter(t => t.type === 'revenue')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenses = myTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    return {
      revenue,
      expenses,
      balance: revenue - expenses
    };
  }, [myTransactions]);

  const filteredTransactions = myTransactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amountNum = parseFloat(formData.amount);
      const isRevenue = formData.type === 'revenue';
      
      addTransaction({
        description: formData.description,
        amount: amountNum,
        displayAmount: amountNum.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }).replace('AOA', 'Kz'),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        clientId: formData.clientId || undefined,
        caseId: formData.caseId || undefined,
        lawyerName: user?.role === 'lawyer' ? user.displayName : (user?.role === 'assistant' ? undefined : undefined)
      });

      showFeedback({
        title: isRevenue ? 'Receita Registada' : 'Despesa Registada',
        message: `O lançamento de ${amountNum.toLocaleString()} Kz foi efetuado com sucesso.`,
        type: 'success'
      });

      setShowModal(false);
      setFormData({
        description: '',
        amount: '',
        type: 'revenue',
        category: '',
        date: new Date().toISOString().split('T')[0],
        clientId: '',
        caseId: ''
      });
    } catch (error) {
      showFeedback({
        title: 'Erro no Lançamento',
        message: 'Não foi possível registar a transação financeira.',
        type: 'error'
      });
    }
  };

  const handleDeleteTransaction = (id: string, description: string) => {
    confirmAction({
      title: 'Eliminar Transação',
      message: `Confirma a eliminação da transação "${description}"?`,
      onConfirm: () => {
        try {
          deleteTransaction(id);
          showFeedback({
            title: 'Transação Eliminada',
            message: 'O registo financeiro foi removido do sistema.',
            type: 'success'
          });
        } catch (error) {
          showFeedback({
            title: 'Erro ao Eliminar',
            message: 'Ocorreu um problema ao tentar remover a transação.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleExportReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Relatório Financeiro', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Resumo do Período', 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Descrição', 'Valor']],
      body: [
        ['Total de Receitas', `${totals.revenue.toLocaleString()} Kz`],
        ['Total de Despesas', `${totals.expenses.toLocaleString()} Kz`],
        ['Saldo Líquido', `${totals.balance.toLocaleString()} Kz`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }
    });
    
    doc.text('Detalhamento de Transações', 14, (doc as any).lastAutoTable.finalY + 15);
    const tableData = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type === 'revenue' ? 'Receita' : 'Despesa',
      `${t.type === 'revenue' ? '+' : '-'}${t.amount.toLocaleString()} Kz`
    ]);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: tableData,
      headStyles: { fillColor: [30, 41, 59] }
    });

    // Office footer
    const finalY2 = (doc as any).lastAutoTable.finalY || 180;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Escritório António Bunga/Tuko, Soyo/Angola', 14, finalY2 + 15);

    doc.save('Relatorio_Financeiro_BT.pdf');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>
          <p className="text-slate-500 text-sm mt-1">Gestão de honorários, despesas operacionais e saúde financeira.</p>
        </div>
        <div className="flex gap-3">
          {user?.role !== 'lawyer' && (
            <button 
              onClick={handleExportReport}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <Download size={16} />
              Relatório PDF
            </button>
          )}
          {user?.role !== 'lawyer' && (
            <button onClick={() => setShowModal(true)} className="btn-primary shadow-lg shadow-primary/20">
              <Plus size={16} />
              Nova Transação
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 border-b-4 border-emerald-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp size={64} className="text-emerald-900" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Receitas Totais</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-800">{totals.revenue.toLocaleString()}</h3>
            <span className="text-xs font-bold text-slate-400">Kz</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">
            <ArrowUpRight size={10} /> Entradas
          </div>
        </div>

        <div className="card p-6 border-b-4 border-rose-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingDown size={64} className="text-rose-900" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Despesas Totais</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-800">{totals.expenses.toLocaleString()}</h3>
            <span className="text-xs font-bold text-slate-400">Kz</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-rose-600 bg-rose-50 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">
            <ArrowDownLeft size={10} /> Saídas
          </div>
        </div>

        <div className="card p-6 border-b-4 border-primary relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Wallet size={64} className="text-primary-900" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Saldo em Caixa</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-black ${totals.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              {totals.balance.toLocaleString()}
            </h3>
            <span className="text-xs font-bold text-slate-400">Kz</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">
            <DollarSign size={10} /> Balanço
          </div>
        </div>

        <div className="card p-6 border-b-4 border-slate-900 relative overflow-hidden group bg-slate-900">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PieChartIcon size={64} className="text-white" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Margem de Lucro</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-white">
              {totals.revenue > 0 ? ((totals.balance / totals.revenue) * 100).toFixed(1) : 0}%
            </h3>
          </div>
          <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Rentabilidade do Escritório
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BarChart3 size={16} className="text-accent" />
              Fluxo Financeiro (Últimos 7 dias)
            </h4>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8'}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" name="Receitas" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <PieChartIcon size={16} className="text-primary" />
              Distribuição de Honorários
            </h4>
          </div>
          <div className="h-[250px] w-full flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{entry.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-800">{entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
              <Receipt size={18} />
            </div>
            <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm font-mono">Histórico de Transações</h4>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-accent"
            >
              <option value="all">Todas</option>
              <option value="revenue">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Pesquisar descrição ou categoria..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-accent transition-all" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="table-header sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Transação</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Relacionado</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        t.type === 'revenue' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {t.type === 'revenue' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-none">{t.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">ID: #{t.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {(t.clientId || t.caseId) ? (
                      <div className="flex flex-col gap-0.5">
                        {t.clientId && (
                          <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            <Users size={10} className="text-slate-400" /> {clients.find(c => c.id === t.clientId)?.name || "Cliente " + t.clientId}
                          </span>
                        )}
                        {t.caseId && (
                           <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                             <FileText size={10} className="text-slate-400" /> Processo: {cases.find(c => c.id === t.caseId)?.caseNumber || t.caseId}
                           </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Nenhum vínculo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                       <Calendar size={12} className="text-slate-300" />
                       {new Date(t.date).toLocaleDateString('pt-AO')}
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-black ${t.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'revenue' ? '+' : '-'}{t.amount.toLocaleString()} <span className="text-[10px] opacity-70">Kz</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteTransaction(t.id, t.description)}
                      className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Nova Transação</h3>
                <p className="text-[11px] text-slate-500">Registe entradas ou saídas financeiras.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            
            <form className="space-y-4" onSubmit={handleAdd}>
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl gap-1">
                 <button 
                  type="button" 
                  onClick={() => setFormData({...formData, type: 'revenue'})}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.type === 'revenue' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                 >
                   <ArrowUpRight size={12} /> RECEITA
                 </button>
                 <button 
                  type="button" 
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                 >
                   <ArrowDownLeft size={12} /> DESPESA
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Descrição</label>
                  <input 
                    required 
                    placeholder="Ex: Honorários Processo #123"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent outline-none text-sm transition-all shadow-sm" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Categoria</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent outline-none text-sm transition-all shadow-sm"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {formData.type === 'revenue' ? (
                      <>
                        <option value="Honorários">Honorários</option>
                        <option value="Consultoria">Consultoria</option>
                        <option value="Caução">Caução</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Infraestrutura">Infraestrutura</option>
                        <option value="Aluguer">Aluguer</option>
                        <option value="Salários">Salários</option>
                        <option value="Impostos">Impostos</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Valor (Kz)</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent outline-none text-sm font-bold transition-all shadow-sm" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Data</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent outline-none text-sm transition-all shadow-sm" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Cliente (Opcional)</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent outline-none text-sm transition-all shadow-sm"
                    value={formData.clientId}
                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                  >
                    <option value="">Nenhum</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 font-mono">Processo (Opcional)</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent outline-none text-sm transition-all shadow-sm"
                    value={formData.caseId}
                    onChange={e => setFormData({...formData, caseId: e.target.value})}
                  >
                    <option value="">Nenhum</option>
                    {cases.filter(c => !formData.clientId || c.clientId === formData.clientId).map(c => (
                      <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 rounded-xl border border-slate-100 font-bold text-slate-400 text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all font-mono"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-3 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest shadow-lg transition-all font-mono ${
                    formData.type === 'revenue' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Efetuar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
