import mongoose from 'mongoose';
import { Insurance, IInsurance } from '../models/Insurance';
import { ApiError } from '../utils/apiError';
import { MoneyMath } from '../utils/money';

export interface CreateInsuranceDto {
  policyName: string;
  provider: string;
  policyNumber: string;
  policyType: string;
  premiumAmount: number;
  premiumFrequency?: string;
  coverageAmount: number;
  startDate?: string | Date;
  renewalDate: string | Date;
  status?: string;
  notes?: string;
}

export class InsuranceService {
  static async create(userId: string, dto: CreateInsuranceDto) {
    const policy = await Insurance.create({
      userId: new mongoose.Types.ObjectId(userId),
      policyName: dto.policyName.trim(),
      provider: dto.provider.trim(),
      policyNumber: dto.policyNumber.trim(),
      policyType: dto.policyType,
      premiumAmount: MoneyMath.round(dto.premiumAmount),
      premiumFrequency: dto.premiumFrequency || 'Annually',
      coverageAmount: MoneyMath.round(dto.coverageAmount),
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      renewalDate: new Date(dto.renewalDate),
      status: (dto.status as any) || 'Active',
      notes: dto.notes?.trim() || '',
    });

    return policy.toJSON();
  }

  static async list(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const rawPolicies = await Insurance.find({ userId: userObjectId })
      .sort({ renewalDate: 1 })
      .lean();

    const now = new Date();
    let totalCoverage = 0;
    let totalAnnualPremium = 0;

    const policies = rawPolicies.map((p) => {
      const renewalDate = new Date(p.renewalDate);
      const diffTime = renewalDate.getTime() - now.getTime();
      const daysUntilRenewal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isExpiringSoon = daysUntilRenewal >= 0 && daysUntilRenewal <= 30;
      const isExpired = daysUntilRenewal < 0;

      const coverage = MoneyMath.round(p.coverageAmount);
      const premium = MoneyMath.round(p.premiumAmount);

      totalCoverage = MoneyMath.add(totalCoverage, coverage);

      // Normalize to annual premium commitment
      let multiplier = 1;
      if (p.premiumFrequency === 'Monthly') multiplier = 12;
      else if (p.premiumFrequency === 'Quarterly') multiplier = 4;
      else if (p.premiumFrequency === 'Half-Yearly') multiplier = 2;

      totalAnnualPremium = MoneyMath.add(totalAnnualPremium, premium * multiplier);

      return {
        ...p,
        coverageAmount: coverage,
        premiumAmount: premium,
        daysUntilRenewal,
        isExpiringSoon,
        isExpired,
      };
    });

    return {
      policies,
      summary: {
        totalCoverage,
        totalAnnualPremium: MoneyMath.round(totalAnnualPremium),
        totalPolicies: policies.length,
        activePolicies: policies.filter((p) => p.status === 'Active' && !p.isExpired).length,
        expiringSoonCount: policies.filter((p) => p.isExpiringSoon).length,
        expiredCount: policies.filter((p) => p.isExpired).length,
      },
    };
  }

  static async getById(userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid insurance ID format.');
    }

    const policy = await Insurance.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!policy) {
      throw ApiError.notFound('Insurance policy not found or unauthorized.');
    }

    const now = new Date();
    const renewalDate = new Date(policy.renewalDate);
    const diffTime = renewalDate.getTime() - now.getTime();
    const daysUntilRenewal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...policy.toJSON(),
      daysUntilRenewal,
      isExpiringSoon: daysUntilRenewal >= 0 && daysUntilRenewal <= 30,
      isExpired: daysUntilRenewal < 0,
    };
  }

  static async update(userId: string, id: string, dto: Partial<CreateInsuranceDto>) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid insurance ID format.');
    }

    const payload: Record<string, any> = { ...dto };
    if (payload.premiumAmount !== undefined) payload.premiumAmount = MoneyMath.round(payload.premiumAmount);
    if (payload.coverageAmount !== undefined) payload.coverageAmount = MoneyMath.round(payload.coverageAmount);
    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    if (payload.renewalDate) payload.renewalDate = new Date(payload.renewalDate);

    const policy = await Insurance.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!policy) {
      throw ApiError.notFound('Insurance policy not found or unauthorized.');
    }

    return policy.toJSON();
  }

  static async delete(userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid insurance ID format.');
    }

    const result = await Insurance.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!result) {
      throw ApiError.notFound('Insurance policy not found or unauthorized.');
    }

    return { deletedId: id, message: 'Insurance policy deleted successfully.' };
  }
}
