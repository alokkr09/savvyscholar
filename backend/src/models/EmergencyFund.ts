import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEmergencyFund extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  monthsOfExpensesTarget: number;
  targetExpensesPerMonth: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyFundSchema = new Schema<IEmergencyFund>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    targetAmount: {
      type: Number,
      default: 0,
      min: [0, 'Target amount cannot be negative'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current balance cannot be negative'],
    },
    monthlyContribution: {
      type: Number,
      default: 0,
      min: [0, 'Monthly contribution cannot be negative'],
    },
    monthsOfExpensesTarget: {
      type: Number,
      default: 6,
      min: [1, 'Target must be at least 1 month'],
      max: [36, 'Target cannot exceed 36 months'],
    },
    targetExpensesPerMonth: {
      type: Number,
      default: 0,
      min: [0, 'Monthly expense baseline cannot be negative'],
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

export const EmergencyFund: Model<IEmergencyFund> = mongoose.model<IEmergencyFund>(
  'EmergencyFund',
  EmergencyFundSchema
);
