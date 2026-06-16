import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../api/axios';
import { loginStart, loginSuccess, loginFailure } from '../../redux/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const schema = yup.object({
  otp: yup.string().matches(/^[0-9]{6}$/, 'Must be exactly 6 digits').required('OTP is required'),
}).required();

const VerifyOtp = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      dispatch(loginStart());
      const response = await api.post('/auth/verify-otp', { email, otp: data.otp });
      const userData = response.data.user;
      dispatch(loginSuccess(response.data));
      
      if (!userData?.profileCompleted) {
        toast.success('Welcome! Please complete your profile to continue.');
        navigate('/profile', { replace: true, state: { forceComplete: true } });
      } else if (userData?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userData?.role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to verify OTP';
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4">
      <article className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Verify OTP</h1>
          <p className="text-sm text-slate-500">Enter the 6-digit OTP sent to <span className="font-medium text-slate-900">{email}</span></p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="6-Digit OTP"
            type="text"
            {...register('otp')}
            error={errors.otp?.message}
            disabled={loading}
            placeholder="123456"
            maxLength={6}
          />
          
          <Button
            type="submit"
            className="w-full py-6 text-base"
            isLoading={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      </article>
    </div>
  );
};

export default VerifyOtp;
