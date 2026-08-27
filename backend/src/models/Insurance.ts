import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  INSURANCE_TYPES,
  INSURANCE_FREQUENCIES,
  InsuranceType,
  InsuranceFrequency,
} from '../constants/categories';

export interface IInsurance extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  policyName: string;
  provider: string;
  policyNumber: string;
  policyType: InsuranceType;
  premiumAmount: number;
  premiumFrequency: InsuranceFrequency;
  coverageAmount: number;
  startDate?: Date;
  renewalDate: Date;
  status: 'Active' | 'Expired' | 'Pending';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InsuranceSchema = new Schema<IInsurance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    policyName: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
      maxlength: [100, 'Policy name cannot exceed 100 characters'],
    },
    provider: {
      type: String,
      required: [true, 'Insurance provider is required'],
      trim: true,
      maxlength: [100, 'Provider cannot exceed 100 characters'],
    },
    policyNumber: {
      type: String,
      required: [true, 'Policy number is required'],
      trim: true,
      maxlength: [50, 'Policy number cannot exceed 50 characters'],
    },
    policyType: {
      type: String,
      required: [true, 'Policy type is required'],
      enum: {
        values: INSURANCE_TYPES,
        message: '{VALUE} is not a valid insurance type',
      },
    },
    premiumAmount: {
      type: Number,
      required: [true, 'Premium amount is required'],
      min: [0, 'Premium amount cannot be negative'],
    },
    premiumFrequency: {
      type: String,
      enum: {
        values: INSURANCE_FREQUENCIES,
        message: '{VALUE} is not a valid premium frequency',
      },
      default: 'Annually',
    },
    coverageAmount: {
      type: Number,
      required: [true, 'Coverage amount is required'],
      min: [0, 'Coverage amount cannot be negative'],
    },
    startDate: {
      type: Date,
    },
    renewalDate: {
      type: Date,
      required: [true, 'Renewal date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Pending'],
      default: 'Active',
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

InsuranceSchema.index({ userId: 1, renewalDate: 1 });

export const Insurance: Model<IInsurance> = mongoose.model<IInsurance>(
  'Insurance',
  InsuranceSchema
);
