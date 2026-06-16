import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const LocalJobs = () => {
  const { t, i18n } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/jobs?limit=3');
        if (response.data?.data && response.data.data.length > 0) {
          setJobs(response.data.data.map(job => ({
            role: job.role,
            company: job.company,
            salary: job.salary,
            time: new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            initial: job.initial || '💼'
          })));
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="bg-card rounded-[24px] border border-border shadow-sm p-5 flex flex-col h-full min-h-[320px] hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
      <header className="flex justify-between items-center border-b border-border/60 pb-3 mb-4">
        <h3 className="font-extrabold text-foreground font-heading text-sm flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-purple-500" />
          {t('dashboard.jobs')}
        </h3>
        <Link to="/jobs" className="text-xs font-bold text-primary hover:underline">{t('dashboard.viewMore')}</Link>
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
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground flex-1">
            <Briefcase className="w-8 h-8 text-slate-350 dark:text-slate-700 mb-2" />
            <p className="text-xs">{t('common.noData', 'No jobs available')}</p>
          </div>
        ) : (
          jobs.map((job, idx) => (
            <div key={idx} className="flex gap-4 items-center justify-between py-2.5 border-b border-border/40 last:border-b-0">
              <div className="flex gap-3 items-center min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-lg shrink-0">
                  {job.initial}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 truncate">{job.role}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{job.company}</p>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <div className="text-xs font-black text-primary">{job.salary}<span className="text-[9px] text-muted-foreground font-medium">/{i18n.language?.startsWith('hi') ? 'माह' : 'month'}</span></div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{job.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <footer className="pt-2 text-center border-t border-border/40 mt-auto">
        <Link to="/jobs" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
          {t('dashboard.seeMore')} →
        </Link>
      </footer>
    </div>
  );
};

export default LocalJobs;
