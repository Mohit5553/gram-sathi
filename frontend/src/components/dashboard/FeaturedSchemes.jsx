import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ArrowRight, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Button from '../ui/Button';

const FeaturedSchemes = () => {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await api.get('/schemes?featured=true&limit=3');
        if (response.data?.data && response.data.data.length > 0) {
          setSchemes(response.data.data);
        } else {
          setSchemes([]);
        }
      } catch (err) {
        console.error('Failed to load featured schemes:', err);
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-card rounded-[24px] border border-border shadow-sm p-5 flex flex-col h-full min-h-[320px] hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
      <header className="flex justify-between items-center border-b border-border/60 pb-3 mb-4">
        <div>
          <h3 className="font-extrabold text-foreground font-heading text-sm flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-600" />
            {t('dashboard.schemes')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{t('schemes.subtitle', 'Active welfare programs and direct benefit transfers')}</p>
        </div>
        <Link to="/schemes" className="text-xs font-bold text-primary hover:underline">{t('dashboard.viewMore')}</Link>
      </header>

      {/* Content area */}
      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar py-1">
        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center animate-pulse py-2.5">
                <div className="flex gap-3 items-center w-2/3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16 shrink-0"></div>
              </div>
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground flex-1">
            <Landmark className="w-8 h-8 text-slate-350 dark:text-slate-700 mb-2" />
            <p className="text-xs">{t('common.noData', 'No schemes available')}</p>
          </div>
        ) : (
          schemes.map((scheme, idx) => (
            <div key={idx} className="flex justify-between items-center gap-4 py-2.5 border-b border-border/40 last:border-b-0">
              <div className="flex gap-3 items-center min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg shrink-0">
                  {scheme.avatar || '🏛️'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 truncate">{scheme.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{scheme.description}</p>
                </div>
              </div>
              
              <div className="shrink-0">
                <Button size="sm" asChild>
                  <a href={scheme.link || `/schemes/${scheme._id}`} target="_blank" rel="noreferrer">
                    {t('dashboard.applyNow')}
                  </a>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <footer className="pt-2 text-center border-t border-border/40 mt-auto">
        <Link to="/schemes" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
          {t('dashboard.seeMore')} →
        </Link>
      </footer>
    </div>
  );
};

export default FeaturedSchemes;
