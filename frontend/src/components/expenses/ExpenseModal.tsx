import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Expense, CreateExpensePayload, ExpenseCategory, PaymentMethod } from '../../types/expense.types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpensePayload) => Promise<void>;
  initialData?: Expense | null;
  mode?: 'create' | 'edit';
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { error: toastError } = useToast();

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setPaymentMethod(initialData.paymentMethod);
      setDate(new Date(initialData.date).toISOString().substring(0, 10));
      setDescription(initialData.description || '');
      setTagsInput(initialData.tags?.join(', ') || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food & Dining');
      setPaymentMethod('UPI');
      setDate(new Date().toISOString().substring(0, 10));
      setDescription('');
      setTagsInput('');
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Expense title is required';
    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onSubmit({
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        paymentMethod,
        date: new Date(date).toISOString(),
        description: description.trim(),
        tags,
      });

      onClose();
    } catch (err: any) {
      toastError('Save Failed', err.message || 'Could not save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const paymentOptions = PAYMENT_METHODS.map((method) => ({
    value: method,
    label: method,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Expense' : 'Add New Expense'}
      subtitle={
        mode === 'edit'
          ? 'Update the details of this transaction'
          : 'Record a new student expense or purchase'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Expense Title *"
          placeholder="e.g. Canteen Lunch, Textbooks, Metro Card"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (₹) *"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            prefixText="₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
          />

          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category *"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          />

          <Select
            label="Payment Method *"
            options={paymentOptions}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description / Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, restaurant name, or reason..."
            className="block w-full rounded-xl text-sm py-2.5 px-3.5 bg-white text-slate-900 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-400"
          />
        </div>

        <Input
          label="Tags (Optional, comma separated)"
          placeholder="e.g. project, coffee, hostel"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          helperText="Use tags to organize and search expenses easily"
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="brand" type="submit" isLoading={isSubmitting}>
            {mode === 'edit' ? 'Save Changes' : 'Record Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
