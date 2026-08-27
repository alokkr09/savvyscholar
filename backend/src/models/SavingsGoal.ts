import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  SAVINGS_GOAL_CATEGORIES,
  SAVINGS_GOAL_STATUS,
  SavingsGoalCategory,
  SavingsGoalStatus,
} from '../constants/categories';

export interface ISavingsGoal extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  category: SavingsGoalCategory;
  status: SavingsGoalStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    targetDate: {
      type: Date,
    },
    category: {
      type: String,
      enum: {
        values: SAVINGS_GOAL_CATEGORIES,
        message: '{VALUE} is not a valid savings goal category',
      },
      default: 'Other',
    },
    status: {
      type: String,
      enum: {
        values: SAVINGS_GOAL_STATUS,
        message: '{VALUE} is not a valid status',
      },
      default: 'in_progress',
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

SavingsGoalSchema.index({ userId: 1, status: 1 });

export const SavingsGoal: Model<ISavingsGoal> = mongoose.model<ISavingsGoal>(
  'SavingsGoal',
  SavingsGoalSchema
);
