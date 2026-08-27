# 🎓 Savvy Scholar — Smart Personal Finance & Budgeting Platform

> *"Understand your money. Build your future."*

**Savvy Scholar** is a modern, production-grade personal-finance management platform engineered specifically for students, young professionals, and scholars. Built with a clean, decoupled full-stack architecture (React 18 + TypeScript + Tailwind CSS on the frontend, and Node.js + Express + TypeScript + MongoDB on the backend), it delivers an institutional fintech experience without the complexity.

---

## 🌟 Key Features

1. **Dashboard Command Center**: Real-time financial health score (0-100), net savings rate, survival runway meter, 6-month cash flow trends, recent transaction feed, and actionable smart financial insights.
2. **Precision Expense Management**: Add, edit, delete, search, sort, filter by category, payment method (UPI, Cash, Debit, Credit), and date range with custom tag support.
3. **Dynamic Monthly Category Budgets**: Set spending limits per category. Real-time background calculations compute actual spending, remaining buffer, and trigger color-coded threshold alerts (80% / 100%).
4. **Milestone Savings Goals**: Track progress towards gadgets, exam certifications, or semester trips with interactive deposit/withdrawal calculators and celebratory reward animations.
5. **Personal Investment Portfolio**: Track mutual funds, index funds, recurring deposits (RD), fixed deposits (FD), and gold holdings with automated ROI %, gain/loss, and asset allocation breakdown.
6. **Insurance & Renewal Safeguards**: Keep track of student health, device (AppleCare/gadget), vehicle, and term policies with automated 30-day renewal countdown alerts.
7. **Emergency Cushion & Survival Runway**: Calculate exactly how many months of living expenses you have saved based on actual 90-day spending velocity.
8. **Multi-Dimensional Financial Analytics**: Interactive SVG visualizations powered by Recharts (Category donut distribution, monthly cash flow bar charts, payment channel distribution).
9. **Bank-Grade Multi-Tenant Isolation**: Multi-tenant data segregation enforcing authenticated `userId` tokens on every single database query.
10. **Zero-Drift Financial Math**: Exact integer/paisa arithmetic and IEEE-754 floating point protection preventing balance rounding errors.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Rationale |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts | Sub-50ms HMR, compile-time type safety, zero runtime CSS overhead, accessible responsive components. |
| **Backend** | Node.js, Express.js, TypeScript | Clean modular REST API (Routes → Middleware → Controllers → Services → Models). |
| **Database** | MongoDB, Mongoose | Multi-tenant compound indexed schemas, aggregation pipelines for instant analytics, in-memory development fallback. |
| **Security & Auth** | JWT, bcryptjs, Helmet, CORS, Express-Rate-Limit, Joi | Stateless authentication, bcrypt password hashing (12 rounds), HTTP security headers, request validation. |
| **Testing** | Vitest, Supertest, MongoMemoryServer | In-memory integration testing suite covering security, math accuracy, and CRUD endpoints. |

---

## 📂 Project Structure

```text
savvyscholar/
├── package.json                   # Root workspace orchestration script
├── .gitignore
├── README.md                      # Complete system documentation
│
├── backend/                       # Express REST API in TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── .env.example
│   └── src/
│       ├── config/                # Environment loader, MongoDB connection & demo seeder
│       ├── constants/             # Enums: Categories, Payment Methods, HTTP Status Codes
│       ├── controllers/           # Thin HTTP Controllers
│       ├── middleware/            # JWT Auth, Joi Validation, Rate Limiter, Global Error Handler
│       ├── models/                # Mongoose Schemas (User, Expense, Budget, SavingsGoal, etc.)
│       ├── routes/                # Express API Route declarations
│       ├── services/              # Pure business logic & database interaction
│       ├── utils/                 # MoneyMath precision arithmetic, ApiError, ApiResponse, Logger
│       ├── validators/            # Joi schema validators
│       ├── tests/                 # Supertest API integration & unit tests
│       ├── app.ts                 # Express application stack
│       └── server.ts              # HTTP listener & shutdown hooks
│
└── frontend/                      # React 18 + Vite + Tailwind SPA
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts             # Vite config with backend proxy
    ├── tailwind.config.js         # Custom fintech theme tokens & typography
    ├── index.html
    └── src/
        ├── components/
        │   ├── common/            # Button, Input, Select, Modal, Card, StatCard, ProgressBar, Badge
        │   ├── layout/            # Sidebar, Topbar, Mobile BottomNav, AppLayout, PublicLayout
        │   └── expenses/          # ExpenseModal, filters
        ├── context/               # AuthContext, ToastContext
        ├── pages/                 # Landing, Login, Register, Dashboard, Expenses, Budgets, etc.
        ├── services/              # Type-safe API client wrappers (api.ts, authApi, expenseApi...)
        ├── types/                 # Shared TypeScript interfaces
        └── utils/                 # Currency formatters (INR ₹), date helpers, theme constants
```

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
- **Node.js** `v18+` or `v20+` (tested on `v24.14.0`)
- **npm** `v9+` or `v11+`
- **MongoDB** (Optional: in development, Savvy Scholar will automatically spin up an embedded in-memory MongoDB instance if local `mongod` is not running!)

### 2. Installation
From the root directory:
```bash
npm run install:all
```

### 3. Environment Setup
The backend comes pre-configured with safe development defaults. You can review or copy `.env.example`:
```bash
cp backend/.env.example backend/.env
```

### 4. Running Concurrently (Frontend + Backend)
Start both servers with a single command from the project root:
```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`
- **Health Check**: `http://localhost:5001/api/health`

---

## 🔑 Demo Account Credentials

For instantaneous testing with pre-populated realistic student financial data (expenses across all categories, monthly budgets, MacBook savings milestone, mutual funds, insurance policies, and survival runway):

- **Email**: `scholar.demo@savvyscholar.io`
- **Password**: `Password123`

*(Or click the green **"1-Click Sign In with Demo Account"** button on the Login page!)*

---

## 🧪 Running Automated Tests

Run the full integration and unit test suite (testing JWT authentication, multi-tenant database isolation, financial arithmetic accuracy, and budget calculations):

```bash
npm run test
```

---

## 🏗️ Production Build

To test and compile production bundles for both backend and frontend:

```bash
npm run build
```

This compiles:
- `backend/dist/` (Transpiled JavaScript ready for Node production)
- `frontend/dist/` (Optimized, minified static HTML/CSS/JS ready for CDN or static host)

---

## 🌐 Production Deployment Guide

### Architecture:
```
[User Browser / Mobile]
          │
          ├───► Frontend (Hosted on Vercel / Netlify / Cloudflare Pages)
          │
          └───► Backend REST API (Hosted on Render / Railway / AWS EC2)
                    │
                    └───► MongoDB Atlas (Cloud Database Cluster)
```

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist network access (`0.0.0.0/0`).
3. Copy your MongoDB URI connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/savvyscholar?retryWrites=true&w=majority`.

### 2. Backend Deployment (e.g. Render / Railway)
1. Push your repository to GitHub.
2. Create a **New Web Service** pointing to the `backend` directory.
3. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET=<Generate a strong 32+ character random string>`
   - `JWT_EXPIRES_IN=7d`
   - `CLIENT_URL=https://your-frontend-domain.vercel.app`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run start`

### 3. Frontend Deployment (e.g. Vercel / Netlify)
1. Connect your repository to Vercel/Netlify with Root Directory set to `frontend`.
2. Configure Environment Variables:
   - `VITE_API_URL=https://your-backend-api.onrender.com`
3. Build Command: `npm run build`
4. Output Directory: `dist`

---

## 🔒 Security Practices Implemented

- **Password Hashing**: `bcryptjs` with 12 salt rounds before persisting to MongoDB.
- **Authorization Enforced at Model Layer**: All document queries include `{ userId: req.user.userId }` so User A cannot inspect or manipulate User B's finances.
- **Password Exposure Prevention**: Password hashes are excluded from query results by default (`select: false`) and stripped via `toJSON` transform.
- **Security Headers**: `helmet` configured on all Express HTTP responses.
- **Rate Limiting**: `express-rate-limit` prevents brute force on `/api/auth/*` routes.
- **Input Sanitization**: Joi schema validation validates and strips unknown malicious payload keys.

---

## 💡 Financial Calculation Strategy (IEEE-754 Safe)

Standard JavaScript floating point arithmetic (`0.1 + 0.2 = 0.30000000000000004`) causes balance drift in financial software.
Savvy Scholar uses a dedicated `MoneyMath` engine:
1. **Minor Units**: Financial math converts currency amounts to integer paisa/cents `Math.round((amount + Number.EPSILON) * 100)` before performing addition/subtraction.
2. **Controlled Half-Up Rounding**: Division and percentage calculations use epsilon-adjusted rounding.
3. **Locale Standardization**: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` formats all values with appropriate symbol (`₹`) and grouping.

---

## 📄 License
MIT License. Created with ❤️ for students and young scholars.
