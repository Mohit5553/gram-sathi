import React from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../../context/PWAContext';

const InstallPWA = () => {
  const { showPrompt, install, dismissPrompt } = usePWA();

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm"
      >
        <div className="relative overflow-hidden bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-slate-800/50 p-4.5 flex items-center justify-between gap-4">
          {/* Subtle glow background */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-violet-400/10 dark:bg-violet-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-50 text-sm tracking-tight">
                Install GramSathi
              </h4>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                Fast & reliable offline access
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            <button 
              onClick={install}
              className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
            >
              Install
            </button>
            <button 
              onClick={dismissPrompt}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              aria-label="Dismiss prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPWA;
