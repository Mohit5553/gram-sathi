import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Search, MapPin, Sliders, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationSelector = ({ 
  state = '', 
  district = '', 
  block = '', 
  village = '', 
  onChange = () => {}, 
  required = false,
  showLabels = true
}) => {
  const [mode, setMode] = useState('dropdown'); // 'dropdown' | 'search'
  
  // Hierarchy Data
  const [hierarchy, setHierarchy] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [villagesList, setVillagesList] = useState([]);
  
  // Search Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Fetch complete hierarchy on mount
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const response = await api.get('/locations/hierarchy');
        setHierarchy(response.data);
        setStatesList(response.data.map(item => item.state));
      } catch (err) {
        console.error('Failed to fetch location hierarchy', err);
      }
    };
    fetchHierarchy();
  }, []);

  // Update lists based on selections
  useEffect(() => {
    if (!hierarchy.length) return;
    
    // Find current state
    const stateObj = hierarchy.find(item => item.state === state);
    if (stateObj) {
      setDistrictsList(stateObj.districts.map(d => d.district));
      
      // Find current district
      const distObj = stateObj.districts.find(d => d.district === district);
      if (distObj) {
        setBlocksList(distObj.blocks.map(b => b.block));
        
        // Find current block
        const blockObj = distObj.blocks.find(b => b.block === block);
        if (blockObj) {
          setVillagesList(blockObj.villages);
        } else {
          setVillagesList([]);
        }
      } else {
        setBlocksList([]);
        setVillagesList([]);
      }
    } else {
      setDistrictsList([]);
      setBlocksList([]);
      setVillagesList([]);
    }
  }, [hierarchy, state, district, block]);

  // Synchronize search query display value when location details change external/internally
  useEffect(() => {
    if (village && block && district && state) {
      setSearchQuery(`${village}, ${block}, ${district}, ${state}`);
    } else {
      setSearchQuery('');
    }
  }, [state, district, block, village]);

  // Search autocomplete handler
  useEffect(() => {
    if (mode !== 'search' || !searchQuery || searchQuery.includes(',')) {
      setSuggestions([]);
      return;
    }
    
    const delayDebounce = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const response = await api.get(`/locations/search?query=${searchQuery}`);
        setSuggestions(response.data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, mode]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStateChange = (e) => {
    const val = e.target.value;
    onChange({ state: val, district: '', block: '', village: '' });
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    onChange({ state, district: val, block: '', village: '' });
  };

  const handleBlockChange = (e) => {
    const val = e.target.value;
    onChange({ state, district, block: val, village: '' });
  };

  const handleVillageChange = (e) => {
    const val = e.target.value;
    onChange({ state, district, block, village: val });
  };

  const selectSuggestion = (item) => {
    onChange({
      state: item.state,
      district: item.district,
      block: item.block,
      village: item.village
    });
    setSearchQuery(item.fullPath);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* Toggle View Mode */}
      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold max-w-xs ml-auto">
        <button
          type="button"
          onClick={() => setMode('dropdown')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            mode === 'dropdown' 
              ? 'bg-white text-slate-800 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Select Dropdown
        </button>
        <button
          type="button"
          onClick={() => setMode('search')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            mode === 'search' 
              ? 'bg-white text-slate-800 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Quick Search
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'dropdown' ? (
          <motion.div
            key="dropdown-mode"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* State */}
            <div>
              {showLabels && <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">State</label>}
              <div className="relative">
                <select
                  value={state}
                  onChange={handleStateChange}
                  required={required}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none transition-all cursor-pointer font-medium"
                >
                  <option value="">Select State</option>
                  {statesList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* District */}
            <div>
              {showLabels && <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">District</label>}
              <div className="relative">
                <select
                  value={district}
                  onChange={handleDistrictChange}
                  required={required}
                  disabled={!state}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
                >
                  <option value="">Select District</option>
                  {districtsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Block */}
            <div>
              {showLabels && <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Block</label>}
              <div className="relative">
                <select
                  value={block}
                  onChange={handleBlockChange}
                  required={required}
                  disabled={!district}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
                >
                  <option value="">Select Block</option>
                  {blocksList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Village */}
            <div>
              {showLabels && <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Village</label>}
              <div className="relative">
                <select
                  value={village}
                  onChange={handleVillageChange}
                  required={required}
                  disabled={!block}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
                >
                  <option value="">Select Village</option>
                  {villagesList.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="search-mode"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="relative"
            ref={searchContainerRef}
          >
            {showLabels && <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Search Village / Block</label>}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type village, block or district name..."
                required={required}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium placeholder:text-slate-400 shadow-sm"
              />
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              {loadingSuggestions && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
              )}
            </div>

            {/* Suggestions list popup */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectSuggestion(item)}
                      className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-800">{item.village}</div>
                        <div className="text-xs text-slate-400 font-medium">Block: {item.block} • {item.district}, {item.state}</div>
                      </div>
                      <MapPin className="w-4 h-4 text-sky-500 shrink-0 opacity-40" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSelector;
