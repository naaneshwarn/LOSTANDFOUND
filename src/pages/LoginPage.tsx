import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { DEMO_PERSONAS } from '../lib/constants';
import { Search, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchPersona } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('sarah.chen@university.edu');
  const [password, setPassword] = useState<string>('password123');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      showToast({
        type: 'success',
        title: 'Signed In',
        message: `Welcome back!`,
      });
      navigate(from, { replace: true });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Login Error',
        message: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersona = (personaId: string) => {
    switchPersona(personaId);
    showToast({
      type: 'info',
      title: 'Demo Persona Activated',
      message: 'Logged in with selected demo profile.',
    });
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
          Sign In to LOSTANDFOUND AI
        </h1>
        <p className="text-xs text-slate-500">
          Access your reported items, potential matches, and safe messages
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full justify-center font-bold h-11 text-sm shadow-md"
          >
            Sign In
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Instant 1-Click Demo Login:</span>
          </p>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickPersona(p.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/40 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={p.avatarUrl}
                    alt={p.fullName}
                    className="h-7 w-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-900">{p.fullName}</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">
                      {p.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-brand-600 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
