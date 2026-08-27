import React, { useState } from 'react';
import {
  User,
  Mail,
  Wallet,
  Lock,
  ShieldCheck,
  LogOut,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { success, error } = useToast();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome?.toString() || '0');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Name Required', 'Please enter your name.');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      await updateProfile({
        name: name.trim(),
        monthlyIncome: parseFloat(monthlyIncome) || 0,
        currency,
      });
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error('Password Required', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      error('Password Too Short', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Mismatch', 'New passwords do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsChangingPass(false);
    }
  };

  const currencyOptions = [
    { value: 'INR', label: 'INR (₹) - Indian Rupee' },
    { value: 'USD', label: 'USD ($) - US Dollar' },
    { value: 'EUR', label: 'EUR (€) - Euro' },
    { value: 'GBP', label: 'GBP (£) - British Pound' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-extrabold text-2xl uppercase shadow-lg shadow-emerald-600/20">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{user?.name || 'Scholar'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold mt-2 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Student Account Active
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors border border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details & Financial Baseline */}
        <Card title="Financial Profile Settings" subtitle="Configure baseline parameters">
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  disabled
                  value={user?.email || ''}
                  className="block w-full rounded-xl text-sm pl-10 py-2.5 bg-slate-50 text-slate-500 border border-slate-200 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Email cannot be modified.</p>
            </div>

            <Input
              label="Estimated Monthly Income / Pocket Money (₹)"
              type="number"
              min="0"
              step="500"
              prefixText="₹"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              helperText="Used to calculate your savings rate and runway"
            />

            <Select
              label="Preferred Currency"
              options={currencyOptions}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />

            <div className="pt-2">
              <Button variant="brand" type="submit" isLoading={isUpdatingProfile} fullWidth>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Security & Password */}
        <Card title="Security & Credentials" subtitle="Update your account password">
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Min 6 chars with letters & numbers"
              leftIcon={<Lock className="w-4 h-4" />}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              leftIcon={<Lock className="w-4 h-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button variant="primary" type="submit" isLoading={isChangingPass} fullWidth>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
