import mongoose from 'mongoose';
import { SavingsGoal, ISavingsGoal } from '../models/SavingsGoal';
import { ApiError } from '../utils/apiError';
import { MoneyMath } from '../utils/money';

export interface CreateSavingsGoalDto {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string | Date;
  category?: string;
  status?: string;
  notes?: string;
}

export class SavingsGoalService {
  /**
   * Creates a new savings goal
   */
  static async create(userId: string, dto: CreateSavingsGoalDto) {
    const targetAmount = MoneyMath.round(dto.targetAmount);
    const currentAmount = MoneyMath.round(dto.currentAmount || 0);
    const status = currentAmount >= targetAmount ? 'achieved' : dto.status || 'in_progress';

    const goal = await SavingsGoal.create({
      userId: new mongoose.Types.ObjectId(userId),
      title: dto.title.trim(),
      targetAmount,
      currentAmount,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      category: dto.category || 'Other',
      status,
      notes: dto.notes?.trim() || '',
    });

    return goal.toJSON();
  }

  /**
   * Lists savings goals with calculated progress metrics
   */
  static async list(userId: string, status?: string) {
    const query: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const rawGoals = await SavingsGoal.find(query).sort({ createdAt: -1 }).lean();

    let totalTarget = 0;
    let totalSaved = 0;

    const goals = rawGoals.map((g) => {
      const target = MoneyMath.round(g.targetAmount);
      const current = MoneyMath.round(g.currentAmount);
      const remaining = Math.max(0, MoneyMath.subtract(target, current));
      const percentage = MoneyMath.percentage(current, target);
      const isAchieved = current >= target;

      totalTarget = MoneyMath.add(totalTarget, target);
      totalSaved = MoneyMath.add(totalSaved, current);

      return {
        ...g,
        targetAmount: target,
        currentAmount: current,
        remainingAmount: remaining,
        percentage: Math.min(100, percentage),
        isAchieved,
      };
    });

    const overallPercentage = MoneyMath.percentage(totalSaved, totalTarget);

    return {
      goals,
      summary: {
        totalTarget,
        totalSaved,
        totalRemaining: Math.max(0, MoneyMath.subtract(totalTarget, totalSaved)),
        overallPercentage: Math.min(100, overallPercentage),
        totalGoals: goals.length,
        achievedGoals: goals.filter((g) => g.isAchieved).length,
      },
    };
  }

  /**
   * Retrieves single savings goal
   */
  static async getById(userId: string, goalId: string) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw ApiError.badRequest('Invalid goal ID format.');
    }

    const goal = await SavingsGoal.findOne({
      _id: new mongoose.Types.ObjectId(goalId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!goal) {
      throw ApiError.notFound('Savings goal not found or unauthorized.');
    }

    const target = MoneyMath.round(goal.targetAmount);
    const current = MoneyMath.round(goal.currentAmount);
    const remaining = Math.max(0, MoneyMath.subtract(target, current));
    const percentage = Math.min(100, MoneyMath.percentage(current, target));

    return {
      ...goal.toJSON(),
      remainingAmount: remaining,
      percentage,
      isAchieved: current >= target,
    };
  }

  /**
   * Updates savings goal properties
   */
  static async update(userId: string, goalId: string, dto: Partial<CreateSavingsGoalDto>) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw ApiError.badRequest('Invalid goal ID format.');
    }

    const existing = await SavingsGoal.findOne({
      _id: new mongoose.Types.ObjectId(goalId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!existing) {
      throw ApiError.notFound('Savings goal not found or unauthorized.');
    }

    if (dto.title !== undefined) existing.title = dto.title.trim();
    if (dto.targetAmount !== undefined) existing.targetAmount = MoneyMath.round(dto.targetAmount);
    if (dto.currentAmount !== undefined) existing.currentAmount = MoneyMath.round(dto.currentAmount);
    if (dto.category !== undefined) existing.category = dto.category as any;
    if (dto.targetDate !== undefined) existing.targetDate = dto.targetDate ? new Date(dto.targetDate) : undefined;
    if (dto.notes !== undefined) existing.notes = dto.notes;

    // Auto-update status based on amount
    if (existing.currentAmount >= existing.targetAmount) {
      existing.status = 'achieved';
    } else if (dto.status) {
      existing.status = dto.status as any;
    } else if (existing.status === 'achieved') {
      existing.status = 'in_progress';
    }

    await existing.save();
    return existing.toJSON();
  }

  /**
   * Processes a deposit or withdrawal against a savings goal
   */
  static async processTransaction(
    userId: string,
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw'
  ) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw ApiError.badRequest('Invalid goal ID format.');
    }

    const roundedAmount = MoneyMath.round(amount);
    if (roundedAmount <= 0) {
      throw ApiError.badRequest('Transaction amount must be greater than zero.');
    }

    const goal = await SavingsGoal.findOne({
      _id: new mongoose.Types.ObjectId(goalId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!goal) {
      throw ApiError.notFound('Savings goal not found or unauthorized.');
    }

    if (type === 'withdraw') {
      if (roundedAmount > goal.currentAmount) {
        throw ApiError.badRequest(
          `Cannot withdraw ₹${roundedAmount}. Current saved amount is only ₹${goal.currentAmount}.`
        );
      }
      goal.currentAmount = MoneyMath.subtract(goal.currentAmount, roundedAmount);
      if (goal.currentAmount < goal.targetAmount && goal.status === 'achieved') {
        goal.status = 'in_progress';
      }
    } else {
      goal.currentAmount = MoneyMath.add(goal.currentAmount, roundedAmount);
      if (goal.currentAmount >= goal.targetAmount) {
        goal.status = 'achieved';
      }
    }

    await goal.save();
    return goal.toJSON();
  }

  /**
   * Deletes a savings goal
   */
  static async delete(userId: string, goalId: string) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw ApiError.badRequest('Invalid goal ID format.');
    }

    const result = await SavingsGoal.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(goalId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!result) {
      throw ApiError.notFound('Savings goal not found or unauthorized.');
    }

    return { deletedId: goalId, message: 'Savings goal deleted successfully.' };
  }
}
