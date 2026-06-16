import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabours } from '../../redux/labourSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdvancedSearchFilters from '../../components/common/AdvancedSearchFilters';
import Button from '../../components/ui/Button';
import { MapPin, Star, Briefcase } from 'lucide-react';
import VerificationBadge from '../../components/common/VerificationBadge';

const LabourList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { labours, loading } = useSelector((state) => state.labour);
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
    dispatch(fetchLabours(filters));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchLabours(filters));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hire Labour</h1>
        <p className="text-slate-500 mt-2">Find skilled and unskilled labour for your projects</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72 flex-shrink-0">
          <AdvancedSearchFilters 
            filters={filters} 
            setFilters={setFilters} 
            onSearch={handleSearch} 
            priceLabel="Daily Rate (₹)" 
          />
        </aside>
        
        <main className="flex-1">
          {loading ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {labours.map((labour) => (
                <article key={labour._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-lg font-bold text-slate-900">{labour.user?.name || 'Unknown'}</h2>
                          {labour.user?.verification?.status === 'approved' && <VerificationBadge />}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 mt-1 self-start">
                          {labour.skillType}
                        </span>
                      </div>
                      <div className="flex items-center bg-amber-50 px-2 py-1 rounded-md text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        <span className="text-sm font-bold">{labour.rating || 'New'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-slate-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        {labour.village}
                      </div>
                      <div className="flex items-center text-slate-600 text-sm">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                        {labour.experienceYears} years exp.
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-2xl font-black text-sky-600">
                        ₹{labour.dailyRate}<span className="text-sm font-medium text-slate-500">/day</span>
                      </div>
                      {labour.availability?.vacationMode && (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          On Vacation
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Button 
                      className="w-full"
                      variant={(labour.isAvailable && !labour.availability?.vacationMode) ? 'primary' : 'secondary'}
                      disabled={!labour.isAvailable || labour.availability?.vacationMode}
                      onClick={() => navigate(`/labour/hire/${labour._id}`, { state: { labour } })}
                    >
                      {labour.availability?.vacationMode ? 'On Vacation' : labour.isAvailable ? 'Hire Now' : 'Currently Unavailable'}
                    </Button>
                  </div>
                </article>
              ))}
              {labours.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p>No labour found matching your filters.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LabourList;
