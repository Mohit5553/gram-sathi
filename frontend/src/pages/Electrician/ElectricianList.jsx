import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchElectricians } from '../../redux/electricianSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdvancedSearchFilters from '../../components/common/AdvancedSearchFilters';
import Button from '../../components/ui/Button';
import { MapPin, Star, Zap } from 'lucide-react';
import VerificationBadge from '../../components/common/VerificationBadge';

const ElectricianList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { electricians, loading } = useSelector((state) => state.electrician);
  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    district: searchParams.get('district') || '',
    block: searchParams.get('block') || '',
    village: searchParams.get('village') || '',
    minPrice: 0,
    maxPrice: 5000,
    minRating: 0,
    isAvailable: ''
  });

  useEffect(() => {
    dispatch(fetchElectricians(filters));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchElectricians(filters));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hire an Electrician</h1>
        <p className="text-slate-500 mt-2">Find professional electricians for wiring and repairs</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72 flex-shrink-0">
          <AdvancedSearchFilters 
            filters={filters} 
            setFilters={setFilters} 
            onSearch={handleSearch} 
            priceLabel="Visit Charge (₹)" 
          />
        </aside>
        
        <main className="flex-1">
          {loading ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {electricians.map((elec) => (
                <article key={elec._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-lg font-bold text-slate-900">{elec.user?.name || 'Unknown'}</h2>
                          {elec.user?.verification?.status === 'approved' && <VerificationBadge />}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1 self-start">
                          <Zap className="w-3 h-3 mr-1" />
                          {elec.specialization || 'General Electrician'}
                        </span>
                      </div>
                      <div className="flex items-center bg-sky-50 px-2 py-1 rounded-md text-sky-700">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        <span className="text-sm font-bold">{elec.rating || 'New'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-slate-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        {elec.village}
                      </div>
                      <div className="flex items-center text-slate-600 text-sm">
                        <span className="font-medium mr-2">Experience:</span>
                        {elec.experienceYears} years
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-2xl font-black text-sky-600">
                        ₹{elec.visitCharge}<span className="text-sm font-medium text-slate-500">/visit</span>
                      </div>
                      {elec.availability?.vacationMode && (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          On Vacation
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Button 
                      className="w-full"
                      variant={(elec.isAvailable && !elec.availability?.vacationMode) ? 'primary' : 'secondary'}
                      disabled={!elec.isAvailable || elec.availability?.vacationMode}
                      onClick={() => navigate(`/electricians/book/${elec._id}`, { state: { provider: elec } })}
                    >
                      {elec.availability?.vacationMode ? 'On Vacation' : elec.isAvailable ? 'Book Now' : 'Currently Unavailable'}
                    </Button>
                  </div>
                </article>
              ))}
              {electricians.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p>No electricians found matching your filters.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default ElectricianList;
