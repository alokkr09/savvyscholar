import mongoose from 'mongoose';
import { Expense } from '../models/Expense';
import { Budget } from '../models/Budget';
import { SavingsGoal } from '../models/SavingsGoal';
import { Investment } from '../models/Investment';
import { EmergencyFund } from '../models/EmergencyFund';
import { User } from '../models/User';
import { MoneyMath } from '../utils/money';

export class AnalyticsService {
  /**
   * Generates comprehensive multi-dimensional financial analytics
   */
  static async getOverview(userId: string, monthsCount = 6) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userObjectId).lean();
    const monthlyIncome = user?.monthlyIncome || 0;

    // Date range: past X months
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);

    // 1. Monthly Spending & Cash Flow Trend
    const monthlySpendingAgg = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build complete month-by-month array even for months with 0 transactions
    const monthlyTrends: Array<{
      month: string;
      label: string;
      income: number;
      expenses: number;
      savings: number;
      savingsRate: number;
    }> = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toISOString().substring(0, 7);
      const monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      const found = monthlySpendingAgg.find((m) => m._id === monthKey);
      const spent = found ? MoneyMath.round(found.totalSpent) : 0;
      const savings = Math.max(0, MoneyMath.subtract(monthlyIncome, spent));
      const savingsRate = monthlyIncome > 0 ? MoneyMath.percentage(savings, monthlyIncome) : 0;

      monthlyTrends.push({
        month: monthKey,
        label: monthLabel,
        income: monthlyIncome,
        expenses: spent,
        savings,
        savingsRate,
      });
    }

    // 2. Category Distribution (All-time or past 90 days)
    const categoryAgg = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalCategorySpend = categoryAgg.reduce((sum, item) => sum + item.totalAmount, 0);
    const categoryDistribution = categoryAgg.map((item) => ({
      category: item._id,
      amount: MoneyMath.round(item.totalAmount),
      count: item.count,
      percentage: MoneyMath.percentage(item.totalAmount, totalCategorySpend),
    }));

    // 3. Payment Method Distribution
    const paymentAgg = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const paymentMethods = paymentAgg.map((item) => ({
      method: item._id || 'Other',
      amount: MoneyMath.round(item.totalAmount),
      count: item.count,
      percentage: MoneyMath.percentage(item.totalAmount, totalCategorySpend),
    }));

    // 4. Financial Health Score (0 - 100)
    // - Savings Rate (up to 30 pts)
    // - Emergency Fund Runway (up to 30 pts)
    // - Budget Adherence (up to 20 pts)
    // - Investment Participation (up to 20 pts)
    const currentMonthKey = now.toISOString().substring(0, 7);
    const currentMonthTrend = monthlyTrends[monthlyTrends.length - 1];
    const currentMonthSpend = currentMonthTrend ? currentMonthTrend.expenses : 0;

    const [emergencyFund, investments, currentBudgets] = await Promise.all([
      EmergencyFund.findOne({ userId: userObjectId }).lean(),
      Investment.find({ userId: userObjectId }).lean(),
      Budget.find({ userId: userObjectId, month: currentMonthKey }).lean(),
    ]);

    let healthScore = 0;

    // Savings Rate Score (0 - 30 pts)
    const savingsRate = currentMonthTrend?.savingsRate || 0;
    healthScore += Math.min(30, Math.round((savingsRate / 30) * 30));

    // Emergency Fund Runway Score (0 - 30 pts) -> 6 months runway = 30 pts
    const emergencyBalance = emergencyFund?.currentAmount || 0;
    const monthlyBase = emergencyFund?.targetExpensesPerMonth || currentMonthSpend || 10000;
    const runway = monthlyBase > 0 ? emergencyBalance / monthlyBase : 0;
    healthScore += Math.min(30, Math.round((runway / 6) * 30));

    // Investment Diversification Score (0 - 20 pts)
    if (investments.length > 0) {
      healthScore += Math.min(20, 10 + investments.length * 2.5);
    }

    // Budget Adherence Score (0 - 20 pts)
    if (currentBudgets.length > 0) {
      healthScore += 20; // baseline if active budgets
    } else {
      healthScore += 10;
    }

    healthScore = Math.min(100, Math.max(10, Math.round(healthScore)));

    return {
      monthlyTrends,
      categoryDistribution,
      paymentMethods,
      healthScore,
      summary: {
        totalPeriodSpend: MoneyMath.round(totalCategorySpend),
        averageMonthlySpend: MoneyMath.round(totalCategorySpend / monthsCount),
        monthlyIncome,
      },
    };
  }
}
