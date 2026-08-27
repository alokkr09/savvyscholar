import mongoose from 'mongoose';
import { Budget, IBudget } from '../models/Budget';
import { Expense } from '../models/Expense';
import { ApiError } from '../utils/apiError';
import { MoneyMath } from '../utils/money';

export interface CreateBudgetDto {
  category: string;
  amount: number;
  month?: string;
  alertThreshold?: number;
}

export class BudgetService {
  /**
   * Creates or updates a monthly budget for a specific category
   */
  static async upsert(userId: string, dto: CreateBudgetDto) {
    const month = dto.month || new Date().toISOString().substring(0, 7);
    const amount = MoneyMath.round(dto.amount);
    const alertThreshold = dto.alertThreshold || 80;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const budget = await Budget.findOneAndUpdate(
      {
        userId: userObjectId,
        category: dto.category,
        month,
      },
      {
        $set: {
          amount,
          alertThreshold,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return budget.toJSON();
  }

  /**
   * Retrieves all budgets for a given month with real-time computed spending metrics
   */
  static async listWithSpending(userId: string, targetMonth?: string) {
    const month = targetMonth || new Date().toISOString().substring(0, 7);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Calculate month boundary dates
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10) - 1; // 0-indexed month

    const startOfMonth = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, monthNum + 1, 0, 23, 59, 59, 999));

    // 1. Fetch all configured budgets for this month
    const budgets = await Budget.find({
      userId: userObjectId,
      month,
    }).lean();

    // 2. Aggregate actual expenses in this month grouped by category
    const expenseAggregates = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const expenseMap = new Map<string, { totalSpent: number; count: number }>();
    expenseAggregates.forEach((item) => {
      expenseMap.set(item._id, {
        totalSpent: MoneyMath.round(item.totalSpent),
        count: item.transactionCount,
      });
    });

    let totalAllocated = 0;
    let totalSpentInBudgets = 0;
    let totalRemaining = 0;

    const items = budgets.map((b) => {
      const expenseData = expenseMap.get(b.category) || { totalSpent: 0, count: 0 };
      const spent = expenseData.totalSpent;
      const allocated = MoneyMath.round(b.amount);
      const remaining = MoneyMath.subtract(allocated, spent);
      const percentage = MoneyMath.percentage(spent, allocated);
      const isExceeded = spent > allocated;
      const isNearThreshold = percentage >= (b.alertThreshold || 80);

      totalAllocated = MoneyMath.add(totalAllocated, allocated);
      totalSpentInBudgets = MoneyMath.add(totalSpentInBudgets, spent);

      return {
        _id: b._id,
        category: b.category,
        month: b.month,
        allocated,
        spent,
        remaining,
        percentage,
        alertThreshold: b.alertThreshold || 80,
        isExceeded,
        isNearThreshold,
        transactionCount: expenseData.count,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    totalRemaining = MoneyMath.subtract(totalAllocated, totalSpentInBudgets);
    const overallPercentage = MoneyMath.percentage(totalSpentInBudgets, totalAllocated);

    return {
      month,
      budgets: items,
      summary: {
        totalAllocated,
        totalSpent: totalSpentInBudgets,
        totalRemaining,
        overallPercentage,
        budgetCount: items.length,
        exceededCount: items.filter((b) => b.isExceeded).length,
      },
    };
  }

  /**
   * Updates an existing budget
   */
  static async update(userId: string, budgetId: string, updateData: { amount?: number; alertThreshold?: number }) {
    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      throw ApiError.badRequest('Invalid budget ID format.');
    }

    const payload: Record<string, any> = {};
    if (updateData.amount !== undefined) payload.amount = MoneyMath.round(updateData.amount);
    if (updateData.alertThreshold !== undefined) payload.alertThreshold = updateData.alertThreshold;

    const budget = await Budget.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(budgetId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!budget) {
      throw ApiError.notFound('Budget not found or unauthorized.');
    }

    return budget.toJSON();
  }

  /**
   * Deletes a budget entry
   */
  static async delete(userId: string, budgetId: string) {
    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      throw ApiError.badRequest('Invalid budget ID format.');
    }

    const result = await Budget.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(budgetId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!result) {
      throw ApiError.notFound('Budget not found or unauthorized.');
    }

    return { deletedId: budgetId, message: 'Budget deleted successfully.' };
  }
}
