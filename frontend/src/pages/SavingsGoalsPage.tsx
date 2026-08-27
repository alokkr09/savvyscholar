import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Plus,
  Target,
  PiggyBank,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Trophy,
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
import { savingsApi } from '../services/savingsApi';
import {
  SavingsGoal,
  CreateGoalPayload,
  SavingsGoalCategory,
  SavingsGoalStatus,
} from '../types/savings.types';
import { SAVINGS_GOAL_CATEGORIES } from '../utils/constants';
import { formatINR } from '../utils/currency';
import { formatDate, formatRelativeDate } from '../utils/dates';
import { useToast } from '../context/ToastContext';

export const SavingsGoalsPage: React.FC = () => {
  const { success, error } = useToast();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [summary, setSummary] = useState({
    totalTarget: 0,
    totalSaved: 0,
    totalRemaining: 0,
    overallPercentage: 0,
    totalGoals: 0,
    achievedGoals: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<SavingsGoalCategory>('Gadgets & Tech');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deposit / Withdraw Modal State
  const [transactingGoal, setTransactingGoal] = useState<SavingsGoal | null>(null);
  const [transactAmount, setTransactAmount] = useState('');
  const [transactType, setTransactType] = useState<'deposit' | 'withdraw'>('deposit');
  const [isTransacting, setIsTransacting] = useState(false);

  // Delete Confirm
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await savingsApi.list(selectedStatus);
      setGoals(res.goals);
      setSummary(res.summary);
    } catch (err: any) {
      error('Failed to load goals', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, error]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenModal = (goalToEdit?: SavingsGoal) => {
    if (goalToEdit) {
      setEditingGoal(goalToEdit);
      setTitle(goalToEdit.title);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setTargetDate(
        goalToEdit.targetDate ? new Date(goalToEdit.targetDate).toISOString().substring(0, 10) : ''
      );
      setCategory(goalToEdit.category);
      setNotes(goalToEdit.notes || '');
    } else {
      setEditingGoal(null);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      setCategory('Gadgets & Tech');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    if (!title.trim()) {
      error('Title Required', 'Please enter a goal title.');
      return;
    }
    if (!targetNum || targetNum <= 0) {
      error('Invalid Target', 'Please enter a target amount greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateGoalPayload = {
        title: title.trim(),
        targetAmount: targetNum,
        currentAmount: parseFloat(currentAmount) || 0,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
        category,
        notes: notes.trim(),
      };

      if (editingGoal) {
        await savingsApi.update(editingGoal._id, payload);
        success('Goal Updated', `Updated "${title}"`);
      } else {
        await savingsApi.create(payload);
        success('Goal Created', `New goal "${title}" established!`);
      }

      setIsModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactingGoal) return;
    const amountNum = parseFloat(transactAmount);
    if (!amountNum || amountNum <= 0) {
      error('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    try {
      setIsTransacting(true);
      const res = await savingsApi.transact(transactingGoal._id, amountNum, transactType);

      if (res.goal.isAchieved && transactType === 'deposit') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        success('🎉 Milestone Achieved!', `Congratulations! You achieved your "${transactingGoal.title}" goal!`);
      } else {
        success(
          transactType === 'deposit' ? 'Deposit Recorded' : 'Withdrawal Recorded',
          `Successfully ${transactType === 'deposit' ? 'added' : 'withdrew'} ₹${amountNum}`
        );
      }

      setTransactingGoal(null);
      setTransactAmount('');
      fetchGoals();
    } catch (err: any) {
      error('Transaction Failed', err.message);
    } finally {
      setIsTransacting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoalId) return;
    try {
      setIsDeleting(true);
      await savingsApi.delete(deletingGoalId);
      success('Goal Deleted', 'Savings goal has been removed.');
      setDeletingGoalId(null);
      fetchGoals();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryOptions = SAVINGS_GOAL_CATEGORIES.map((c) => ({
    value: c,
    label: c,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Target
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(summary.totalTarget)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Across {summary.totalGoals} active milestones
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Saved So Far
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatINR(summary.totalSaved)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {summary.overallPercentage}% total completion
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Remaining Target
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(summary.totalRemaining)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Needed to reach all goals
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Goals Achieved
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Trophy className="w-6 h-6 text-amber-500" />
            <p className="text-2xl font-black text-slate-900">
              {summary.achievedGoals} / {summary.totalGoals}
            </p>
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">
            Keep crushing your milestones!
          </span>
        </div>
      </div>

      {/* Action Bar & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'in_progress', 'achieved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                selectedStatus === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <Button
          variant="brand"
          size="md"
          onClick={() => handleOpenModal()}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold shadow-md shadow-emerald-600/20 w-full sm:w-auto"
        >
          Create New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={6} />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No savings goals found"
          description="Whether you are saving for a new laptop, semester tuition, or a vacation, establish a target to stay on track."
          actionText="Create First Goal"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <Card
              key={goal._id}
              className={`space-y-4 border-2 transition-all ${
                goal.isAchieved
                  ? 'border-emerald-300 bg-emerald-50/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {goal.category}
                    </span>
                    {goal.isAchieved && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Achieved
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1.5">{goal.title}</h4>
                  {goal.notes && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{goal.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(goal)}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                    title="Edit goal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingGoalId(goal._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Metric Numbers */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-extrabold text-slate-900">
                    {formatINR(goal.currentAmount)}
                  </span>
                  <span className="text-slate-500 font-semibold">
                    Target: {formatINR(goal.targetAmount)}
                  </span>
                </div>

                <ProgressBar
                  value={goal.percentage}
                  colorScheme={goal.isAchieved ? 'emerald' : 'indigo'}
                  size="md"
                />

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{goal.percentage}% saved</span>
                  <span className="text-slate-500 font-medium">
                    {goal.isAchieved ? 'Target Met!' : `${formatINR(goal.remainingAmount)} remaining`}
                  </span>
                </div>
              </div>

              {/* Target Date Pill & Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {goal.targetDate ? formatRelativeDate(goal.targetDate) : 'No deadline'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTransactingGoal(goal);
                      setTransactType('deposit');
                      setTransactAmount('');
                    }}
                    leftIcon={<ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
                    className="text-xs py-1"
                  >
                    Deposit
                  </Button>
                  {goal.currentAmount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTransactingGoal(goal);
                        setTransactType('withdraw');
                        setTransactAmount('');
                      }}
                      leftIcon={<ArrowDownLeft className="w-3.5 h-3.5 text-rose-600" />}
                      className="text-xs py-1 px-2"
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
        subtitle="Define target amount and target milestone date"
        maxWidth="md"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Goal Title *"
            placeholder="e.g. MacBook Pro, GRE Exam Fee, Goa Trip"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Amount (₹) *"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 60000"
              prefixText="₹"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />

            <Input
              label="Initial Amount Saved (₹)"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              prefixText="₹"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value as SavingsGoalCategory)}
            />

            <Input
              label="Target Date (Optional)"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes / Motivation (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why are you saving for this? Any specifics..."
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
              {editingGoal ? 'Save Changes' : 'Establish Goal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deposit / Withdraw Transaction Modal */}
      <Modal
        isOpen={!!transactingGoal}
        onClose={() => setTransactingGoal(null)}
        title={
          transactType === 'deposit'
            ? `Add Funds to "${transactingGoal?.title}"`
            : `Withdraw from "${transactingGoal?.title}"`
        }
        subtitle={`Current saved balance: ${formatINR(transactingGoal?.currentAmount)}`}
        maxWidth="sm"
      >
        <form onSubmit={handleProcessTransaction} className="space-y-4">
          <Input
            label={`Amount to ${transactType === 'deposit' ? 'Deposit' : 'Withdraw'} (₹) *`}
            type="number"
            min="0.01"
            step="any"
            placeholder="e.g. 2000"
            prefixText="₹"
            value={transactAmount}
            onChange={(e) => setTransactAmount(e.target.value)}
            autoFocus
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setTransactingGoal(null)}
              disabled={isTransacting}
            >
              Cancel
            </Button>
            <Button
              variant={transactType === 'deposit' ? 'brand' : 'danger'}
              type="submit"
              isLoading={isTransacting}
            >
              {transactType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGoalId}
        title="Delete Savings Goal?"
        message="Are you sure you want to delete this goal? All recorded progress on this milestone will be removed."
        confirmText="Delete Goal"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleDeleteGoal}
      />
    </div>
  );
};
