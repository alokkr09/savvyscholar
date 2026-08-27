import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight, LogOut, Info } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (monthlyIncome && (isNaN(Number(monthlyIncome)) || Number(monthlyIncome) < 0)) {
      newErrors.monthlyIncome = 'Monthly income cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0,
        currency: 'INR',
      });
      navigate('/dashboard');
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Savvy Scholar
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create your account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Start mastering your student personal finance in minutes
          </p>
        </div>

        {/* Existing Session Alert */}
        {isAuthenticated && user && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Currently logged in as <strong>{user.name}</strong> ({user.email}).
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 font-bold text-amber-900 text-[11px] transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out First</span>
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-fintech-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Alok Kumar"
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoFocus
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g. alok@college.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <div>
              <Input
                label="Password *"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
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
                autoComplete="new-password"
                helperText="Minimum 6 characters"
              />
            </div>

            <Input
              label="Estimated Monthly Income / Pocket Money (₹)"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 15000 (Stipend, allowance, part-time)"
              prefixText="₹"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              error={errors.monthlyIncome}
              helperText="Baseline to calculate your monthly savings rate (can be adjusted later)"
            />

            <Button
              type="submit"
              variant="brand"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-md shadow-emerald-600/20 mt-2"
            >
              Complete Registration
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
