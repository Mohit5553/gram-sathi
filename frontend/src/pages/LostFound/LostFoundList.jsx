import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import ImageUpload from '../../components/common/ImageUpload';
import { Plus, MapPin, Phone, User, Image as ImageIcon, X } from 'lucide-react';
import Button from '../../components/ui/Button';

const LostFoundList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      const endpoint = filterType === 'all' ? '/lost-found' : `/lost-found?type=${filterType}`;
      const response = await api.get(endpoint);
      setReports(response.data.data || response.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterType]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = { ...data, images, date: new Date().toISOString() };
      await api.post('/lost-found', payload);
      toast.success('Report submitted successfully');
      setOpenModal(false);
      reset();
      setImages([]);
      fetchReports();
    } catch (err) {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lost & Found</h1>
          <p className="text-slate-500 mt-1">Help your community recover lost items</p>
        </div>
        <Button onClick={() => setOpenModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Report Item
        </Button>
      </div>

      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl w-fit">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'lost' ? 'bg-rose-500 shadow-sm text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
          onClick={() => setFilterType('lost')}
        >
          Lost Items
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'found' ? 'bg-emerald-500 shadow-sm text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
          onClick={() => setFilterType('found')}
        >
          Found Items
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reports.map((report) => (
            <article key={report._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {report.images && report.images.length > 0 ? (
                  <img 
                    src={report.images[0]} 
                    alt={report.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                  report.type === 'lost' 
                    ? 'bg-rose-500/90 text-white' 
                    : 'bg-emerald-500/90 text-white'
                }`}>
                  {report.type}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{report.title}</h2>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                  {report.description}
                </p>
                
                <div className="space-y-2 pt-4 border-t border-slate-100 text-sm">
                  <div className="flex items-center text-slate-700">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <User className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                    <span className="truncate">{report.contactName}</span>
                  </div>
                  <div className="flex items-center text-slate-700 font-medium">
                    <Phone className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                    <span className="truncate">{report.contactNumber}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {reports.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              <p>No reports found.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpenModal(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
              <h2 className="text-xl font-bold text-slate-900">Report an Item</h2>
              <button 
                onClick={() => setOpenModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <select 
                    {...register('type', { required: true })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  >
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <input 
                    type="text"
                    {...register('category')} 
                    placeholder="e.g. Wallet, Livestock"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input 
                    type="text"
                    {...register('title', { required: true })} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  {errors.title && <p className="mt-1 text-xs text-rose-500">Title is required</p>}
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea 
                    rows={3}
                    {...register('description', { required: true })} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                  />
                  {errors.description && <p className="mt-1 text-xs text-rose-500">Description is required</p>}
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location (Where it was lost/found)</label>
                  <input 
                    type="text"
                    {...register('location', { required: true })} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  {errors.location && <p className="mt-1 text-xs text-rose-500">Location is required</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Name</label>
                  <input 
                    type="text"
                    {...register('contactName', { required: true })} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  {errors.contactName && <p className="mt-1 text-xs text-rose-500">Contact name is required</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Number</label>
                  <input 
                    type="text"
                    {...register('contactNumber', { required: true })} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  {errors.contactNumber && <p className="mt-1 text-xs text-rose-500">Contact number is required</p>}
                </div>
                
                <div className="sm:col-span-2 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Upload Images</h3>
                  <ImageUpload images={images} setImages={setImages} maxImages={3} />
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                <Button 
                  variant="secondary"
                  type="button" 
                  onClick={() => setOpenModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={submitting}
                >
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFoundList;
