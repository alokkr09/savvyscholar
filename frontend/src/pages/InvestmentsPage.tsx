import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  PieChart,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { CardSkeleton } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { investmentApi } from '../services/investmentApi';
import {
  Investment,
  CreateInvestmentPayload,
  InvestmentType,
  AssetAllocation,
} from '../types/investment.types';
import { INVESTMENT_TYPES } from '../utils/constants';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/dates';
import { useToast } from '../context/ToastContext';

export const InvestmentsPage: React.FC = () => {
  const { success, error } = useToast();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [allocation, setAllocation] = useState<AssetAllocation[]>([]);
  const [summary, setSummary] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    totalReturnPercentage: 0,
    isPositive: true,
    assetCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Investment | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<InvestmentType>('Mutual Funds');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInvestments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await investmentApi.list();
      setInvestments(res.investments);
      setSummary(res.summary);
      setAllocation(res.allocation);
    } catch (err: any) {
      error('Failed to load portfolio', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleOpenModal = (itemToEdit?: Investment) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setTitle(itemToEdit.title);
      setType(itemToEdit.type);
      setInvestedAmount(itemToEdit.investedAmount.toString());
      setCurrentValue(itemToEdit.currentValue.toString());
      setPurchaseDate(new Date(itemToEdit.purchaseDate).toISOString().substring(0, 10));
      setNotes(itemToEdit.notes || '');
    } else {
      setEditingItem(null);
      setTitle('');
      setType('Mutual Funds');
      setInvestedAmount('');
      setCurrentValue('');
      setPurchaseDate(new Date().toISOString().substring(0, 10));
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSaveInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    const invAmt = parseFloat(investedAmount);
    const curVal = parseFloat(currentValue);

    if (!title.trim()) {
      error('Title Required', 'Please provide an asset title.');
      return;
    }
    if (!invAmt || invAmt <= 0) {
      error('Invalid Invested Amount', 'Invested amount must be greater than 0.');
      return;
    }
    if (curVal < 0 || isNaN(curVal)) {
      error('Invalid Current Value', 'Current value cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateInvestmentPayload = {
        title: title.trim(),
        type,
        investedAmount: invAmt,
        currentValue: curVal,
        purchaseDate: new Date(purchaseDate).toISOString(),
        notes: notes.trim(),
      };

      if (editingItem) {
        await investmentApi.update(editingItem._id, payload);
        success('Asset Updated', `Updated "${title}"`);
      } else {
        await investmentApi.create(payload);
        success('Asset Added', `Recorded "${title}" in portfolio`);
      }

      setIsModalOpen(false);
      fetchInvestments();
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvestment = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await investmentApi.delete(deletingId);
      success('Asset Removed', 'Investment asset removed from portfolio.');
      setDeletingId(null);
      fetchInvestments();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const typeOptions = INVESTMENT_TYPES.map((t) => ({
    value: t,
    label: t,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Disclaimer Banner */}
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
        <p className="leading-relaxed">
          <span className="font-bold">Personal Portfolio Tracking:</span> Record your manual cost
          basis and current asset values for personal net worth calculations.
        </p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Invested Capital
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(summary.totalInvested)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Across {summary.assetCount} holdings
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Current Valuation
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(summary.totalCurrentValue)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Updated asset value
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Net Gain / Loss
          </span>
          <p
            className={`text-2xl font-black mt-1 ${
              summary.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {summary.isPositive ? '+' : ''}
            {formatINR(summary.totalGainLoss)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Absolute portfolio change
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Overall ROI
          </span>
          <div className="flex items-center gap-2 mt-1">
            {summary.isPositive ? (
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-rose-600" />
            )}
            <p
              className={`text-2xl font-black ${
                summary.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {summary.totalReturnPercentage}%
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Return on investment
          </span>
        </div>
      </div>

      {/* Asset Allocation & Top Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-base font-extrabold text-slate-900">Your Portfolio Holdings</h3>
        <Button
          variant="brand"
          size="md"
          onClick={() => handleOpenModal()}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold shadow-md shadow-emerald-600/20 w-full sm:w-auto"
        >
          Add Asset
        </Button>
      </div>

      {/* Holdings List & Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Cards (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <CardSkeleton count={3} />
          ) : investments.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No investment assets tracked yet"
              description="Record your mutual funds, recurring deposits (RD), crypto, or gold to track your growing net worth."
              actionText="Add First Investment"
              onAction={() => handleOpenModal()}
            />
          ) : (
            investments.map((item) => (
              <Card key={item._id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                      {item.type}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Acquired {formatDate(item.purchaseDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                      title="Edit asset"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Invested
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {formatINR(item.investedAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Current Value
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {formatINR(item.currentValue)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Gain / Return
                    </span>
                    <span
                      className={`font-extrabold ${
                        item.isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {item.isPositive ? '+' : ''}
                      {formatINR(item.gainLoss)} ({item.gainLossPercentage}%)
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.notes}
                  </p>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Asset Allocation Breakdown (1 Col) */}
        <div>
          <Card title="Asset Allocation" subtitle="Portfolio diversity breakdown">
            {allocation.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No assets to calculate.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {allocation.map((a) => (
                  <div key={a.type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{a.type}</span>
                      <span>
                        {formatINR(a.value)}{' '}
                        <span className="text-slate-400 font-normal">({a.percentage}%)</span>
                      </span>
                    </div>
                    <ProgressBar value={a.percentage} colorScheme="indigo" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add / Edit Investment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Investment Asset' : 'Add Investment Asset'}
        subtitle="Track personal holdings and current portfolio values"
        maxWidth="md"
      >
        <form onSubmit={handleSaveInvestment} className="space-y-4">
          <Input
            label="Asset Title *"
            placeholder="e.g. Nifty 50 Index Fund, SBI Fixed Deposit, Sovereign Gold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <Select
            label="Investment Asset Type *"
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as InvestmentType)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Invested Amount (₹) *"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 10000"
              prefixText="₹"
              value={investedAmount}
              onChange={(e) => setInvestedAmount(e.target.value)}
            />

            <Input
              label="Current Valuation (₹) *"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 12500"
              prefixText="₹"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
            />
          </div>

          <Input
            label="Purchase / Start Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Folio number, maturity date, monthly SIP date..."
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
              {editingItem ? 'Save Changes' : 'Add to Portfolio'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        title="Remove Asset?"
        message="Are you sure you want to remove this investment asset from your portfolio tracking?"
        confirmText="Remove Asset"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteInvestment}
      />
    </div>
  );
};
