import { User } from '../models/User';
import { Expense } from '../models/Expense';
import { Budget } from '../models/Budget';
import { SavingsGoal } from '../models/SavingsGoal';
import { Investment } from '../models/Investment';
import { Insurance } from '../models/Insurance';
import { EmergencyFund } from '../models/EmergencyFund';
import { logger } from '../utils/logger';

export const seedDemoData = async () => {
  try {
    const demoEmail = 'scholar.demo@savvyscholar.io';
    const existing = await User.findOne({ email: demoEmail });
    if (existing) {
      return; // Already seeded
    }

    logger.info('🌱 Seeding initial student demo profile and realistic transactions...');

    // 1. Create Demo User
    const user = await User.create({
      name: 'Alok Kumar',
      email: demoEmail,
      password: 'Password123',
      monthlyIncome: 25000,
      currency: 'INR',
    });

    const userId = user._id;
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);

    // 2. Create Realistic Expenses across the past 30 days
    const sampleExpenses = [
      { title: 'Campus Canteen Lunch & Chai', amount: 180, category: 'Food & Dining', daysAgo: 0, paymentMethod: 'UPI', tags: ['canteen', 'lunch'] },
      { title: 'Data Structures & Algorithms Textbook', amount: 850, category: 'Academics & Books', daysAgo: 2, paymentMethod: 'Net Banking', tags: ['books', 'cs'] },
      { title: 'Hostel Room Electricity Bill', amount: 1200, category: 'Utilities & Bills', daysAgo: 3, paymentMethod: 'UPI', tags: ['hostel'] },
      { title: 'Monthly Metro Smart Card Recharge', amount: 900, category: 'Transportation', daysAgo: 5, paymentMethod: 'UPI', tags: ['commute'] },
      { title: 'Weekend Movie & Popcorn with Friends', amount: 450, category: 'Entertainment & Subscriptions', daysAgo: 7, paymentMethod: 'UPI', tags: ['weekend'] },
      { title: 'Pharmacy & Cold Medication', amount: 320, category: 'Health & Fitness', daysAgo: 9, paymentMethod: 'Cash', tags: ['medical'] },
      { title: 'Semester Stationeries & Notebooks', amount: 340, category: 'Academics & Books', daysAgo: 12, paymentMethod: 'UPI', tags: ['stationery'] },
      { title: 'Grocery Run (Milk, Oats, Fruit)', amount: 680, category: 'Food & Dining', daysAgo: 14, paymentMethod: 'Debit Card', tags: ['groceries'] },
      { title: 'Spotify Student Premium', amount: 59, category: 'Entertainment & Subscriptions', daysAgo: 16, paymentMethod: 'Debit Card', tags: ['music'] },
      { title: 'Casual T-shirt & Sneakers Cleaning', amount: 750, category: 'Shopping', daysAgo: 20, paymentMethod: 'UPI', tags: ['clothing'] },
      { title: 'Weekend Train Ticket to Hometown', amount: 620, category: 'Travel', daysAgo: 25, paymentMethod: 'UPI', tags: ['travel', 'home'] },
      { title: 'Haircut & Grooming Kit', amount: 300, category: 'Personal Care', daysAgo: 28, paymentMethod: 'Cash', tags: ['personal'] },
    ];

    for (const item of sampleExpenses) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() - item.daysAgo);

      await Expense.create({
        userId,
        title: item.title,
        amount: item.amount,
        category: item.category,
        paymentMethod: item.paymentMethod,
        date: expDate,
        tags: item.tags,
      });
    }

    // 3. Create Budgets for Current Month
    const sampleBudgets = [
      { category: 'Food & Dining', amount: 4500, alertThreshold: 80 },
      { category: 'Transportation', amount: 1500, alertThreshold: 80 },
      { category: 'Academics & Books', amount: 2000, alertThreshold: 85 },
      { category: 'Entertainment & Subscriptions', amount: 1200, alertThreshold: 75 },
      { category: 'Utilities & Bills', amount: 2000, alertThreshold: 90 },
    ];

    for (const b of sampleBudgets) {
      await Budget.create({
        userId,
        category: b.category,
        amount: b.amount,
        month: currentMonth,
        alertThreshold: b.alertThreshold,
      });
    }

    // 4. Create Savings Goals
    const targetDate1 = new Date();
    targetDate1.setMonth(targetDate1.getMonth() + 4);

    const targetDate2 = new Date();
    targetDate2.setMonth(targetDate2.getMonth() + 8);

    await SavingsGoal.create([
      {
        userId,
        title: 'M3 MacBook Air for Coding 💻',
        targetAmount: 85000,
        currentAmount: 52000,
        category: 'Gadgets & Tech',
        targetDate: targetDate1,
        status: 'in_progress',
        notes: 'Saving for development and final year project setup.',
      },
      {
        userId,
        title: 'AWS Certified Solutions Architect Exam ☁️',
        targetAmount: 15000,
        currentAmount: 15000,
        category: 'Education & Certifications',
        targetDate: new Date(),
        status: 'achieved',
        notes: 'Exam voucher target successfully achieved!',
      },
      {
        userId,
        title: 'Manali Semester-End Backpacking 🏔️',
        targetAmount: 18000,
        currentAmount: 7500,
        category: 'Travel & Vacation',
        targetDate: targetDate2,
        status: 'in_progress',
        notes: 'Trip planned with college batchmates.',
      },
    ]);

    // 5. Create Investments Portfolio
    await Investment.create([
      {
        userId,
        title: 'Parag Parikh Flexi Cap Fund (SIP)',
        type: 'Mutual Funds',
        investedAmount: 15000,
        currentValue: 18400,
        purchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        notes: 'Monthly SIP of ₹2,500.',
      },
      {
        userId,
        title: 'UTI Nifty 50 Index Fund',
        type: 'Index Funds',
        investedAmount: 10000,
        currentValue: 11850,
        purchaseDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        notes: 'Long-term equity compounding corpus.',
      },
      {
        userId,
        title: 'HDFC High-Interest Student FD',
        type: 'Fixed Deposit (FD)',
        investedAmount: 20000,
        currentValue: 21450,
        purchaseDate: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000),
        notes: '7.25% p.a. guaranteed rate.',
      },
    ]);

    // 6. Create Insurance Policy
    const renewal1 = new Date();
    renewal1.setDate(renewal1.getDate() + 24); // expiring in 24 days to test renewal alert!

    const renewal2 = new Date();
    renewal2.setMonth(renewal2.getMonth() + 7);

    await Insurance.create([
      {
        userId,
        policyName: 'Star Health Student Care Plus',
        provider: 'Star Health & Allied Insurance',
        policyNumber: 'SH-STU-882941',
        policyType: 'Health Insurance',
        premiumAmount: 3400,
        premiumFrequency: 'Annually',
        coverageAmount: 500000,
        renewalDate: renewal1,
        status: 'Active',
        notes: 'Includes cashless hospitalization in all partner campus hospitals.',
      },
      {
        userId,
        policyName: 'AppleCare+ MacBook Protection',
        provider: 'Apple India',
        policyNumber: 'AC-IND-99120',
        policyType: 'Gadget Insurance',
        premiumAmount: 4500,
        premiumFrequency: 'Annually',
        coverageAmount: 85000,
        renewalDate: renewal2,
        status: 'Active',
        notes: 'Accidental damage coverage with zero deductible.',
      },
    ]);

    // 7. Create Emergency Fund
    await EmergencyFund.create({
      userId,
      targetAmount: 60000,
      currentAmount: 38000,
      monthlyContribution: 4000,
      monthsOfExpensesTarget: 6,
      targetExpensesPerMonth: 10000,
      notes: 'Kept in high-yield liquid savings account.',
    });

    logger.info('✅ Demo student profile and sample financial records seeded successfully!');
  } catch (err: any) {
    logger.warn(`Could not seed demo data: ${err.message}`);
  }
};
