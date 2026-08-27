import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const { login } = useAuth();
  const { error: toastError, info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  React.useEffect(() => {
    if (isExpired) {
      info('Session Expired', 'Please log in again to continue.');
    }
  }, [isExpired, info]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch {
      // Error handled by AuthContext toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = async () => {
    try {
      setIsDemoLoading(true);
      await login({
        email: 'scholar.demo@savvyscholar.io',
        password: 'Password123',
      });
      navigate('/dashboard');
    } catch {
      // Fallback: fill inputs for user
      setEmail('scholar.demo@savvyscholar.io');
      setPassword('Password123');
      toastError('Demo Account', 'Click "Sign In" or create a fresh account below.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Savvy Scholar
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to manage your budget, savings, and investments
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-fintech-card space-y-5">
          {/* Quick 1-Click Demo Button */}
          <button
            type="button"
            onClick={handleFillDemo}
            disabled={isDemoLoading || isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{isDemoLoading ? 'Signing in with Demo...' : '1-Click Sign In with Demo Account'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alok@college.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-md shadow-emerald-600/20 mt-2"
            >
              Sign In to Dashboard
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-600">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
};
