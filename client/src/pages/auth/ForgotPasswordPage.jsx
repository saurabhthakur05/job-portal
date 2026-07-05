import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-card">
        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-center mb-8">Enter your email to receive a reset link</p>
        {sent ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">Check your email for the reset link.</p>
            <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="email" placeholder="Email address" className="input-field" {...register('email', { required: true })} />
            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
