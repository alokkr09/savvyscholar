import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { CategoryBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { budgetApi } from '../services/budgetApi';
import { Budget, CreateBudgetPayload } from '../types/budget.types';
import { ExpenseCategory } from '../types/expense.types';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatINR } from '../utils/currency';
import { getCurrentMonthKey, getMonthLabel } from '../utils/dates';
import { useToast } from '../context/ToastContext';

export const BudgetsPage: React.FC = () => {
  const { success, error } = useToast();

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthKey);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState({
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentage: 0,
    budgetCount: 0,
    exceededCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [modalCategory, setModalCategory] = useState<ExpenseCategory>('Food & Dining');
  const [modalAmount, setModalAmount] = useState('');
  const [modalThreshold, setModalThreshold] = useState('80');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await budgetApi.list(currentMonth);
      setBudgets(res.budgets);
      setSummary(res.summary);
    } catch (err: any) {
      error('Failed to load budgets', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, error]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleMonthChange = (offset: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const newMonth = date.toISOString().substring(0, 7);
    setCurrentMonth(newMonth);
  };

  const handleOpenCreateModal = (categoryToEdit?: Budget) => {
    if (categoryToEdit) {
      setEditingBudget(categoryToEdit);
      setModalCategory(categoryToEdit.category);
      setModalAmount(categoryToEdit.allocated.toString());
      setModalThreshold(categoryToEdit.alertThreshold.toString());
    } else {
      setEditingBudget(null);
      // Find first unused category if possible
      const usedCategories = new Set(budgets.map((b) => b.category));
      const unused = EXPENSE_CATEGORIES.find((c) => !usedCategories.has(c)) || 'Food & Dining';
      setModalCategory(unused);
      setModalAmount('');
      setModalThreshold('80');
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(modalAmount);
    if (!amountNum || amountNum <= 0) {
      error('Invalid Amount', 'Please enter a budget amount greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await budgetApi.upsert({
        category: modalCategory,
        amount: amountNum,
        month: currentMonth,
        alertThreshold: parseInt(modalThreshold, 10) || 80,
      });

      success('Budget Saved', `Budget set for ${modalCategory} in ${getMonthLabel(currentMonth)}`);
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err: any) {
      error('Failed to save budget', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!deletingBudgetId) return;
    try {
      setIsDeleting(true);
      await budgetApi.delete(deletingBudgetId);
      success('Budget Deleted', 'Category budget removed for this month.');
      setDeletingBudgetId(null);
      fetchBudgets();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({
    value: c,
    label: c,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Month Navigator Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-extrabold text-slate-800 tracking-tight">
              {getMonthLabel(currentMonth)}
            </span>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setCurrentMonth(getCurrentMonthKey())}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            This Month
          </button>
        </div>

        <Button
          variant="brand"
          size="md"
          onClick={() => handleOpenCreateModal()}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold shadow-md shadow-emerald-600/20"
        >
          Set Category Budget
        </Button>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Allocated
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(summary.totalAllocated)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Across {summary.budgetCount} categories
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Actual Spent
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(summary.totalSpent)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            In budgeted categories
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Remaining Buffer
          </span>
          <p
            className={`text-2xl font-black mt-1 ${
              summary.totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatINR(summary.totalRemaining)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {summary.totalRemaining >= 0 ? 'Safe unspent margin' : 'Over budget overall!'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Utilization Rate
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.overallPercentage}%</p>
          <span className="text-xs font-semibold mt-0.5 block">
            {summary.exceededCount > 0 ? (
              <span className="text-rose-600">{summary.exceededCount} categories exceeded!</span>
            ) : (
              <span className="text-emerald-600">All limits under control</span>
            )}
          </span>
        </div>
      </div>

      {/* Budgets List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={6} />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No budgets configured for this month"
          description={`Take control of your spending in ${getMonthLabel(
            currentMonth
          )} by setting targeted limits for Food, Transport, and Academics.`}
          actionText="Create Category Budget"
          onAction={() => handleOpenCreateModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <Card
              key={b._id}
              className={`space-y-4 border-2 transition-all ${
                b.isExceeded
                  ? 'border-rose-300 bg-rose-50/10'
                  : b.isNearThreshold
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <CategoryBadge category={b.category} />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenCreateModal(b)}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Edit budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingBudgetId(b._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress & Values */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Spent: {formatINR(b.spent)}</span>
                  <span className="text-xs font-bold text-slate-900">
                    Budget: {formatINR(b.allocated)}
                  </span>
                </div>

                <ProgressBar
                  value={b.percentage}
                  colorScheme="auto"
                  size="md"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-extrabold text-slate-900">{b.percentage}% Used</span>
                  <span
                    className={`font-extrabold ${
                      b.remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {b.remaining >= 0
                      ? `${formatINR(b.remaining)} left`
                      : `${formatINR(Math.abs(b.remaining))} over limit!`}
                  </span>
                </div>
              </div>

              {/* Threshold Warning Pill */}
              {b.isExceeded ? (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Budget exceeded by {formatINR(Math.abs(b.remaining))}</span>
                </div>
              ) : b.isNearThreshold ? (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Approaching threshold ({b.alertThreshold}%)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{b.transactionCount} transactions recorded this month</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Set Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Monthly Budget' : 'Set Category Budget'}
        subtitle={`Configure spending limits for ${getMonthLabel(currentMonth)}`}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <Select
            label="Category *"
            options={categoryOptions}
            value={modalCategory}
            disabled={!!editingBudget}
            onChange={(e) => setModalCategory(e.target.value as ExpenseCategory)}
          />

          <Input
            label="Monthly Limit (₹) *"
            type="number"
            min="1"
            step="any"
            placeholder="e.g. 5000"
            prefixText="₹"
            value={modalAmount}
            onChange={(e) => setModalAmount(e.target.value)}
            autoFocus
          />

          <Input
            label="Alert Threshold (%)"
            type="number"
            min="1"
            max="100"
            step="1"
            value={modalThreshold}
            onChange={(e) => setModalThreshold(e.target.value)}
            helperText="We will alert you when you reach this percentage of your budget"
          />

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
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingBudgetId}
        title="Remove Budget?"
        message="Are you sure you want to remove this category budget? Past expense transactions will not be deleted."
        confirmText="Remove"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeletingBudgetId(null)}
        onConfirm={handleDeleteBudget}
      />
    </div>
  );
};
