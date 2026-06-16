import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Search, MapPin, Tractor, LoaderPinwheel, HardHat, Zap, Wrench, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

const LocationAvailability = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await api.get('/locations/availability');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch location availability', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const filteredData = data.filter(item => 
    item.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceIcon = (service) => {
    switch(service) {
      case 'Tractor': return Tractor;
      case 'JCB': return LoaderPinwheel;
      case 'Labour': return HardHat;
      case 'Electrician': return Zap;
      case 'Plumber': return Wrench;
      default: return Wrench;
    }
  };

  const getServiceColor = (service, count) => {
    if (count === 0) return 'text-slate-300 border-slate-100 bg-slate-50/50';
    switch(service) {
      case 'Tractor': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'JCB': return 'text-sky-600 bg-sky-50 border-sky-100';
      case 'Labour': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Electrician': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'Plumber': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const handleServiceClick = (serviceType, item) => {
    const serviceRoutes = {
      'Tractor': '/tractors',
      'JCB': '/jcb',
      'Labour': '/labour',
      'Electrician': '/electricians',
      'Plumber': '/plumbers'
    };
    
    const route = serviceRoutes[serviceType];
    if (route) {
      navigate(`${route}?state=${encodeURIComponent(item.state)}&district=${encodeURIComponent(item.district)}&block=${encodeURIComponent(item.block)}&village=${encodeURIComponent(item.village)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Service Availability directory
        </h1>
        <p className="text-slate-500 mt-3 text-lg leading-relaxed">
          Verify available local tractor owners, JCB operators, contractors, electricians, and plumbers in your area.
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-12 relative">
        <input 
          type="text" 
          placeholder="Search by state, district, block or village..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 shadow-sm transition-all font-medium"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Villages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.village}</h3>
                  <div className="flex flex-wrap items-center gap-1 mt-1.5 text-xs text-slate-400 font-semibold tracking-wide">
                    <span>{item.state}</span>
                    <span>•</span>
                    <span>{item.district}</span>
                    <span>•</span>
                    <span>{item.block}</span>
                  </div>
                </div>
                <div className="bg-sky-50 text-sky-600 p-2 rounded-xl border border-sky-100">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6 mb-8">
                {Object.entries(item.services).map(([service, count]) => {
                  const Icon = getServiceIcon(service);
                  const isAvailable = count > 0;
                  return (
                    <button
                      key={service}
                      onClick={() => isAvailable && handleServiceClick(service, item)}
                      disabled={!isAvailable}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                        getServiceColor(service, count)
                      } ${isAvailable ? 'hover:scale-[1.03] active:scale-[0.98] cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                    >
                      <Icon className="w-5 h-5 mb-1.5" />
                      <span className="text-xs font-bold capitalize">{service}</span>
                      <span className="text-base font-black mt-0.5">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">
                {item.totalCount > 0 ? (
                  <span className="text-emerald-600 font-bold">{item.totalCount} active listings</span>
                ) : (
                  <span className="text-slate-400">No active listings</span>
                )}
              </span>
              {item.totalCount > 0 ? (
                <span className="text-sky-600 font-bold hover:underline cursor-pointer" onClick={() => handleServiceClick('Tractor', item)}>
                  View Directory →
                </span>
              ) : (
                <span className="text-slate-300 font-medium">Offline</span>
              )}
            </div>
          </motion.div>
        ))}

        {filteredData.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 max-w-md mx-auto w-full">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Villages Found</h3>
            <p className="text-slate-500 mt-2 text-sm">Verify the spelling or search for another location.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationAvailability;
