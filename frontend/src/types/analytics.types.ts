export interface MonthlyTrendItem {
  month: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export interface CategoryDistributionItem {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface PaymentMethodItem {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  monthlyTrends: MonthlyTrendItem[];
  categoryDistribution: CategoryDistributionItem[];
  paymentMethods: PaymentMethodItem[];
  healthScore: number;
  summary: {
    totalPeriodSpend: number;
    averageMonthlySpend: number;
    monthlyIncome: number;
  };
}
