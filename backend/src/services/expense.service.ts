import mongoose from 'mongoose';
import { Expense, IExpense } from '../models/Expense';
import { ApiError } from '../utils/apiError';
import { MoneyMath } from '../utils/money';

export interface CreateExpenseDto {
  title: string;
  amount: number;
  category: string;
  description?: string;
  date?: string | Date;
  paymentMethod?: string;
  tags?: string[];
}

export interface ExpenseQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ExpenseService {
  /**
   * Creates a new expense entry linked to the authenticated user
   */
  static async create(userId: string, dto: CreateExpenseDto) {
    const expense = await Expense.create({
      userId: new mongoose.Types.ObjectId(userId),
      title: dto.title.trim(),
      amount: MoneyMath.round(dto.amount),
      category: dto.category,
      description: dto.description?.trim() || '',
      date: dto.date ? new Date(dto.date) : new Date(),
      paymentMethod: dto.paymentMethod || 'UPI',
      tags: dto.tags || [],
    });

    return expense.toJSON();
  }

  /**
   * Retrieves paginated, filtered expenses belonging to the user
   */
  static async list(userId: string, filters: ExpenseQueryFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const query: Record<string, any> = { userId: userObjectId };

    // Filter by Category
    if (filters.category && filters.category !== 'all') {
      query.category = filters.category;
    }

    // Filter by Payment Method
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      query.paymentMethod = filters.paymentMethod;
    }

    // Filter by Date Range
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Text search on title, description, or tags
    if (filters.search && filters.search.trim() !== '') {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const sortField = filters.sortBy || 'date';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [expenses, totalCount, aggregateSum] = await Promise.all([
      Expense.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Expense.countDocuments(query),
      Expense.aggregate([
        { $match: query },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
      ]),
    ]);

    const totalSpent = aggregateSum.length > 0 ? MoneyMath.round(aggregateSum[0].totalSpent) : 0;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      expenses,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      summary: {
        totalSpent,
        count: totalCount,
      },
    };
  }

  /**
   * Retrieves single expense by ID, strictly checking user ownership
   */
  static async getById(userId: string, expenseId: string) {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      throw ApiError.badRequest('Invalid expense ID format.');
    }

    const expense = await Expense.findOne({
      _id: new mongoose.Types.ObjectId(expenseId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found or unauthorized.');
    }

    return expense.toJSON();
  }

  /**
   * Updates an existing expense, ensuring user authorization
   */
  static async update(userId: string, expenseId: string, dto: Partial<CreateExpenseDto>) {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      throw ApiError.badRequest('Invalid expense ID format.');
    }

    const updatePayload: Record<string, any> = { ...dto };
    if (updatePayload.amount !== undefined) {
      updatePayload.amount = MoneyMath.round(updatePayload.amount);
    }
    if (updatePayload.date) {
      updatePayload.date = new Date(updatePayload.date);
    }

    const expense = await Expense.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(expenseId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!expense) {
      throw ApiError.notFound('Expense not found or unauthorized.');
    }

    return expense.toJSON();
  }

  /**
   * Deletes an expense with strict ownership verification
   */
  static async delete(userId: string, expenseId: string) {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      throw ApiError.badRequest('Invalid expense ID format.');
    }

    const result = await Expense.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(expenseId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!result) {
      throw ApiError.notFound('Expense not found or unauthorized.');
    }

    return { deletedId: expenseId, message: 'Expense deleted successfully.' };
  }

  /**
   * Computes category breakdown for analytics & budgets
   */
  static async getCategoryBreakdown(userId: string, startDate?: Date, endDate?: Date) {
    const match: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = startDate;
      if (endDate) match.date.$lte = endDate;
    }

    const breakdown = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const grandTotal = breakdown.reduce((sum, item) => sum + item.totalAmount, 0);

    return breakdown.map((item) => ({
      category: item._id,
      totalAmount: MoneyMath.round(item.totalAmount),
      count: item.count,
      percentage: MoneyMath.percentage(item.totalAmount, grandTotal),
    }));
  }
}
