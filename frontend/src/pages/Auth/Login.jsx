import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = yup.object({
  email: yup.string().email('Must be a valid email').required('Email is required'),
}).required();

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/send-otp', { email: data.email });
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4">
      <article className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Login to GramSathi</h1>
          <p className="text-sm text-slate-500">Enter your email address to receive an OTP</p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            disabled={loading}
            placeholder="you@example.com"
          />
          
          <Button
            type="submit"
            className="w-full py-6 text-base"
            isLoading={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      </article>
    </div>
  );
};

export default Login;
