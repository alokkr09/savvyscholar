import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import './setup';

describe('Budgets, Savings Goals & Emergency Fund Calculations API', () => {
  let token: string;
  const currentMonth = new Date().toISOString().substring(0, 7);

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Calculation Tester',
      email: 'calc.tester.budgets@test.edu',
      password: 'Password123',
      monthlyIncome: 30000,
    });
    token = res.body.data.token;
  });

  it('should register and authenticate a test user', () => {
    expect(token).toBeDefined();
  });

  it('should create a category budget and dynamically compute spent & remaining', async () => {
    // 1. Create a budget for Food & Dining = ₹5,000
    const budgetRes = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Food & Dining',
        amount: 5000,
        month: currentMonth,
        alertThreshold: 80,
      });

    expect(budgetRes.status).toBe(200);

    // 2. Add an expense of ₹2,000 in Food & Dining
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Weekly Groceries',
        amount: 2000,
        category: 'Food & Dining',
      });

    // 3. Query budgets -> spent should be 2000, remaining should be 3000, percentage should be 40%
    const listRes = await request(app)
      .get(`/api/budgets?month=${currentMonth}`)
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    const foodBudget = listRes.body.data.budgets.find(
      (b: any) => b.category === 'Food & Dining'
    );
    expect(foodBudget).toBeDefined();
    expect(foodBudget.allocated).toBe(5000);
    expect(foodBudget.spent).toBe(2000);
    expect(foodBudget.remaining).toBe(3000);
    expect(foodBudget.percentage).toBe(40);
    expect(foodBudget.isExceeded).toBe(false);
  });

  it('should create a savings goal and handle deposit / withdraw lifecycle', async () => {
    // 1. Create Goal: Target ₹10,000, initial 0
    const goalRes = await request(app)
      .post('/api/savings-goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Laptop',
        targetAmount: 10000,
        category: 'Gadgets & Tech',
      });

    expect(goalRes.status).toBe(201);
    const goalId = goalRes.body.data.goal._id;

    // 2. Deposit ₹6,000
    const depRes = await request(app)
      .patch(`/api/savings-goals/${goalId}/transaction`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 6000,
        type: 'deposit',
      });

    expect(depRes.status).toBe(200);
    expect(depRes.body.data.goal.currentAmount).toBe(6000);
    expect(depRes.body.data.goal.status).toBe('in_progress');

    // 3. Deposit remaining ₹4,000 -> should auto-achieve goal
    const completeRes = await request(app)
      .patch(`/api/savings-goals/${goalId}/transaction`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 4000,
        type: 'deposit',
      });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.goal.currentAmount).toBe(10000);
    expect(completeRes.body.data.goal.status).toBe('achieved');
  });

  it('should calculate emergency fund runway and allow monthly contribution', async () => {
    // 1. Fetch initial emergency fund
    const getRes = await request(app)
      .get('/api/emergency-fund')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.fund).toBeDefined();

    // 2. Update parameters: target ₹60,000, baseline monthly expense ₹10,000
    const updateRes = await request(app)
      .put('/api/emergency-fund')
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetAmount: 60000,
        targetExpensesPerMonth: 10000,
        monthsOfExpensesTarget: 6,
      });

    expect(updateRes.status).toBe(200);

    // 3. Contribute ₹30,000 -> runway should now equal 3.0 months (30000 / 10000)
    const contRes = await request(app)
      .post('/api/emergency-fund/contribute')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 30000 });

    expect(contRes.status).toBe(200);
    expect(contRes.body.data.fund.currentAmount).toBe(30000);
    expect(contRes.body.data.fund.runwayMonths).toBe(3.0);
    expect(contRes.body.data.fund.progressPercentage).toBe(50);
  });
});
