import React from 'react';
import { Phone, Shield, HeartPulse, Flame, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const EmergencyWidget = () => {
  const { t } = useTranslation();
  const hotlines = [
    { key: 'police', title: 'Police Department', number: '112', icon: Shield, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { key: 'ambulance', title: 'Ambulance Service', number: '102', icon: HeartPulse, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    { key: 'fire', title: 'Fire Brigade', number: '101', icon: Flame, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
    { key: 'women', title: 'Women Helpline', number: '1091', icon: Eye, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { key: 'kisan', title: 'Kisan Helpline', number: '1551', icon: Phone, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
  ];

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
      <header className="flex justify-between items-center border-b border-border/60 pb-3 mb-2">
        <div>
          <h3 className="text-lg font-extrabold text-foreground font-heading flex items-center gap-2">
            🚨 {t('dashboard.emergency')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t('emergency.subtitle')}</p>
        </div>
        <Link to="/emergency" className="text-xs font-bold text-primary hover:underline">{t('dashboard.viewMore')}</Link>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {hotlines.map((hotline, idx) => {
          const Icon = hotline.icon;
          return (
            <a 
              key={idx}
              href={`tel:${hotline.number}`}
              className="group flex flex-col items-center text-center p-4 bg-slate-50/50 hover:bg-slate-100/70 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 rounded-xl transition-all active:scale-[0.98]"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${hotline.color}`}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-350 leading-tight h-8 flex items-center justify-center">{t('emergency.' + hotline.key, hotline.title)}</h4>
              <div className="mt-1 flex items-center justify-center gap-1 py-1 px-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-md shadow-sm">
                <Phone size={9} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-900 dark:text-white">{hotline.number}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default EmergencyWidget;
