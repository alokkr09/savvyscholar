import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import './setup';

describe('Expenses CRUD & Multi-Tenant Authorization Security API', () => {
  const userA = {
    name: 'User A',
    email: 'user.a.expenses@test.edu',
    password: 'Password123',
  };

  const userB = {
    name: 'User B',
    email: 'user.b.expenses@test.edu',
    password: 'Password123',
  };

  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const resA = await request(app).post('/api/auth/register').send(userA);
    tokenA = resA.body.data.token;

    const resB = await request(app).post('/api/auth/register').send(userB);
    tokenB = resB.body.data.token;
  });

  it('should authenticate both test users', () => {
    expect(tokenA).toBeDefined();
    expect(tokenB).toBeDefined();
  });

  it('should create an expense for User A', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Canteen Lunch & Coffee',
        amount: 250.5,
        category: 'Food & Dining',
        paymentMethod: 'UPI',
        tags: ['canteen', 'lunch'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.title).toBe('Canteen Lunch & Coffee');
    expect(res.body.data.expense.amount).toBe(250.5);
  });

  it('should reject invalid expense amounts or bad categories', async () => {
    const resNegative = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Bad Amount',
        amount: -50,
        category: 'Food & Dining',
      });
    expect(resNegative.status).toBe(400);

    const resBadCat = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Bad Category',
        amount: 100,
        category: 'InvalidCategory123',
      });
    expect(resBadCat.status).toBe(400);
  });

  it('CRITICAL SECURITY: User B cannot view or access User A expenses', async () => {
    // 1. User A creates an expense
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Secret Book Purchase',
        amount: 800,
        category: 'Academics & Books',
      });
    expect(createRes.status).toBe(201);
    const expenseId = createRes.body.data.expense._id;

    // 2. User B lists expenses -> should see 0 expenses
    const listResB = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(listResB.body.data.expenses.length).toBe(0);

    // 3. User B tries to fetch User A's expense by ID directly -> 404
    const getResB = await request(app)
      .get(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(getResB.status).toBe(404);

    // 4. User B tries to update User A's expense -> 404
    const updateResB = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ amount: 1 });
    expect(updateResB.status).toBe(404);

    // 5. User B tries to delete User A's expense -> 404
    const deleteResB = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(deleteResB.status).toBe(404);
  });

  it('should properly compute category summaries via aggregation', async () => {
    // Add multiple expenses for User A
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Bus Pass', amount: 500, category: 'Transportation' });

    const summaryRes = await request(app)
      .get('/api/expenses/summary')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.breakdown.length).toBeGreaterThan(0);
  });
});
