import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, Scale, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { users } = useData();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (foundUser) {
      if (foundUser.status === 'blocked') {
        setError('O seu acesso foi bloqueado pelo administrador.');
        return;
      }
      
      login({
        id: foundUser.id,
        email: foundUser.email,
        displayName: foundUser.name,
        role: foundUser.role as any,
        password: foundUser.password,
        avatar: foundUser.avatar
      });
      navigate('/admin');
    } else {
      setError('Credenciais inválidas. Verifique o seu e-mail e senha.');
    }
  };

  return (
    <div className="h-screen w-full relative flex items-center justify-center bg-slate-950 font-sans select-none overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="/src/assets/images/login_law_bg_1779361416236.png" 
          alt="Escritório de Advocacia"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 scale-105 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950/90" />
      </div>

      {/* Centered Compact Card Box */}
      <div className="w-full max-w-[380px] bg-white rounded-3xl shadow-2xl relative z-10 border border-slate-100 p-6 mx-4 flex flex-col justify-between overflow-hidden">
        {/* Logo/Brand Title */}
        <div className="flex flex-col items-center text-center mt-1">
          <div className="p-2 bg-slate-900 text-amber-400 rounded-xl shadow-md mb-2.5">
            <Scale size={18} />
          </div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">
            António Bunga
          </h2>
        </div>

        {/* Content Form */}
        <div className="my-5 flex-1 overflow-hidden">
          <div className="text-center mb-4">
            <h1 className="text-base font-bold text-slate-800">
              Portal de Acesso
            </h1>
            <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
              Introduza as credenciais para aceder ao sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-[10.5px] font-semibold animate-in fade-in duration-200 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping shrink-0"></span>
                <span className="flex-1">{error}</span>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                E-mail Institucional
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" size={14} />
                <input 
                  type="email" 
                  required
                  placeholder="exemplo@bungatuko.ao"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white outline-none transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" size={14} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white outline-none transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 px-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-slate-800 focus:ring-slate-800" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors select-none">Lembrar</span>
              </label>
              <button type="button" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-800 transition-colors">Esqueci</button>
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-1 mt-1 cursor-pointer"
            >
              Entrar
              <ChevronRight size={14} />
            </button>
          </form>
        </div>

        {/* Brand Footer */}
        <div className="flex justify-between items-center text-[8.5px] text-slate-300 border-t border-slate-50 pt-3 shrink-0 uppercase font-black tracking-widest text-[#94a3b8]">
          <div className="flex items-center gap-1 text-slate-400">
            <ShieldCheck size={10} className="text-amber-500" />
            <span>Soyo, AO</span>
          </div>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
}
