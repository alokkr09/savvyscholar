# 🎓 Savvy Scholar — Technical Architecture & Interview Mastery Guide

This guide breaks down the engineering behind **Savvy Scholar**, the technical decisions made, and how to discuss the project in engineering interviews.

---

## 📌 1. Project Elevator Pitch (30-Second Summary)

> *"Savvy Scholar is a full-stack personal finance and wealth-building platform designed for students and young adults. It goes beyond basic expense logging by offering dynamic category budgeting with threshold alerting, savings milestone gamification, investment portfolio tracking with asset allocation analytics, 30-day insurance renewal countdowns, and a real-time survival runway calculator based on 90-day expense velocity. Built with a decoupled TypeScript architecture (React 18 on the frontend and Node/Express/MongoDB on the backend), it features IEEE-754 precision math protection, compound-indexed multi-tenant isolation, and a comprehensive Vitest automated test suite."*

---

## 🏛️ 2. Architectural Blueprint & Data Flow

```text
[ React 18 SPA + Vite + Tailwind ]
        │
        ▼ (HTTP REST via Fetch API Client with Bearer Tokens)
[ Express.js REST API Layer (Port 5001) ]
        │
        ├── 1. Security & Parsing (Helmet, CORS, Morgan, JSON parser)
        ├── 2. Rate Limiting (express-rate-limit)
        ├── 3. Authentication Middleware (JWT verification + User hydration)
        ├── 4. Request Validation (Joi Schemas fail-fast on malformed input)
        ├── 5. Controllers (Thin transport layer: extracts params, sends ApiResponse)
        ├── 6. Services (Pure business logic, math calculations, aggregation pipelines)
        │
        ▼ (Mongoose ODM with Compound Multi-Tenant Indexes)
[ MongoDB (Atlas / In-Memory Fallback) ]
```

---

## 💡 3. Key Technical Decisions & Why They Matter

### 1. Zero-Drift Financial Math Engine (`MoneyMath`)
- **Problem**: JavaScript represents numbers using IEEE-754 double-precision floating points. `0.1 + 0.2` produces `0.30000000000000004`. Over thousands of transactions, balances drift.
- **Solution**: Built [`MoneyMath`](file:///Users/apple/.gemini/antigravity/scratch/resume-site/savvyscholar/backend/src/utils/money.ts), which scales amounts into integer **minor units** (Paisa / Cents) using `Math.round((amount + Number.EPSILON) * 100)` for all additions and subtractions.
- **Interview Talking Point**: *"In financial systems, you never trust floating point arithmetic. We avoided drift by storing and calculating transactions using integer minor units and Banker's epsilon-adjusted rounding."*

### 2. Live Dynamic Budgeting vs. Static Spent Fields
- **Problem**: Storing a static `spentAmount` column in a Budget document easily gets out of sync when expenses are edited, deleted, or back-dated.
- **Solution**: The Budget service executes a real-time MongoDB `$match` and `$group` aggregation pipeline across the `Expense` collection for that specific month on query.
- **Interview Talking Point**: *"Rather than managing fragile dual-write synchronization between Expenses and Budgets, we compute spending dynamically using an optimized aggregation pipeline backed by a compound index `{ userId: 1, date: -1, category: 1 }`."*

### 3. Multi-Tenant Security & IDOR Prevention
- **Problem**: Insecure Direct Object References (IDOR) allow malicious users to view or tamper with another user's financial records by guessing Object IDs in URLs (e.g. `DELETE /api/expenses/64f1...`).
- **Solution**: The JWT middleware authenticates the user, and **every single database query explicitly scopes by `userId`**:
  ```typescript
  await Expense.findOneAndDelete({ _id: expenseId, userId: req.user.userId });
  ```
- **Interview Talking Point**: *"Authorization is strictly enforced at the data layer. If User B tries to manipulate User A's expense, MongoDB returns `null`, triggering a clean 404/unauthorized response without leaking record existence."*

### 4. Zero-Config Database Fallback
- **Problem**: Local development setups often fail when MongoDB is not installed or configured on the host machine.
- **Solution**: [`backend/src/config/db.ts`](file:///Users/apple/.gemini/antigravity/scratch/resume-site/savvyscholar/backend/src/config/db.ts) tries to connect to `MONGODB_URI`. If the connection is refused, it catches the error and boots an embedded `mongodb-memory-server` with pre-seeded demo records.
- **Interview Talking Point**: *"We engineered the app to be resilient and zero-config for onboarding reviewers and CI/CD pipelines."*

---

## 🎯 4. Deep-Dive Interview Questions & Star Answers

### Q1: "How did you design the authentication and session management?"
> **Answer**:
> *"We implemented a stateless JWT authentication architecture. When a user registers or logs in, their password is validated and verified against a bcrypt salt-hashed string (12 rounds). Upon verification, the backend issues a signed JWT containing the user's ID, which the frontend stores securely. For protected routes, an `auth.ts` middleware verifies the token signature, checks if the user account still exists in the database, and injects `req.user`. On the frontend, an `ApiClient` interceptor injects the Bearer token and automatically flushes state and redirects to login with an alert if a 401 Unauthorized status is encountered."*

### Q2: "How does the Emergency Fund Runway calculation work?"
> **Answer**:
> *"The emergency fund calculates survival runway in months. Rather than asking the user for a hypothetical guess, the service queries their actual 90-day expense velocity using a MongoDB aggregation, computes their true average monthly burn rate, and calculates:  
> $$\text{Runway (Months)} = \frac{\text{Current Emergency Reserve Balance}}{\text{90-Day Average Monthly Burn}}$$  
> It also provides a monthly contribution pacing calculator that estimates the exact number of months remaining until the target safety cushion (3, 6, 9, or 12 months) is fully achieved."*

### Q3: "How do you handle error management and input validation?"
> **Answer**:
> *"We use a fail-fast layered strategy:
> 1. **Schema Validation**: Joi schemas validate request bodies before controllers run, stripping unexpected keys and returning structured 400 errors.
> 2. **Operational Error Hierarchy**: Custom `ApiError` classes distinguish between operational errors (404, 400, 401) and unhandled 500 bugs.
> 3. **Central Error Middleware**: Catches uncaught exceptions, converts MongoDB duplicate key error code `11000` into readable 409 Conflict messages, and prevents stack trace leakage in production."*

### Q4: "How did you ensure responsive and accessible UI design?"
> **Answer**:
> *"The frontend is built with Tailwind CSS following a mobile-first responsive paradigm. It includes a desktop collapsible sidebar and an intuitive mobile bottom-navigation bar for one-thumb reachability on smartphones. All interactive elements feature visible focus rings, ARIA labels, semantic HTML, skeleton loading states to prevent layout shift (CLS), and accessible color-contrast ratios for financial badges and charts."*

---

## 📊 5. Financial Calculations Summary Matrix

| Metric | Formula / Implementation | Purpose |
|---|---|---|
| **Net Savings Rate** | `Math.max(0, ((Income - Expenses) / Income) * 100)` | Measures percentage of cash flow retained. |
| **Survival Runway** | `ReserveBalance / EffectiveMonthlySpend` | Computes months of survival without income. |
| **Portfolio ROI %** | `((CurrentVal - InvestedAmt) / InvestedAmt) * 100` | Measures investment performance. |
| **Annualized Insurance** | Multiplied by frequency factor (Monthly $\times 12$, Semi $\times 2$, etc.) | Normalizes recurring insurance liabilities. |
| **Health Score** | Composite weighted index (Savings rate 40%, Runway 30%, Budget adherence 30%) | Gives students a gamified 0-100 financial health grade. |

---

## 🛡️ 6. Security Checklist
- [x] Passwords hashed with bcrypt (12 rounds)
- [x] Passwords excluded by default (`select: false` and `toJSON` transform)
- [x] All database operations scoped by `userId` (IDOR proof)
- [x] Helmet security headers enabled
- [x] Rate limiting configured on auth endpoints
- [x] Strict CORS origin validation
- [x] Input sanitization via Joi
- [x] Environment variable fail-fast validation in production
