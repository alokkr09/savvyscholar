import mongoose from 'mongoose';
import { EmergencyFund, IEmergencyFund } from '../models/EmergencyFund';
import { Expense } from '../models/Expense';
import { ApiError } from '../utils/apiError';
import { MoneyMath } from '../utils/money';

export interface UpdateEmergencyFundDto {
  targetAmount?: number;
  currentAmount?: number;
  monthlyContribution?: number;
  monthsOfExpensesTarget?: number;
  targetExpensesPerMonth?: number;
  notes?: string;
}

export class EmergencyFundService {
  /**
   * Retrieves or initializes emergency fund intelligence
   */
  static async get(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let fund = await EmergencyFund.findOne({ userId: userObjectId });

    if (!fund) {
      fund = await EmergencyFund.create({
        userId: userObjectId,
        targetAmount: 60000,
        currentAmount: 0,
        monthlyContribution: 5000,
        monthsOfExpensesTarget: 6,
        targetExpensesPerMonth: 10000,
      });
    }

    // Calculate actual average monthly expenses over the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: ninetyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const past90DaysSpend = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
    const actualMonthlyAverage = MoneyMath.round(past90DaysSpend / 3);

    const targetMonths = fund.monthsOfExpensesTarget || 6;
    const effectiveMonthlyExpense =
      fund.targetExpensesPerMonth > 0 ? fund.targetExpensesPerMonth : actualMonthlyAverage || 10000;

    const recommendedTarget = MoneyMath.round(effectiveMonthlyExpense * targetMonths);
    const targetAmount = fund.targetAmount > 0 ? fund.targetAmount : recommendedTarget;
    const currentAmount = fund.currentAmount;

    const progressPercentage = MoneyMath.percentage(currentAmount, targetAmount);
    const runwayMonths = MoneyMath.runwayMonths(currentAmount, effectiveMonthlyExpense);
    const remainingToTarget = Math.max(0, MoneyMath.subtract(targetAmount, currentAmount));

    let monthsToComplete: number | null = null;
    if (fund.monthlyContribution > 0 && remainingToTarget > 0) {
      monthsToComplete = Math.ceil(remainingToTarget / fund.monthlyContribution);
    }

    return {
      ...fund.toJSON(),
      effectiveMonthlyExpense,
      actualMonthlyAverage,
      recommendedTarget,
      targetAmount,
      currentAmount,
      remainingToTarget,
      progressPercentage: Math.min(100, progressPercentage),
      runwayMonths,
      monthsToComplete,
      isFullyFunded: currentAmount >= targetAmount,
    };
  }

  /**
   * Updates emergency fund configuration
   */
  static async update(userId: string, dto: UpdateEmergencyFundDto) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const payload: Record<string, any> = {};
    if (dto.targetAmount !== undefined) payload.targetAmount = MoneyMath.round(dto.targetAmount);
    if (dto.currentAmount !== undefined) payload.currentAmount = MoneyMath.round(dto.currentAmount);
    if (dto.monthlyContribution !== undefined) payload.monthlyContribution = MoneyMath.round(dto.monthlyContribution);
    if (dto.monthsOfExpensesTarget !== undefined) payload.monthsOfExpensesTarget = dto.monthsOfExpensesTarget;
    if (dto.targetExpensesPerMonth !== undefined) payload.targetExpensesPerMonth = MoneyMath.round(dto.targetExpensesPerMonth);
    if (dto.notes !== undefined) payload.notes = dto.notes.trim();

    const fund = await EmergencyFund.findOneAndUpdate(
      { userId: userObjectId },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    );

    return this.get(userId);
  }

  /**
   * Adds contribution to the emergency fund
   */
  static async contribute(userId: string, amount: number) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roundedAmount = MoneyMath.round(amount);

    if (roundedAmount <= 0) {
      throw ApiError.badRequest('Contribution amount must be greater than zero.');
    }

    const fund = await EmergencyFund.findOneAndUpdate(
      { userId: userObjectId },
      { $inc: { currentAmount: roundedAmount } },
      { new: true, upsert: true, runValidators: true }
    );

    return this.get(userId);
  }
}
