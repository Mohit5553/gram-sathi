import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const LocalMarketplace = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/marketplace?limit=3');
        if (response.data?.data && response.data.data.length > 0) {
          setItems(response.data.data.map(item => ({
            title: item.title,
            price: item.price,
            unit: item.unit || '',
            location: item.location,
            imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=150&q=80'
          })));
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to load marketplace listings:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="bg-card rounded-[24px] border border-border shadow-sm p-5 flex flex-col h-full min-h-[320px] hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
      <header className="flex justify-between items-center border-b border-border/60 pb-3 mb-4">
        <h3 className="font-extrabold text-foreground font-heading text-sm flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-orange-500" />
          {t('dashboard.marketplace')}
        </h3>
        <Link to="/marketplace" className="text-xs font-bold text-primary hover:underline">{t('dashboard.viewMore')}</Link>
      </header>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-1">
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col justify-between border border-border/55 rounded-xl overflow-hidden animate-pulse h-[140px] bg-slate-100 dark:bg-slate-900">
                <div className="w-full aspect-[16/9] bg-slate-200 dark:bg-slate-800"></div>
                <div className="p-2 space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground flex-1">
            <ShoppingBag className="w-8 h-8 text-slate-350 dark:text-slate-700 mb-2" />
            <p className="text-xs">{t('common.noData', 'No items available')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col justify-between border border-border/50 rounded-xl overflow-hidden hover:border-primary/40 transition-colors bg-slate-50/20 dark:bg-slate-900/10">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full aspect-[16/9] object-cover border-b border-border/40" 
                />
                <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-[10px] text-slate-800 dark:text-slate-200 truncate leading-snug">
                      {item.title}
                    </h4>
                    <div className="text-[10px] font-black text-emerald-600 mt-0.5">
                      {item.price}
                      <span className="text-[8px] text-muted-foreground font-medium">{item.unit}</span>
                    </div>
                  </div>
                  <div className="text-[8px] text-slate-400 dark:text-slate-500 font-bold truncate mt-1">
                    📍 {item.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-2 text-center border-t border-border/40 mt-auto">
        <Link to="/marketplace" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
          {t('dashboard.seeMore')} →
        </Link>
      </footer>
    </div>
  );
};

export default LocalMarketplace;
