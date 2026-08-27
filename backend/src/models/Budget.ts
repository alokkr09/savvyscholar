import mongoose, { Document, Schema, Model } from 'mongoose';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../constants/categories';

export interface IBudget extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  category: ExpenseCategory;
  amount: number;
  month: string;
  alertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: '{VALUE} is not a valid expense category',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget amount must be at least 1'],
    },
    month: {
      type: String,
      required: [true, 'Budget month (YYYY-MM) is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format (e.g. 2026-08)'],
      default: () => new Date().toISOString().substring(0, 7),
      index: true,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: [1, 'Alert threshold must be at least 1%'],
      max: [100, 'Alert threshold cannot exceed 100%'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export const Budget: Model<IBudget> = mongoose.model<IBudget>('Budget', BudgetSchema);
