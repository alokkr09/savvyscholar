import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  monthlyIncome?: number;
  currency?: string;
}

export interface UpdateProfileDto {
  name?: string;
  monthlyIncome?: number;
  currency?: string;
  avatar?: string;
}

export class AuthService {
  /**
   * Generates a signed JWT token
   */
  private static generateToken(user: IUser): string {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Registers a new user account
   */
  static async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check for existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    // Create user (password hashing is handled in UserSchema pre-save hook)
    const user = await User.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      password: dto.password,
      monthlyIncome: dto.monthlyIncome || 0,
      currency: dto.currency || 'INR',
    });

    const token = this.generateToken(user);
    const userObject = user.toJSON();

    return {
      user: userObject,
      token,
    };
  }

  /**
   * Authenticates user credentials and returns JWT
   */
  static async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user with password field explicitly included
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // Verify password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = this.generateToken(user);
    const userObject = user.toJSON();

    return {
      user: userObject,
      token,
    };
  }

  /**
   * Retrieves current authenticated user profile
   */
  static async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found.');
    }
    return user.toJSON();
  }

  /**
   * Updates user profile fields
   */
  static async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: dto },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw ApiError.notFound('User profile not found.');
    }

    return user.toJSON();
  }

  /**
   * Securely changes user password
   */
  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect.');
    }

    user.password = newPass; // pre-save hook will hash this new password
    await user.save();

    return { message: 'Password changed successfully.' };
  }
}
