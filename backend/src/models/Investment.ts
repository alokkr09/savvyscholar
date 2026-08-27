import mongoose, { Document, Schema, Model } from 'mongoose';
import { INVESTMENT_TYPES, InvestmentType } from '../constants/categories';

export interface IInvestment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  purchaseDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Asset title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Investment type is required'],
      enum: {
        values: INVESTMENT_TYPES,
        message: '{VALUE} is not a valid investment type',
      },
    },
    investedAmount: {
      type: Number,
      required: [true, 'Invested amount is required'],
      min: [0.01, 'Invested amount must be greater than 0'],
    },
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
      min: [0, 'Current value cannot be negative'],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
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

InvestmentSchema.index({ userId: 1, type: 1 });

export const Investment: Model<IInvestment> = mongoose.model<IInvestment>(
  'Investment',
  InvestmentSchema
);
