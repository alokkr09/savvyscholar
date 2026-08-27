import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import './setup';

describe('Authentication & User Isolation Security API', () => {
  const testUser = {
    name: 'Alok Scholar',
    email: 'alok.scholar@test.edu',
    password: 'Password123',
    monthlyIncome: 20000,
    currency: 'INR',
  };

  it('should successfully register a new user and return JWT token without password', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should reject registration with duplicate email address with 409 Conflict', async () => {
    // Attempt duplicate registration
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('should reject registration with weak password (missing digit/short)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad Password',
      email: 'bad.password@test.edu',
      password: 'short',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should reject login with invalid password with 401 Unauthorized', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should retrieve authenticated user profile with valid Bearer token', async () => {
    // Login to obtain fresh token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should block access to protected route when no token is supplied', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
