import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchemes } from '../../redux/schemeSlice';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Calendar, Building, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import api from '../../api/axios';

const SchemeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { schemes, loading } = useSelector((state) => state.schemes);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    dispatch(fetchSchemes({ department, search }));
  }, [dispatch, department, search]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/schemes/saved').then(res => {
        setSavedIds(res.data.map(s => typeof s === 'string' ? s : s._id));
      }).catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  const toggleBookmark = async (e, id) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    try {
      await api.post(`/schemes/${id}/bookmark`);
      setSavedIds(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Government Schemes</h1>
          <p className="text-slate-500 mt-2">Discover and apply for financial assistance and programs</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Input 
            placeholder="Search schemes..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full sm:w-48 md:w-64"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
              placeholder="Filter Category" 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)} 
              className="w-full sm:w-40 md:w-48"
            />
            <Button onClick={() => dispatch(fetchSchemes({ department, search }))}>
              Search
            </Button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <article key={scheme._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-sky-200 hover:shadow-md transition-all group">
              <div className="p-6 flex-1 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    <Building className="w-3.5 h-3.5" />
                    {scheme.department || 'General'}
                  </div>
                  <button 
                    onClick={(e) => toggleBookmark(e, scheme._id)}
                    className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors z-10"
                    title={savedIds.includes(scheme._id) ? "Remove Bookmark" : "Save Scheme"}
                  >
                    {savedIds.includes(scheme._id) ? <BookmarkCheck className="w-5 h-5 text-sky-500" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-sky-600 transition-colors cursor-pointer" onClick={() => navigate(`/schemes/${scheme._id}`, { state: { scheme } })}>
                  {scheme.title}
                </h2>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                  {scheme.description}
                </p>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
                <div className="flex items-center text-sm font-medium text-rose-600">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Deadline: {scheme.deadline ? new Date(scheme.deadline).toLocaleDateString() : 'N/A'}
                </div>
                
                <button 
                  onClick={() => navigate(`/schemes/${scheme._id}`, { state: { scheme } })}
                  className="flex items-center text-sm font-bold text-sky-600 hover:text-sky-700"
                >
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </article>
          ))}
          {schemes.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              <p>No active schemes found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemeList;
