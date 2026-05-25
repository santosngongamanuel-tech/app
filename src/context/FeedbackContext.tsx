import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackOptions {
  title: string;
  message: string;
  type?: FeedbackType;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface FeedbackContextType {
  showFeedback: (options: FeedbackOptions) => void;
  hideFeedback: () => void;
  confirmAction: (options: ConfirmOptions) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<FeedbackOptions>({ title: '', message: '', type: 'success' });
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null);

  const showFeedback = (opt: FeedbackOptions) => {
    setOptions({ ...opt, type: opt.type || 'success' });
    setIsOpen(true);
  };

  const hideFeedback = () => setIsOpen(false);

  const confirmAction = (opts: ConfirmOptions) => {
    setConfirmOpts(opts);
  };

  const getIcon = () => {
    switch (options.type) {
      case 'success': return <CheckCircle2 size={48} className="text-emerald-500" />;
      case 'error': return <XCircle size={48} className="text-rose-500" />;
      case 'warning': return <AlertCircle size={48} className="text-amber-500" />;
      case 'info': return <Info size={48} className="text-blue-500" />;
      default: return <CheckCircle2 size={48} className="text-emerald-500" />;
    }
  };

  const getButtonColor = () => {
    switch (options.type) {
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
      case 'error': return 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-200';
      case 'info': return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
      default: return 'bg-slate-900 hover:bg-slate-800 shadow-slate-200';
    }
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback, confirmAction }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={hideFeedback}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              <div className="mb-6 p-4 rounded-full bg-slate-50">
                {getIcon()}
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {options.title}
              </h3>
              
              <p className="text-slate-500 mb-8 font-medium leading-relaxed">
                {options.message}
              </p>
              
              <button 
                onClick={hideFeedback}
                className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${getButtonColor()}`}
              >
                Concluir
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmOpts && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmOpts(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              <div className="mb-6 p-4 rounded-full bg-rose-50 text-rose-500">
                <AlertCircle size={48} />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                {confirmOpts.title}
              </h3>
              
              <p className="text-slate-500 mb-8 font-medium leading-relaxed text-sm">
                {confirmOpts.message}
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmOpts(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest transition-all"
                >
                  {confirmOpts.cancelText || 'Cancelar'}
                </button>
                <button 
                  onClick={() => {
                    confirmOpts.onConfirm();
                    setConfirmOpts(null);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {confirmOpts.confirmText || 'Excluir'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
