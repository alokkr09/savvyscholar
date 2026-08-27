import mongoose from 'mongoose';
import { Investment, IInvestment } from '../models/Investment';
import { ApiError } from '../utils/apiError';
import { MoneyMath } from '../utils/money';

export interface CreateInvestmentDto {
  title: string;
  type: string;
  investedAmount: number;
  currentValue: number;
  purchaseDate?: string | Date;
  notes?: string;
}

export class InvestmentService {
  static async create(userId: string, dto: CreateInvestmentDto) {
    const investedAmount = MoneyMath.round(dto.investedAmount);
    const currentValue = MoneyMath.round(dto.currentValue);

    const investment = await Investment.create({
      userId: new mongoose.Types.ObjectId(userId),
      title: dto.title.trim(),
      type: dto.type,
      investedAmount,
      currentValue,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
      notes: dto.notes?.trim() || '',
    });

    return investment.toJSON();
  }

  static async list(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const rawInvestments = await Investment.find({ userId: userObjectId })
      .sort({ purchaseDate: -1 })
      .lean();

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const allocationMap = new Map<string, number>();

    const items = rawInvestments.map((inv) => {
      const invested = MoneyMath.round(inv.investedAmount);
      const current = MoneyMath.round(inv.currentValue);
      const gainLoss = MoneyMath.subtract(current, invested);
      const gainLossPercentage = invested > 0 ? MoneyMath.round(((current - invested) / invested) * 100, 2) : 0;

      totalInvested = MoneyMath.add(totalInvested, invested);
      totalCurrentValue = MoneyMath.add(totalCurrentValue, current);

      // Track asset allocation
      allocationMap.set(inv.type, MoneyMath.add(allocationMap.get(inv.type) || 0, current));

      return {
        ...inv,
        investedAmount: invested,
        currentValue: current,
        gainLoss,
        gainLossPercentage,
        isPositive: gainLoss >= 0,
      };
    });

    const totalGainLoss = MoneyMath.subtract(totalCurrentValue, totalInvested);
    const totalReturnPercentage =
      totalInvested > 0 ? MoneyMath.round(((totalCurrentValue - totalInvested) / totalInvested) * 100, 2) : 0;

    const allocation = Array.from(allocationMap.entries()).map(([type, value]) => ({
      type,
      value: MoneyMath.round(value),
      percentage: totalCurrentValue > 0 ? MoneyMath.percentage(value, totalCurrentValue) : 0,
    }));

    return {
      investments: items,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalGainLoss,
        totalReturnPercentage,
        isPositive: totalGainLoss >= 0,
        assetCount: items.length,
      },
      allocation,
    };
  }

  static async getById(userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid investment ID format.');
    }

    const item = await Investment.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!item) {
      throw ApiError.notFound('Investment asset not found or unauthorized.');
    }

    const invested = MoneyMath.round(item.investedAmount);
    const current = MoneyMath.round(item.currentValue);
    const gainLoss = MoneyMath.subtract(current, invested);
    const gainLossPercentage = invested > 0 ? MoneyMath.round(((current - invested) / invested) * 100, 2) : 0;

    return {
      ...item.toJSON(),
      gainLoss,
      gainLossPercentage,
      isPositive: gainLoss >= 0,
    };
  }

  static async update(userId: string, id: string, dto: Partial<CreateInvestmentDto>) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid investment ID format.');
    }

    const payload: Record<string, any> = { ...dto };
    if (payload.investedAmount !== undefined) payload.investedAmount = MoneyMath.round(payload.investedAmount);
    if (payload.currentValue !== undefined) payload.currentValue = MoneyMath.round(payload.currentValue);
    if (payload.purchaseDate) payload.purchaseDate = new Date(payload.purchaseDate);

    const item = await Investment.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!item) {
      throw ApiError.notFound('Investment asset not found or unauthorized.');
    }

    return item.toJSON();
  }

  static async delete(userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid investment ID format.');
    }

    const result = await Investment.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!result) {
      throw ApiError.notFound('Investment asset not found or unauthorized.');
    }

    return { deletedId: id, message: 'Investment asset deleted successfully.' };
  }
}
