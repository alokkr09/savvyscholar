export type InvestmentType =
  | 'Mutual Funds'
  | 'Stocks'
  | 'Index Funds'
  | 'Fixed Deposit (FD)'
  | 'Recurring Deposit (RD)'
  | 'Crypto'
  | 'Gold & Sovereign Bonds'
  | 'Public Provident Fund (PPF)'
  | 'Other';

export interface Investment {
  _id: string;
  userId: string;
  title: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  isPositive: boolean;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentPayload {
  title: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  purchaseDate?: string;
  notes?: string;
}

export interface AssetAllocation {
  type: string;
  value: number;
  percentage: number;
}

export interface InvestmentSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalReturnPercentage: number;
  isPositive: boolean;
  assetCount: number;
}

export interface InvestmentListResponse {
  investments: Investment[];
  summary: InvestmentSummary;
  allocation: AssetAllocation[];
}
