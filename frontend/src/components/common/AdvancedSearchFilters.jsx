import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LocationSelector from './LocationSelector';

const AdvancedSearchFilters = ({ filters, setFilters, onSearch, priceLabel = "Price Range (₹)" }) => {
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePriceChange = (e, type) => {
    const val = parseInt(e.target.value) || 0;
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'minPrice' : 'maxPrice']: val
    }));
  };

  const clearFilters = () => {
    setFilters({
      state: '',
      district: '',
      block: '',
      village: '',
      minPrice: 0,
      maxPrice: 5000,
      minRating: 0,
      isAvailable: ''
    });
    setTimeout(() => onSearch(), 0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Filter className="w-5 h-5" />
        <h2 className="text-lg font-bold">Filters</h2>
      </div>
      
      <hr className="border-slate-100 mb-6" />

      <div className="space-y-6">
        {/* Location Search Hierarchy */}
        <div>
          <LocationSelector
            state={filters.state || ''}
            district={filters.district || ''}
            block={filters.block || ''}
            village={filters.village || ''}
            onChange={(updated) => {
              setFilters(prev => ({
                ...prev,
                state: updated.state,
                district: updated.district,
                block: updated.block,
                village: updated.village
              }));
            }}
          />
        </div>

        {/* Availability Toggle */}
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              name="isAvailable"
              className="sr-only"
              checked={filters.isAvailable === true || filters.isAvailable === 'true'}
              onChange={handleChange}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${filters.isAvailable ? 'bg-sky-500' : 'bg-slate-300'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.isAvailable ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm font-medium text-slate-700">Available Now Only</div>
        </label>

        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, minRating: star }))}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  filters.minRating >= star 
                    ? 'bg-amber-100 text-amber-600 border border-amber-200' 
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {star}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{priceLabel}</label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={filters.minPrice || 0}
                onChange={(e) => handlePriceChange(e, 'min')}
              />
              <div className="text-xs text-slate-500 mt-1">Min (₹)</div>
            </div>
            <span className="text-slate-400 font-medium">-</span>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={filters.maxPrice || 5000}
                onChange={(e) => handlePriceChange(e, 'max')}
              />
              <div className="text-xs text-slate-500 mt-1">Max (₹)</div>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <Button 
            className="w-full"
            onClick={onSearch}
          >
            <Search className="w-4 h-4 mr-2" /> Apply Filters
          </Button>
          <Button 
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700"
            onClick={clearFilters}
          >
            <X className="w-4 h-4 mr-2" /> Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchFilters;
