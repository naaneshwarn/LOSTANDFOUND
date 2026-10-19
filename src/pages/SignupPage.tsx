import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, ShieldCheck } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Details',
        message: 'Please complete all required fields.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, fullName);
      showToast({
        type: 'success',
        title: 'Account Created',
        message: 'Welcome to LOSTANDFOUND AI! You can now report and track items.',
      });
      navigate('/dashboard');
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
          Create an Account
        </h1>
        <p className="text-xs text-slate-500">
          Join the campus lost and found visual recovery network
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Jordan Taylor"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="University / Organization Email *"
            type="email"
            placeholder="jordan.taylor@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password *"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Protected by PostgreSQL Row Level Security.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full justify-center font-bold h-11 text-sm shadow-md"
          >
            Create Account
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
