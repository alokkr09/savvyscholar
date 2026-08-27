import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

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
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must include at least one letter and one number';
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
        email: email.trim(),
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
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
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

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-fintech-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="Alok Kumar"
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoFocus
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="alok@college.edu"
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
                placeholder="At least 6 chars with letters & numbers"
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
                helperText="Must contain at least 6 characters with a letter and a digit"
              />
            </div>

            <Input
              label="Estimated Monthly Income / Pocket Money (₹)"
              type="number"
              min="0"
              step="500"
              placeholder="e.g. 15000 (Stipend, allowance, part-time)"
              prefixText="₹"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              error={errors.monthlyIncome}
              helperText="Optional baseline to calculate your monthly savings rate"
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
