export interface EmergencyFundData {
  _id: string;
  userId: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  monthsOfExpensesTarget: number;
  targetExpensesPerMonth: number;
  effectiveMonthlyExpense: number;
  actualMonthlyAverage: number;
  recommendedTarget: number;
  remainingToTarget: number;
  progressPercentage: number;
  runwayMonths: number;
  monthsToComplete: number | null;
  isFullyFunded: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEmergencyFundPayload {
  targetAmount?: number;
  currentAmount?: number;
  monthlyContribution?: number;
  monthsOfExpensesTarget?: number;
  targetExpensesPerMonth?: number;
  notes?: string;
}
