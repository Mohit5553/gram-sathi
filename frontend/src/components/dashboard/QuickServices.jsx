import React from 'react';
import { 
  Building2, CreditCard, Fingerprint, Zap, Droplet, 
  MessageSquareWarning, Grid 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const QuickServices = () => {
  const items = [
    { label: 'पंचायत जानकारी', icon: Building2, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', url: 'https://panchayatiraj.up.nic.in/' },
    { label: 'राशन कार्ड', icon: CreditCard, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', url: 'https://fcs.up.gov.in/' },
    { label: 'आधार सेवाएं', icon: Fingerprint, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', url: 'https://uidai.gov.in/' },
    { label: 'बिजली बिल', icon: Zap, color: 'bg-yellow-500/10 text-yellow-650 dark:text-yellow-400', url: 'https://www.upenergy.in/' },
    { label: 'पानी बिल', icon: Droplet, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', url: 'https://upjalnigam.co.in/' },
    { label: 'शिकायत दर्ज करें', icon: MessageSquareWarning, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', url: 'https://jansunwai.up.nic.in/' },
    { label: 'अधिक सेवाएं', icon: Grid, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', isLocal: true, path: '/services' }
  ];

  const handleLinkClick = (item) => {
    if (item.isLocal) {
      window.location.href = item.path;
    } else {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      toast.success(`Redirecting to official portal for ${item.label}`);
    }
  };

  return (
    <div className="bg-card rounded-[24px] border border-border shadow-sm p-6 bg-white dark:bg-slate-950">
      <header className="border-b border-border/60 pb-3 mb-4">
        <h3 className="text-lg font-extrabold text-foreground font-heading flex items-center gap-2">
          ⚡ Quick Services
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Official government services and utility portals</p>
      </header>

      <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={idx}
              onClick={() => handleLinkClick(item)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="group flex flex-col items-center text-center p-3 bg-slate-50/50 hover:bg-slate-100/70 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 rounded-xl transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${item.color}`}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-350 leading-tight tracking-wide">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickServices;
