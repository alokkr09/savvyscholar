import React, { useState, useEffect, useCallback } from 'react';
import {
  Umbrella,
  ShieldCheck,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { Spinner } from '../components/common/Loader';
import { emergencyApi } from '../services/emergencyApi';
import { EmergencyFundData, UpdateEmergencyFundPayload } from '../types/emergency.types';
import { formatINR } from '../utils/currency';
import { useToast } from '../context/ToastContext';

export const EmergencyFundPage: React.FC = () => {
  const { success, error } = useToast();

  const [fund, setFund] = useState<EmergencyFundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Contribution Modal State
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [targetMonths, setTargetMonths] = useState(6);
  const [monthlyExpenseBaseline, setMonthlyExpenseBaseline] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchEmergencyFund = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await emergencyApi.get();
      setFund(res.fund);
      setTargetMonths(res.fund.monthsOfExpensesTarget || 6);
      setMonthlyExpenseBaseline(res.fund.targetExpensesPerMonth?.toString() || '');
      setMonthlyContribution(res.fund.monthlyContribution?.toString() || '');
      setCustomTarget(res.fund.targetAmount?.toString() || '');
    } catch (err: any) {
      error('Failed to load emergency fund', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchEmergencyFund();
  }, [fetchEmergencyFund]);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(contributionAmount);
    if (!amountNum || amountNum <= 0) {
      error('Invalid Amount', 'Please enter a contribution amount greater than 0.');
      return;
    }

    try {
      setIsContributing(true);
      const res = await emergencyApi.contribute(amountNum);
      setFund(res.fund);
      success('Contribution Recorded', `Added ${formatINR(amountNum)} to your Emergency Cushion.`);
      setIsContributeModalOpen(false);
      setContributionAmount('');
    } catch (err: any) {
      error('Contribution Failed', err.message);
    } finally {
      setIsContributing(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      const payload: UpdateEmergencyFundPayload = {
        monthsOfExpensesTarget: targetMonths,
        targetExpensesPerMonth: monthlyExpenseBaseline ? parseFloat(monthlyExpenseBaseline) : 0,
        monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : 0,
        targetAmount: customTarget ? parseFloat(customTarget) : undefined,
      };

      const res = await emergencyApi.update(payload);
      setFund(res.fund);
      success('Settings Updated', 'Emergency fund parameters calibrated.');
      setIsSettingsModalOpen(false);
    } catch (err: any) {
      error('Update Failed', err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="lg" label="Computing survival runway..." />
      </div>
    );
  }

  if (!fund) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Hero Runway Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Umbrella className="w-4 h-4 text-emerald-400" />
              <span>Student Financial Shield</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Total Emergency Reserve Balance
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1">
                {formatINR(fund.currentAmount)}
              </h2>
            </div>

            {/* Visual Runway Meter */}
            <div className="space-y-2 max-w-xl">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold">
                  Funded: {fund.progressPercentage}% of {formatINR(fund.targetAmount)} Target
                </span>
                <span className="font-bold text-emerald-400">{fund.runwayMonths} Months Runway</span>
              </div>
              <div className="w-full bg-slate-700/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-600">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${fund.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 Months</span>
                <span>Target: {fund.monthsOfExpensesTarget} Months Cushion</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <Button
              variant="brand"
              size="lg"
              onClick={() => setIsContributeModalOpen(true)}
              leftIcon={<Plus className="w-5 h-5" />}
              className="font-bold shadow-lg shadow-emerald-600/30 w-full"
            >
              Add Contribution
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsSettingsModalOpen(true)}
              leftIcon={<Sliders className="w-4 h-4" />}
              className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Recalibrate Target
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Monthly Expense Baseline
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(fund.effectiveMonthlyExpense)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {fund.targetExpensesPerMonth > 0
              ? 'Configured budget baseline'
              : 'Computed from past 90 days'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Remaining to Target
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(fund.remainingToTarget)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Needed for complete {fund.monthsOfExpensesTarget}-month safety
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Monthly Contribution
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatINR(fund.monthlyContribution)}/mo
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Committed monthly savings
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Estimated Goal Arrival
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {fund.isFullyFunded
              ? 'Fully Funded 🎉'
              : fund.monthsToComplete
              ? `${fund.monthsToComplete} Months`
              : 'Set Contribution'}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {fund.isFullyFunded
              ? 'Complete safety achieved'
              : 'At current monthly addition rate'}
          </span>
        </div>
      </div>

      {/* Educational Guide Card */}
      <Card title="Why Every Student Needs an Emergency Cushion">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Prevent Sudden Debt</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Laptops break, medical emergencies happen, or stipends get delayed. An emergency
              fund prevents you from borrowing high-interest loans.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">The 3 to 6 Month Rule</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Financial experts recommend having at least 3 to 6 months of essential living
              expenses stored in an instant-access account (e.g. Savings or Liquid FD).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">Peace of Mind</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Knowing you have {fund.runwayMonths} months of survival runway lets you focus on your
              studies, internships, and career without constant money anxiety.
            </p>
          </div>
        </div>
      </Card>

      {/* Contribution Modal */}
      <Modal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        title="Add to Emergency Cushion"
        subtitle={`Current reserve balance: ${formatINR(fund.currentAmount)}`}
        maxWidth="sm"
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <Input
            label="Contribution Amount (₹) *"
            type="number"
            min="0.01"
            step="any"
            placeholder="e.g. 5000"
            prefixText="₹"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            autoFocus
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsContributeModalOpen(false)}
              disabled={isContributing}
            >
              Cancel
            </Button>
            <Button variant="brand" type="submit" isLoading={isContributing}>
              Record Contribution
            </Button>
          </div>
        </form>
      </Modal>

      {/* Recalibrate Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Recalibrate Emergency Cushion"
        subtitle="Fine-tune your safety runway target and baseline expenses"
        maxWidth="md"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Target Safety Runway: {targetMonths} Months
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    setTargetMonths(m);
                    const base = monthlyExpenseBaseline ? parseFloat(monthlyExpenseBaseline) : fund.effectiveMonthlyExpense;
                    setCustomTarget((base * m).toString());
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    targetMonths === m
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {m} Months
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monthly Living Expense Baseline (₹)"
              type="number"
              min="0"
              step="any"
              placeholder={`e.g. ${fund.effectiveMonthlyExpense}`}
              prefixText="₹"
              value={monthlyExpenseBaseline}
              onChange={(e) => {
                setMonthlyExpenseBaseline(e.target.value);
                if (e.target.value) {
                  setCustomTarget((parseFloat(e.target.value) * targetMonths).toString());
                }
              }}
            />

            <Input
              label="Target Fund Goal (₹)"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 60000"
              prefixText="₹"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
            />
          </div>

          <Input
            label="Target Monthly Contribution (₹)"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 5000"
            prefixText="₹"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            helperText="Used to estimate how many months until your fund is 100% complete"
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              disabled={isSavingSettings}
            >
              Cancel
            </Button>
            <Button variant="brand" type="submit" isLoading={isSavingSettings}>
              Save Target
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
