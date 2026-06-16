import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const DistrictNews = () => {
  const { t } = useTranslation();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/cms?type=news&limit=3');
        if (response.data?.data && response.data.data.length > 0) {
          setNewsItems(response.data.data.map(item => ({
            title: item.title,
            source: item.author || 'Admin',
            time: new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=150&q=80'
          })));
        } else {
          setNewsItems([]);
        }
      } catch (err) {
        console.error('Failed to load news:', err);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="bg-card rounded-[24px] border border-border shadow-sm p-5 flex flex-col h-full min-h-[320px] hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
      <header className="flex justify-between items-center border-b border-border/60 pb-3 mb-4">
        <h3 className="font-extrabold text-foreground font-heading text-sm flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-indigo-500" />
          {t('dashboard.news')}
        </h3>
        <Link to="/news" className="text-xs font-bold text-primary hover:underline">{t('dashboard.viewMore')}</Link>
      </header>

      {/* Content area */}
      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar py-1">
        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 items-start py-2 border-b border-border/40 animate-pulse last:border-b-0">
                <div className="w-24 aspect-[16/9] bg-slate-100 dark:bg-slate-900 rounded-lg shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground flex-1">
            <Newspaper className="w-8 h-8 text-slate-355 dark:text-slate-700 mb-2" />
            <p className="text-xs">{t('common.noData', 'No news available')}</p>
          </div>
        ) : (
          newsItems.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start py-2 border-b border-border/40 last:border-b-0 last:pb-0">
              <img 
                src={item.imageUrl} 
                alt="news thumbnail" 
                className="w-24 aspect-[16/9] object-cover rounded-lg border border-border shrink-0" 
              />
              <div className="space-y-1.5 min-w-0">
                <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                  {item.title}
                </h4>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="pt-2 text-center border-t border-border/40 mt-auto">
        <Link to="/news" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
          {t('dashboard.seeMore')} →
        </Link>
      </footer>
    </div>
  );
};

export default DistrictNews;
