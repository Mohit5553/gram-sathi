import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContacts } from '../../redux/emergencySlice';
import { PhoneCall } from 'lucide-react';

const categories = ['All', 'Police', 'Ambulance', 'Hospital', 'Fire', 'Electricity', 'Panchayat', 'Other'];

const EmergencyContacts = () => {
  const dispatch = useDispatch();
  const { contacts, loading } = useSelector((state) => state.emergency);
  const [village, setVillage] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const params = {};
    if (village) params.village = village;
    if (category !== 'All') params.category = category;
    dispatch(fetchContacts(params));
  }, [dispatch, village, category]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-bold text-rose-600 tracking-tight">
          Emergency Contacts Directory
        </h1>
        <p className="text-slate-500 mt-2">Important local numbers for quick assistance</p>
      </header>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="w-full sm:w-auto flex-1 min-w-[200px] max-w-xs">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Search by Village</label>
          <input 
            type="text"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            placeholder="e.g. Rampur"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-auto flex-1 min-w-[200px] max-w-xs">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
          <select 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none appearance-none bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-rose-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <article key={contact._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col border-t-4 border-t-rose-500">
              <div className="p-5 flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-1">{contact.name}</h2>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 mb-4">
                  {contact.category}
                </span>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-slate-600 text-sm">
                    <span className="font-medium mr-2 w-16">Village:</span>
                    {contact.village || 'N/A'}
                  </div>
                  <div className="flex items-start text-slate-600 text-sm">
                    <span className="font-medium mr-2 w-16">Address:</span>
                    <span className="flex-1">{contact.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-rose-50 flex items-center justify-between">
                <span className="text-xl font-bold text-rose-600 tracking-wide">
                  {contact.number}
                </span>
                <a 
                  href={`tel:${contact.number}`}
                  className="bg-white p-2 rounded-full text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-colors"
                  aria-label="Call"
                >
                  <PhoneCall className="w-5 h-5" />
                </a>
              </div>
            </article>
          ))}
          {contacts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              <p>No emergency contacts found for the selected criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
