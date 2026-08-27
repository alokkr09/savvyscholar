import mongoose from 'mongoose';
import { User } from '../models/User';
import { Expense } from '../models/Expense';
import { Budget } from '../models/Budget';
import { SavingsGoal } from '../models/SavingsGoal';
import { Investment } from '../models/Investment';
import { EmergencyFund } from '../models/EmergencyFund';
import { Insurance } from '../models/Insurance';
import { MoneyMath } from '../utils/money';

export class DashboardService {
  /**
   * Aggregates real-time financial command center KPIs and insights
   */
  static async getSummary(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Current month boundaries
    const now = new Date();
    const currentMonthKey = now.toISOString().substring(0, 7);
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

    // Parallel aggregate fetches for optimal sub-100ms response time
    const [
      user,
      currentMonthExpensesAgg,
      recentExpenses,
      budgets,
      goals,
      investments,
      emergencyFund,
      policies,
      topCategoriesAgg,
    ] = await Promise.all([
      User.findById(userObjectId).lean(),
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Expense.find({ userId: userObjectId }).sort({ date: -1, createdAt: -1 }).limit(5).lean(),
      Budget.find({ userId: userObjectId, month: currentMonthKey }).lean(),
      SavingsGoal.find({ userId: userObjectId, status: 'in_progress' }).sort({ createdAt: -1 }).limit(4).lean(),
      Investment.find({ userId: userObjectId }).lean(),
      EmergencyFund.findOne({ userId: userObjectId }).lean(),
      Insurance.find({ userId: userObjectId }).lean(),
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const monthlyIncome = user?.monthlyIncome || 0;
    const currentMonthSpend = currentMonthExpensesAgg.length > 0 ? MoneyMath.round(currentMonthExpensesAgg[0].total) : 0;
    const expenseTransactionCount = currentMonthExpensesAgg.length > 0 ? currentMonthExpensesAgg[0].count : 0;

    const netSavings = Math.max(0, MoneyMath.subtract(monthlyIncome, currentMonthSpend));
    const savingsRate = monthlyIncome > 0 ? MoneyMath.percentage(netSavings, monthlyIncome) : 0;

    // Investment Metrics
    let totalInvested = 0;
    let totalCurrentPortfolio = 0;
    investments.forEach((inv: any) => {
      totalInvested = MoneyMath.add(totalInvested, inv.investedAmount || 0);
      totalCurrentPortfolio = MoneyMath.add(totalCurrentPortfolio, inv.currentValue || 0);
    });
    const portfolioGainLoss = MoneyMath.subtract(totalCurrentPortfolio, totalInvested);
    const portfolioReturnRate =
      totalInvested > 0 ? MoneyMath.round(((totalCurrentPortfolio - totalInvested) / totalInvested) * 100, 2) : 0;

    // Budget Utilization Metrics
    let totalBudgetAllocated = 0;
    budgets.forEach((b: any) => {
      totalBudgetAllocated = MoneyMath.add(totalBudgetAllocated, b.amount || 0);
    });
    const budgetUtilizationPercentage =
      totalBudgetAllocated > 0 ? MoneyMath.percentage(currentMonthSpend, totalBudgetAllocated) : 0;

    // Goals Progress Computation
    const enrichedGoals = goals.map((g: any) => {
      const target = MoneyMath.round(g.targetAmount);
      const current = MoneyMath.round(g.currentAmount);
      return {
        _id: g._id,
        title: g.title,
        category: g.category,
        targetAmount: target,
        currentAmount: current,
        percentage: Math.min(100, MoneyMath.percentage(current, target)),
      };
    });

    // Category Spending Chart Items
    const categorySpending = topCategoriesAgg.map((cat: any) => ({
      category: cat._id,
      amount: MoneyMath.round(cat.total),
      percentage: currentMonthSpend > 0 ? MoneyMath.percentage(cat.total, currentMonthSpend) : 0,
      count: cat.count,
    }));

    // Emergency Fund Runway
    const emergencyBalance = emergencyFund?.currentAmount || 0;
    const monthlyBaseline = emergencyFund?.targetExpensesPerMonth || currentMonthSpend || 10000;
    const runwayMonths = MoneyMath.runwayMonths(emergencyBalance, monthlyBaseline);

    // Smart Financial Actionable Insights for Students
    const smartInsights: Array<{ id: string; type: 'positive' | 'warning' | 'info'; title: string; message: string }> = [];

    if (monthlyIncome > 0 && currentMonthSpend > monthlyIncome) {
      smartInsights.push({
        id: 'overspending',
        type: 'warning',
        title: 'Expenses Exceed Income',
        message: `You've spent ₹${currentMonthSpend.toLocaleString('en-IN')} this month against ₹${monthlyIncome.toLocaleString('en-IN')} income. Consider pausing non-essential purchases.`,
      });
    } else if (savingsRate >= 30) {
      smartInsights.push({
        id: 'high_savings',
        type: 'positive',
        title: 'Strong Savings Habit',
        message: `You're currently saving ${savingsRate}% of your monthly income. You are well above the recommended 20% benchmark!`,
      });
    }

    if (totalBudgetAllocated > 0 && budgetUtilizationPercentage >= 80) {
      smartInsights.push({
        id: 'budget_limit',
        type: 'warning',
        title: 'Budget Alert',
        message: `You have consumed ${budgetUtilizationPercentage}% of your total monthly budget.`,
      });
    }

    if (runwayMonths >= 6) {
      smartInsights.push({
        id: 'emergency_solid',
        type: 'positive',
        title: 'Emergency Fund Solid',
        message: `Your emergency fund covers ${runwayMonths} months of essential living expenses. Excellent safety cushion!`,
      });
    } else if (runwayMonths < 3) {
      smartInsights.push({
        id: 'emergency_boost',
        type: 'info',
        title: 'Build Your Emergency Runway',
        message: `Your current emergency buffer covers ${runwayMonths} months. Aim for at least 3-6 months to stay stress-free.`,
      });
    }

    // Check insurance renewal soon
    const expiringPolicies = policies.filter((p: any) => {
      const diff = new Date(p.renewalDate).getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 30;
    });

    if (expiringPolicies.length > 0) {
      smartInsights.push({
        id: 'insurance_due',
        type: 'warning',
        title: 'Insurance Policy Renewal Due',
        message: `${expiringPolicies[0].policyName} is due for renewal soon. Ensure continuous coverage.`,
      });
    }

    return {
      user: {
        name: user?.name || 'Scholar',
        email: user?.email || '',
        currency: user?.currency || 'INR',
        monthlyIncome,
      },
      currentMonth: {
        key: currentMonthKey,
        monthName: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        totalSpent: currentMonthSpend,
        transactionCount: expenseTransactionCount,
        netSavings,
        savingsRate,
      },
      budgets: {
        totalAllocated: totalBudgetAllocated,
        utilizationPercentage: budgetUtilizationPercentage,
        activeCount: budgets.length,
      },
      investments: {
        totalInvested,
        totalCurrentValue: totalCurrentPortfolio,
        gainLoss: portfolioGainLoss,
        returnRate: portfolioReturnRate,
        holdingCount: investments.length,
      },
      emergencyFund: {
        currentAmount: emergencyBalance,
        targetAmount: emergencyFund?.targetAmount || 60000,
        runwayMonths,
        progressPercentage: emergencyFund?.targetAmount
          ? Math.min(100, MoneyMath.percentage(emergencyBalance, emergencyFund.targetAmount))
          : 0,
      },
      recentTransactions: recentExpenses,
      savingsGoals: enrichedGoals,
      categorySpending,
      smartInsights,
    };
  }
}
