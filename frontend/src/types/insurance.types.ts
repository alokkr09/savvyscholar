export type InsuranceType =
  | 'Health Insurance'
  | 'Term Life Insurance'
  | 'Vehicle Insurance'
  | 'Gadget Insurance'
  | 'Travel Insurance'
  | 'Other';

export type InsuranceFrequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annually';

export interface InsurancePolicy {
  _id: string;
  userId: string;
  policyName: string;
  provider: string;
  policyNumber: string;
  policyType: InsuranceType;
  premiumAmount: number;
  premiumFrequency: InsuranceFrequency;
  coverageAmount: number;
  startDate?: string;
  renewalDate: string;
  daysUntilRenewal: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
  status: 'Active' | 'Expired' | 'Pending';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInsurancePayload {
  policyName: string;
  provider: string;
  policyNumber: string;
  policyType: InsuranceType;
  premiumAmount: number;
  premiumFrequency?: InsuranceFrequency;
  coverageAmount: number;
  startDate?: string;
  renewalDate: string;
  status?: 'Active' | 'Expired' | 'Pending';
  notes?: string;
}

export interface InsuranceSummary {
  totalCoverage: number;
  totalAnnualPremium: number;
  totalPolicies: number;
  activePolicies: number;
  expiringSoonCount: number;
  expiredCount: number;
}

export interface InsuranceListResponse {
  policies: InsurancePolicy[];
  summary: InsuranceSummary;
}
