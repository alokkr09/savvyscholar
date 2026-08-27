import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpDown,
  Download,
  Receipt,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { CategoryBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ExpenseModal } from '../components/expenses/ExpenseModal';
import { expenseApi } from '../services/expenseApi';
import { Expense, CreateExpensePayload, ExpenseCategory, PaymentMethod } from '../types/expense.types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/dates';
import { useToast } from '../context/ToastContext';

export const ExpensesPage: React.FC = () => {
  const { success, error } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await expenseApi.list({
        page,
        limit: 15,
        search: search.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        paymentMethod: selectedPayment !== 'all' ? selectedPayment : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      });

      setExpenses(res.expenses);
      setTotalPages(res.pagination.totalPages);
      setTotalSpent(res.summary.totalSpent);
      setTotalCount(res.summary.count);
    } catch (err: any) {
      error('Failed to load expenses', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedCategory, selectedPayment, startDate, endDate, sortBy, sortOrder, error]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Debounced search reset to page 1
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleSaveExpense = async (payload: CreateExpensePayload) => {
    if (editingExpense) {
      await expenseApi.update(editingExpense._id, payload);
      success('Expense Updated', `Updated "${payload.title}"`);
    } else {
      await expenseApi.create(payload);
      success('Expense Added', `Recorded ₹${payload.amount} for "${payload.title}"`);
    }
    fetchExpenses();
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpenseId) return;
    try {
      setIsDeleting(true);
      await expenseApi.delete(deletingExpenseId);
      success('Expense Deleted', 'The transaction has been removed.');
      setDeletingExpenseId(null);
      fetchExpenses();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedPayment('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    selectedCategory !== 'all' ||
    selectedPayment !== 'all' ||
    startDate ||
    endDate;

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  const paymentOptions = [
    { value: 'all', label: 'All Payment Methods' },
    ...PAYMENT_METHODS.map((p) => ({ value: p, label: p })),
  ];

  const sortOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'amount', label: 'Sort by Amount' },
    { value: 'title', label: 'Sort by Title' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Metric Pill */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Filtered Spending
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatINR(totalSpent)}
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              ({totalCount} {totalCount === 1 ? 'transaction' : 'transactions'})
            </span>
          </div>
        </div>

        <Button
          variant="brand"
          size="md"
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold shadow-md shadow-emerald-600/20"
        >
          Add Expense
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-4">
            <Input
              placeholder="Search expenses, tags..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="py-2 text-xs"
            />
          </div>

          {/* Category Dropdown */}
          <div className="lg:col-span-3">
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="py-2 text-xs"
            />
          </div>

          {/* Payment Method Dropdown */}
          <div className="lg:col-span-3">
            <Select
              options={paymentOptions}
              value={selectedPayment}
              onChange={(e) => {
                setSelectedPayment(e.target.value);
                setPage(1);
              }}
              className="py-2 text-xs"
            />
          </div>

          {/* Sort & Order Button */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              className="px-2.5 shrink-0"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Date Range & Clear Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 bg-white"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 bg-white"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </Card>

      {/* Expenses Table Card */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Receipt}
              title="No expenses found"
              description={
                hasActiveFilters
                  ? 'No transactions matched your current search filters. Try resetting the filters.'
                  : "You haven't logged any expenses yet. Start tracking your purchases to gain insights!"
              }
              actionText={hasActiveFilters ? 'Clear Filters' : 'Add First Expense'}
              onAction={
                hasActiveFilters
                  ? clearFilters
                  : () => {
                      setEditingExpense(null);
                      setIsModalOpen(true);
                    }
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Transaction</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-6">
                      <div>
                        <p className="font-bold text-slate-900">{expense.title}</p>
                        {expense.description && (
                          <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {expense.description}
                          </p>
                        )}
                        {expense.tags && expense.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {expense.tags.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CategoryBadge category={expense.category} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {expense.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-extrabold text-sm text-slate-900">
                        {formatINR(expense.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingExpense(expense);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingExpenseId(expense._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        mode={editingExpense ? 'edit' : 'create'}
        initialData={editingExpense}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
      />

      {/* Confirmation Dialog for Expense Deletion */}
      <ConfirmDialog
        isOpen={!!deletingExpenseId}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense transaction? This action will adjust your monthly budget and analytics."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeletingExpenseId(null)}
        onConfirm={handleDeleteExpense}
      />
    </div>
  );
};
