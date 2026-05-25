import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Save, Camera, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useFeedback } from '../../context/FeedbackContext';

export default function ProfilePage() {
  const { user, updateCurrentUser } = useAuth();
  const { updateUser } = useData();
  const { showFeedback } = useFeedback();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    password: user?.password || '',
    avatar: user?.avatar || '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64 storage in localStorage
        showFeedback({
          title: 'Arquivo muito grande',
          message: 'Por favor, selecione uma imagem com menos de 1MB.',
          type: 'warning'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: base64 }));
        
        // Immediately save avatar for better UX
        if (user?.id) {
          updateUser(user.id, { avatar: base64 });
          updateCurrentUser({ avatar: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showFeedback({
        title: 'Senhas Diferentes',
        message: 'A nova senha e a confirmação não coincidem.',
        type: 'warning'
      });
      return;
    }

    try {
      const updatedData: any = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar
      };

      if (formData.newPassword) {
        updatedData.password = formData.newPassword;
      }

      // Update in DataContext (Global storage)
      if (user?.id) {
        updateUser(user.id, updatedData);
        
        // Update in AuthContext (Current session)
        updateCurrentUser({
          displayName: formData.name,
          email: formData.email,
          password: updatedData.password || user.password,
          avatar: formData.avatar
        });

        showFeedback({
          title: 'Perfil Atualizado',
          message: 'Os seus dados pessoais foram guardados com sucesso.',
          type: 'success'
        });
        
        setFormData(prev => ({ ...prev, password: updatedData.password || prev.password, newPassword: '', confirmPassword: '' }));
      }
    } catch (error) {
      showFeedback({
        title: 'Erro ao Atualizar',
        message: 'Não foi possível salvar as alterações.',
        type: 'error'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cuidado do Meu Perfil</h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie suas informações pessoais e credenciais de acesso.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-8 border-none flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                onClick={handleAvatarClick}
                className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors shadow-inner overflow-hidden border-4 border-white shadow-xl cursor-pointer"
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
              <button 
                onClick={handleAvatarClick}
                className="absolute bottom-1 right-1 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-primary hover:text-accent transition-colors"
                title="Alterar Foto"
              >
                <Camera size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{user?.displayName}</h3>
            <span className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              {user?.role === 'admin' ? 'Administrador' : user?.role === 'lawyer' ? 'Advogado' : 'Assistente'}
            </span>
            
            <div className="w-full h-px bg-slate-100 my-6"></div>
            
            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-slate-500">
                <Mail size={16} className="text-slate-400" />
                <span className="text-xs truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Shield size={16} className="text-slate-400" />
                <span className="text-xs capitalize">{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-slate-900 border-none text-white text-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Status da Conta</h4>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-bold">Acesso Verificado</span>
            </div>
            <p className="text-[10px] text-white/40 italic">A sua conta possui todos os privilégios do nível {user?.role}.</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form className="space-y-6" onSubmit={handleUpdateProfile}>
            <div className="card p-8 border-none space-y-6">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <User size={18} className="text-accent" />
                Dados Pessoais
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Nome Completo</label>
                  <input 
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">E-mail Profissional</label>
                  <input 
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="card p-8 border-none space-y-6">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Lock size={18} className="text-accent" />
                Segurança de Acesso
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Nova Senha</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-colors" size={16} />
                    <input 
                      type="password"
                      placeholder="Deixe vazio para manter a actual"
                      className="w-full px-11 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium"
                      value={formData.newPassword}
                      onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Confirmar Nova Senha</label>
                  <div className="relative group">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-colors" size={16} />
                    <input 
                      type="password"
                      placeholder="Confirmar nova senha"
                      className="w-full px-11 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-slate-800 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Save size={18} />
              Guardar Perfil de Acesso
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
