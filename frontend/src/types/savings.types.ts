export type SavingsGoalCategory =
  | 'Emergency Fund'
  | 'Gadgets & Tech'
  | 'Education & Certifications'
  | 'Travel & Vacation'
  | 'Vehicle'
  | 'Career & Projects'
  | 'Investment Seed'
  | 'Other';

export type SavingsGoalStatus = 'in_progress' | 'achieved' | 'paused';

export interface SavingsGoal {
  _id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  isAchieved: boolean;
  targetDate?: string;
  category: SavingsGoalCategory;
  status: SavingsGoalStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  category?: SavingsGoalCategory;
  status?: SavingsGoalStatus;
  notes?: string;
}

export interface SavingsSummary {
  totalTarget: number;
  totalSaved: number;
  totalRemaining: number;
  overallPercentage: number;
  totalGoals: number;
  achievedGoals: number;
}

export interface SavingsListResponse {
  goals: SavingsGoal[];
  summary: SavingsSummary;
}
