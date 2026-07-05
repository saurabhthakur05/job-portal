import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password: data.password });
      localStorage.setItem('token', res.data.token);
      toast.success('Password reset successfully');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid or expired reset link');
    }
  };

  if (!token) return <div className="text-center py-20">Invalid reset link</div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-card">
        <h1 className="text-2xl font-bold text-center mb-8">Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="password" placeholder="New password" className="input-field" {...register('password', { required: true, minLength: 6 })} />
          <button type="submit" className="btn-primary w-full">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
