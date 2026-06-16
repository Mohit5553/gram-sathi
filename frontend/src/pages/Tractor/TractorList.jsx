import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTractors } from '../../redux/tractorSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdvancedSearchFilters from '../../components/common/AdvancedSearchFilters';
import Button from '../../components/ui/Button';
import { MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import VerificationBadge from '../../components/common/VerificationBadge';

const TractorList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tractors, loading } = useSelector((state) => state.tractor);
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
    dispatch(fetchTractors(filters));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchTractors(filters));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight font-heading">Rent a Tractor</h1>
        <p className="text-muted-foreground mt-2">Find and book local tractors for farming needs</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72 flex-shrink-0">
          <AdvancedSearchFilters 
            filters={filters} 
            setFilters={setFilters} 
            onSearch={handleSearch} 
            priceLabel="Rate Per Hour (₹)" 
          />
        </aside>
        
        <main className="flex-1">
          {loading ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-muted border-t-primary"></div>
             </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {tractors.map((tractor) => (
                <motion.article 
                  variants={itemVariants}
                  key={tractor._id} 
                  className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col group"
                >
                  <div className="p-5 flex-1 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-lg font-bold text-card-foreground font-heading">{tractor.owner?.name || 'Unknown Owner'}</h2>
                          {tractor.owner?.verification?.status === 'approved' && <VerificationBadge />}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mt-1 border border-primary/20 self-start">
                          {tractor.tractorType}
                        </span>
                      </div>
                      <div className="flex items-center bg-amber-500/10 px-2.5 py-1 rounded-lg text-amber-600 border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        <span className="text-sm font-bold">{tractor.rating || 'New'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 relative z-10">
                      <div className="flex items-center text-muted-foreground text-sm font-medium">
                        <MapPin className="w-4 h-4 mr-2 text-primary/70" />
                        {tractor.village}
                      </div>
                      {tractor.brand && (
                        <div className="text-sm text-muted-foreground">
                          Brand: <span className="font-semibold text-foreground">{tractor.brand}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto relative z-10">
                      <div className="text-2xl font-black text-primary">
                        ₹{tractor.ratePerHour}<span className="text-sm font-medium text-muted-foreground">/hr</span>
                      </div>
                      {tractor.availability?.vacationMode && (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          On Vacation
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-accent/30 border-t border-border">
                    <Button 
                      className="w-full shadow-none"
                      variant={(tractor.isAvailable && !tractor.availability?.vacationMode) ? 'primary' : 'secondary'}
                      disabled={!tractor.isAvailable || tractor.availability?.vacationMode}
                      onClick={() => navigate(`/tractors/book/${tractor._id}`, { state: { provider: tractor } })}
                    >
                      {tractor.availability?.vacationMode ? 'On Vacation' : tractor.isAvailable ? 'Book Now' : 'Currently Unavailable'}
                    </Button>
                  </div>
                </motion.article>
              ))}
              {tractors.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
                  <p>No tractors found matching your filters.</p>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TractorList;
