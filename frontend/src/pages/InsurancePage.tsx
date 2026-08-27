import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  Building,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { CardSkeleton } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { insuranceApi } from '../services/insuranceApi';
import {
  InsurancePolicy,
  CreateInsurancePayload,
  InsuranceType,
  InsuranceFrequency,
} from '../types/insurance.types';
import { INSURANCE_TYPES, INSURANCE_FREQUENCIES } from '../utils/constants';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/dates';
import { useToast } from '../context/ToastContext';

export const InsurancePage: React.FC = () => {
  const { success, error } = useToast();

  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [summary, setSummary] = useState({
    totalCoverage: 0,
    totalAnnualPremium: 0,
    totalPolicies: 0,
    activePolicies: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [policyName, setPolicyName] = useState('');
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyType, setPolicyType] = useState<InsuranceType>('Health Insurance');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [premiumFrequency, setPremiumFrequency] = useState<InsuranceFrequency>('Annually');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPolicies = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await insuranceApi.list();
      setPolicies(res.policies);
      setSummary(res.summary);
    } catch (err: any) {
      error('Failed to load insurance', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleOpenModal = (policyToEdit?: InsurancePolicy) => {
    if (policyToEdit) {
      setEditingPolicy(policyToEdit);
      setPolicyName(policyToEdit.policyName);
      setProvider(policyToEdit.provider);
      setPolicyNumber(policyToEdit.policyNumber);
      setPolicyType(policyToEdit.policyType);
      setPremiumAmount(policyToEdit.premiumAmount.toString());
      setPremiumFrequency(policyToEdit.premiumFrequency);
      setCoverageAmount(policyToEdit.coverageAmount.toString());
      setStartDate(
        policyToEdit.startDate
          ? new Date(policyToEdit.startDate).toISOString().substring(0, 10)
          : ''
      );
      setRenewalDate(new Date(policyToEdit.renewalDate).toISOString().substring(0, 10));
      setNotes(policyToEdit.notes || '');
    } else {
      setEditingPolicy(null);
      setPolicyName('');
      setProvider('');
      setPolicyNumber('');
      setPolicyType('Health Insurance');
      setPremiumAmount('');
      setPremiumFrequency('Annually');
      setCoverageAmount('');
      setStartDate('');
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setRenewalDate(nextYear.toISOString().substring(0, 10));
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    const premAmt = parseFloat(premiumAmount);
    const covAmt = parseFloat(coverageAmount);

    if (!policyName.trim() || !provider.trim() || !policyNumber.trim()) {
      error('Fields Required', 'Please fill in Policy Name, Provider, and Policy Number.');
      return;
    }
    if (premAmt < 0 || isNaN(premAmt)) {
      error('Invalid Premium', 'Premium amount cannot be negative.');
      return;
    }
    if (covAmt < 0 || isNaN(covAmt)) {
      error('Invalid Coverage', 'Coverage amount cannot be negative.');
      return;
    }
    if (!renewalDate) {
      error('Renewal Date Required', 'Please specify the policy renewal date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateInsurancePayload = {
        policyName: policyName.trim(),
        provider: provider.trim(),
        policyNumber: policyNumber.trim(),
        policyType,
        premiumAmount: premAmt,
        premiumFrequency,
        coverageAmount: covAmt,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        renewalDate: new Date(renewalDate).toISOString(),
        notes: notes.trim(),
      };

      if (editingPolicy) {
        await insuranceApi.update(editingPolicy._id, payload);
        success('Policy Updated', `Updated "${policyName}"`);
      } else {
        await insuranceApi.create(payload);
        success('Policy Added', `Added "${policyName}" to insurance tracking`);
      }

      setIsModalOpen(false);
      fetchPolicies();
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePolicy = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await insuranceApi.delete(deletingId);
      success('Policy Removed', 'Insurance policy removed.');
      setDeletingId(null);
      fetchPolicies();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const typeOptions = INSURANCE_TYPES.map((t) => ({ value: t, label: t }));
  const freqOptions = INSURANCE_FREQUENCIES.map((f) => ({ value: f, label: f }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Renewal Warning Banner (if any policies expiring soon) */}
      {summary.expiringSoonCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Insurance Renewal Alert</p>
            <p className="mt-0.5">
              You have {summary.expiringSoonCount} policy expiring in the next 30 days. Renew early
              to avoid lapses in coverage.
            </p>
          </div>
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Coverage Insured
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(summary.totalCoverage)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Health, device & term coverage
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Annual Premium Commitment
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(summary.totalAnnualPremium)}/yr
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Normalized annual cost
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Active Policies
          </span>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <p className="text-2xl font-black text-slate-900">
              {summary.activePolicies} / {summary.totalPolicies}
            </p>
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">
            Protected against risks
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Renewals Due Soon
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-6 h-6 text-amber-500" />
            <p className="text-2xl font-black text-slate-900">{summary.expiringSoonCount}</p>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Due within next 30 days
          </span>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-base font-extrabold text-slate-900">Your Protected Policies</h3>
        <Button
          variant="brand"
          size="md"
          onClick={() => handleOpenModal()}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold shadow-md shadow-emerald-600/20 w-full sm:w-auto"
        >
          Add Insurance Policy
        </Button>
      </div>

      {/* Policies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={3} />
        </div>
      ) : policies.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No insurance policies recorded yet"
          description="Keep track of your health, phone/laptop gadget protection, and vehicle insurance to stay stress-free."
          actionText="Add First Policy"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {policies.map((p) => (
            <Card
              key={p._id}
              className={`space-y-4 border-2 transition-all ${
                p.isExpiringSoon
                  ? 'border-amber-300 bg-amber-50/10'
                  : p.isExpired
                  ? 'border-rose-300 bg-rose-50/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {p.policyType}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1.5">{p.policyName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> {p.provider}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(p)}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                    title="Edit policy"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(p._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete policy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Policy Number Pill */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Policy #{p.policyNumber}</span>
              </div>

              {/* Coverage & Premium Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Coverage Sum
                  </span>
                  <span className="font-black text-slate-900">{formatINR(p.coverageAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Premium ({p.premiumFrequency})
                  </span>
                  <span className="font-black text-slate-900">{formatINR(p.premiumAmount)}</span>
                </div>
              </div>

              {/* Renewal Countdown Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Renewal: {formatDate(p.renewalDate)}</span>
                </div>

                {p.isExpired ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                    Expired
                  </span>
                ) : p.isExpiringSoon ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due in {p.daysUntilRenewal}d
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Policy Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPolicy ? 'Edit Insurance Policy' : 'Add Insurance Policy'}
        subtitle="Keep track of coverage amounts, premiums, and renewal dates"
        maxWidth="md"
      >
        <form onSubmit={handleSavePolicy} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Policy Name *"
              placeholder="e.g. Student Health Shield, iPhone Protect"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              autoFocus
            />

            <Input
              label="Provider Name *"
              placeholder="e.g. Star Health, HDFC ERGO, AppleCare"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Policy Number *"
              placeholder="e.g. POL-984210"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
            />

            <Select
              label="Policy Type *"
              options={typeOptions}
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value as InsuranceType)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Coverage Amount (₹) *"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 500000"
              prefixText="₹"
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(e.target.value)}
            />

            <Input
              label="Premium (₹) *"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 3500"
              prefixText="₹"
              value={premiumAmount}
              onChange={(e) => setPremiumAmount(e.target.value)}
            />

            <Select
              label="Frequency *"
              options={freqOptions}
              value={premiumFrequency}
              onChange={(e) => setPremiumFrequency(e.target.value as InsuranceFrequency)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date (Optional)"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Renewal Date *"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes / Emergency TPA Contact (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="TPA helpline, claims email, policy document link..."
              className="block w-full rounded-xl text-sm py-2.5 px-3.5 bg-white text-slate-900 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="brand" type="submit" isLoading={isSubmitting}>
              {editingPolicy ? 'Save Changes' : 'Save Policy'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        title="Remove Policy?"
        message="Are you sure you want to remove this insurance policy from tracking?"
        confirmText="Remove Policy"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeletePolicy}
      />
    </div>
  );
};
