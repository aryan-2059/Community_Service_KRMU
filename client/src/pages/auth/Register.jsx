import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      login(data.token, data.user);
      navigate(data.user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-border">
        <div className="flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-brand" />
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Create an account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === 'TEACHER' ? 'bg-white shadow-sm text-brand' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setFormData(p => ({ ...p, role: 'TEACHER' }))}
            >
              Teacher
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === 'STUDENT' ? 'bg-white shadow-sm text-brand' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setFormData(p => ({ ...p, role: 'STUDENT' }))}
            >
              Student
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" required className="mt-1 block w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input type="email" required className="mt-1 block w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type="password" required className="mt-1 block w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input type="password" required className="mt-1 block w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" value={formData.confirmPassword} onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
          </div>
          <Button type="submit" className="w-full" loading={loading}>Register</Button>
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-brand hover:text-brand-dark">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
