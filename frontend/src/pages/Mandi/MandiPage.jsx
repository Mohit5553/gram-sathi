import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, AlertCircle, ArrowLeft, ArrowUpRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const MandiPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [stateFilter, setStateFilter] = useState('Uttar Pradesh');
  const [districtFilter, setDistrictFilter] = useState('Gonda');
  const [cropFilter, setCropFilter] = useState('');
  const [search, setSearch] = useState('');

  const states = ['Uttar Pradesh', 'Bihar', 'Haryana', 'Punjab', 'Madhya Pradesh'];
  const districts = ['Gonda', 'Bijnor', 'Rampur', 'Basti', 'Ayodhya'];
  const crops = [
    { value: '', label: 'All Crops' },
    { value: 'gehu', label: 'Gehu (Wheat)' },
    { value: 'dhan', label: 'Dhan (Paddy)' },
    { value: 'sarso', label: 'Sarso (Mustard)' },
    { value: 'chana', label: 'Chana (Gram)' },
    { value: 'arhar', label: 'Arhar (Pigeon Pea)' },
    { value: 'aloo', label: 'Aloo (Potato)' }
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Back Header */}
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-heading">
            🌾 Today's Crop Mandi Rates
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Live commodity prices tracked across agricultural market networks (AGMARKNET)
          </p>
        </div>
        <button 
          onClick={fetchRates} 
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg border border-border transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Prices
        </button>
      </header>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 rounded-[24px]">
          <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Top Commodity</h3>
          <p className="text-2xl font-black text-emerald-950 dark:text-emerald-250 mt-1">Gehu (Wheat)</p>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Average: ₹2,450 / quintal</span>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-5 rounded-[24px]">
          <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Market Tracked</h3>
          <p className="text-2xl font-black text-blue-950 dark:text-blue-250 mt-1">{districtFilter} Mandi</p>
          <span className="text-[10px] text-blue-600 font-bold block mt-1">Active updates from AGMARKNET</span>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-[24px]">
          <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">State Volume</h3>
          <p className="text-2xl font-black text-amber-950 dark:text-amber-250 mt-1">{stateFilter}</p>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">Daily updates every 6 hours</span>
        </div>
      </div>

      {/* Main Filter Panel */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-[24px] border border-border/80">
        <div className="relative sm:col-span-2">
          <input 
            type="text"
            value={search}
            placeholder="Search crop, commodity, or specific market..."
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 text-xs sm:text-sm text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <div>
          <select 
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-xs sm:text-sm text-foreground border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
          >
            {crops.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <select 
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-xs sm:text-sm text-foreground border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </form>

      {/* Rates Table Block */}
      <div className="bg-card rounded-[24px] border border-border shadow-sm overflow-hidden bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 p-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between items-center animate-pulse">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/5"></div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center text-center p-12 text-rose-500 bg-rose-50/50 dark:bg-rose-950/10">
              <AlertCircle className="w-10 h-10 mb-2" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center p-16 text-muted-foreground">
              <p className="text-sm font-semibold">No commodities found matching the search filter.</p>
              <p className="text-xs mt-1">Try selecting other districts or clearing search text.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border font-extrabold text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/40">
                  <th className="py-3 px-5">Commodity Name</th>
                  <th className="py-3 px-5">Market Price (Modal)</th>
                  <th className="py-3 px-5">Price Range</th>
                  <th className="py-3 px-5">State & Market Mandi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {records.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="text-base">🌾</span> {item.cropName}
                    </td>
                    <td className="py-3.5 px-5 text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base">
                      ₹{item.modalPrice} <span className="text-[10px] text-muted-foreground font-medium">/ quintal</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-bold">
                      ₹{item.minPrice} - ₹{item.maxPrice}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-bold">
                      {stateFilter} • <span className="text-slate-800 dark:text-slate-350">{item.marketName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MandiPage;
