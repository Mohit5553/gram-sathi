import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../../components/common/ImageUpload';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LocationSelector from '../../components/common/LocationSelector';

const AddJCB = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState({ state: '', district: '', block: '', village: '' });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (!location.state || !location.district || !location.block || !location.village) {
      toast.error('Please select complete location details');
      return;
    }
    try {
      setLoading(true);
      const payload = { 
        ...data, 
        images,
        state: location.state,
        district: location.district,
        block: location.block,
        village: location.village
      };
      await api.post('/jcb', payload);
      toast.success('JCB registered successfully!');
      navigate('/jcb');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register JCB');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10">
        <header className="mb-8 border-b border-slate-100 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Register Your JCB
          </h1>
          <p className="text-slate-500 mt-2">List your JCB for rent</p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Rate Per Hour (₹)</label>
              <input 
                type="number"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none ${errors.ratePerHour ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                placeholder="e.g. 1500"
                {...register('ratePerHour', { required: true })} 
              />
              {errors.ratePerHour && <p className="mt-1 text-sm text-red-600">Rate is required</p>}
            </div>
            
            <div className="col-span-1 sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <LocationSelector
                state={location.state}
                district={location.district}
                block={location.block}
                village={location.village}
                onChange={setLocation}
                required={true}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Upload JCB Images</h3>
            <ImageUpload images={images} setImages={setImages} maxImages={4} />
          </div>

          <div className="pt-6 flex justify-end">
            <Button 
              type="submit" 
              isLoading={loading}
              className="w-full sm:w-auto px-8"
            >
              {loading ? 'Registering...' : 'Register JCB'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJCB;
