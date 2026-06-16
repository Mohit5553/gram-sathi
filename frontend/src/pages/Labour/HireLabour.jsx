import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { bookLabour, resetBookingState } from '../../redux/labourSlice';
import Button from '../../components/ui/Button';

const HireLabour = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const labour = location.state?.labour;

  const { bookingSuccess, error, loading } = useSelector((state) => state.labour);
  const [formData, setFormData] = useState({
    bookingDate: '',
    durationHours: 8,
    address: '',
    notes: '',
    paymentMethod: 'Cash'
  });

  useEffect(() => {
    if (bookingSuccess) {
      alert('Labour hired successfully! Waiting for acceptance.');
      dispatch(resetBookingState());
      navigate('/labour');
    }
  }, [bookingSuccess, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(bookLabour({
      providerId: id,
      ...formData
    }));
  };

  if (!labour) {
    return (
      <div className="p-8 text-center text-slate-500">
        Labour details not found.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10">
        <header className="mb-8 border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hire {labour.user?.name}
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex gap-4">
            <span>Skill: <span className="text-slate-900 font-bold">{labour.skillType}</span></span>
            <span>Daily Rate: <span className="text-sky-600 font-bold">₹{labour.dailyRate}</span></span>
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error.message || 'Booking failed'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
              <input 
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (Hours)</label>
              <input 
                type="number"
                name="durationHours"
                min="1"
                value={formData.durationHours}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Address</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (Optional)</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Describe the work required..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method (Direct to Provider)</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            >
              <option value="Cash">Cash on Delivery</option>
              <option value="UPI Direct">UPI Direct (Pay later to Provider)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              isLoading={loading}
              className="w-full sm:w-auto px-8"
            >
              Confirm Booking Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HireLabour;
