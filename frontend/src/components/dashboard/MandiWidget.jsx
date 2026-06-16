import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const MandiWidget = ({ className = '' }) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [stateFilter, setStateFilter] = useState('Uttar Pradesh');
  const [districtFilter, setDistrictFilter] = useState('Gonda');
  const [cropFilter, setCropFilter] = useState('');
  const [search, setSearch] = useState('');
  
  // Options list for quick selection
  const states = ['Uttar Pradesh', 'Bihar', 'Haryana', 'Punjab', 'Madhya Pradesh'];
  const districts = ['Gonda', 'Bijnor', 'Rampur', 'Basti', 'Ayodhya'];
  const crops = [
    { value: '', label: t('mandi.allCrops') },
    { value: 'gehu', label: t('crop.gehu') },
    { value: 'dhan', label: t('crop.dhan') },
    { value: 'sarso', label: t('crop.sarso') },
    { value: 'chana', label: t('crop.chana') },
    { value: 'arhar', label: t('crop.arhar') },
    { value: 'aloo', label: t('crop.aloo') }
  ];

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/dashboard/mandi?state=${encodeURIComponent(stateFilter)}&district=${encodeURIComponent(districtFilter)}`;
      if (cropFilter) url += `&crop=${encodeURIComponent(cropFilter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await api.get(url);
      setRecords(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch Mandi rates:', err);
      setError('Mandi rates update failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [stateFilter, districtFilter, cropFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRates();
  };

  return (
    <div className={`bg-card rounded-[24px] border border-border shadow-sm p-5 flex flex-col h-full min-h-[320px] relative overflow-hidden bg-white dark:bg-slate-950 ${className}`}>
      <header className="flex flex-wrap justify-between items-center gap-4 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-lg font-extrabold text-foreground font-heading flex items-center gap-1.5">
            🌾 {t('dashboard.mandiRates')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t('mandi.subtitle', 'Live commodity prices in Uttar Pradesh mandis')}</p>
        </div>
        <button 
          onClick={fetchRates} 
          disabled={loading}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
          title={t('mandi.refreshRates', 'Refresh rates')}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-4 mt-4 overflow-hidden">
        {/* Filters & Search */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
          
          {/* Search */}
          <div className="relative sm:col-span-2">
            <input 
              type="text"
              value={search}
              placeholder={t('mandi.searchPlaceholder')}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 text-xs text-foreground border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Crop Select */}
          <div>
            <select 
              value={cropFilter}
              onChange={e => setCropFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 text-xs text-foreground border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {crops.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div>
            <select 
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 text-xs text-foreground border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </form>

        {/* Mandi Rates Table wrapper */}
        <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center text-center py-12 text-rose-500 bg-rose-50 dark:bg-rose-950/10 rounded-xl border border-dashed border-rose-200">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span className="text-xs font-semibold">{error}</span>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">{t('common.noData', 'No crops found matching filters.')}</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-slate-950 z-10">
                <tr className="border-b border-border/80 font-bold text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/30">
                  <th className="py-2.5 px-3">{t('mandi.commodity')}</th>
                  <th className="py-2.5 px-3">{t('mandi.price')}</th>
                  <th className="py-2.5 px-3">{t('mandi.unit')}</th>
                  <th className="py-2.5 px-3">{t('mandi.market')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {records.slice(0, 3).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.cropName}</td>
                    <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                      ₹{item.modalPrice}
                      <span className="text-[10px] text-muted-foreground font-medium ml-1.5 block sm:inline">
                        (₹{item.minPrice} - ₹{item.maxPrice})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-500">/qtl</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">{item.marketName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <footer className="text-[10px] text-slate-400 flex justify-between items-center pt-2 border-t border-border/50 mt-auto">
        <span>{t('mandi.source')}</span>
        <Link to="/mandi" className="text-xs font-bold text-primary hover:underline">{t('dashboard.seeMore')} →</Link>
        <span>{t('mandi.interval')}</span>
      </footer>
    </div>
  );
};

export default MandiWidget;
