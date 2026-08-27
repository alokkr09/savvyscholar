import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  PiggyBank,
  PieChart,
  Receipt,
  Umbrella,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { formatINR } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [stipend, setStipend] = useState(15000);
  const [savingsRate, setSavingsRate] = useState(25);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const monthlySavings = (stipend * savingsRate) / 100;
  const annualSavings = monthlySavings * 12;
  const threeYearAccumulation = annualSavings * 3 * 1.08; // assuming modest 8% student fund return

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true);
      // Attempt login with demo user or direct registration
      await login({
        email: 'scholar.demo@savvyscholar.io',
        password: 'Password123',
      }).catch(async () => {
        // If demo user doesn't exist yet, we redirect to register
        navigate('/register');
      });
      navigate('/dashboard');
    } catch {
      navigate('/login');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Next-Gen Student Financial Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Understand your money.{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Build your future.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A modern, production-grade personal finance hub built specifically for students and
                young adults. Track expenses, master monthly budgets, conquer savings goals, and
                protect your future with zero guesswork.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    variant="brand"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="shadow-lg shadow-emerald-600/25 font-bold"
                  >
                    Start Free in 30 Seconds
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDemoLogin}
                  isLoading={isDemoLoading}
                  className="w-full sm:w-auto font-semibold"
                >
                  Explore with Demo Account
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Free for Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>Bank-Grade Isolation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>No Ads or Spam</span>
                </div>
              </div>
            </div>

            {/* Right Hero Card Graphic */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow Background */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-3xl blur-xl opacity-20 transform -rotate-1" />

                <div className="relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xl space-y-5">
                  {/* Top header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        SS
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Student Dashboard</h4>
                        <p className="text-xs text-slate-500">Monthly Net Worth & Runway</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      Health: 92/100
                    </span>
                  </div>

                  {/* Financial KPI Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Monthly Income
                      </span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">₹25,000</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Stipend + Freelance
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Spent
                      </span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">₹14,250</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        57% of Budget
                      </span>
                    </div>
                  </div>

                  {/* Goal Card Preview */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-900">MacBook Pro Goal 💻</span>
                      <span className="font-extrabold text-emerald-700">72%</span>
                    </div>
                    <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full w-[72%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-800">
                      <span>Saved: ₹54,000</span>
                      <span>Target: ₹75,000</span>
                    </div>
                  </div>

                  {/* Emergency Runway Pill */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white text-xs">
                    <div className="flex items-center gap-2">
                      <Umbrella className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold">Survival Runway</span>
                    </div>
                    <span className="font-extrabold text-emerald-400">5.4 Months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Student Wealth Calculator */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Interactive Forecast
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              See the Power of Early Student Budgeting
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Adjust your monthly pocket money/stipend and savings commitment to see your projected
              corpus by graduation.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-fintech">
            {/* Interactive Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Monthly Pocket Money / Income
                  </label>
                  <span className="text-sm font-black text-emerald-700">
                    {formatINR(stipend)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={stipend}
                  onChange={(e) => setStipend(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Target Monthly Savings Rate
                  </label>
                  <span className="text-sm font-black text-emerald-700">{savingsRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={savingsRate}
                  onChange={(e) => setSavingsRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <p className="text-xs text-slate-500 italic">
                * Based on compounded monthly savings discipline with conservative 8% student fund returns.
              </p>
            </div>

            {/* Projected Output Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Monthly Saved Amount
                </span>
                <p className="text-2xl font-black text-white mt-0.5">{formatINR(monthlySavings)}/mo</p>
              </div>

              <div className="border-t border-slate-700/80 pt-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  1-Year Student Cushion
                </span>
                <p className="text-xl font-bold text-white mt-0.5">{formatINR(annualSavings)}</p>
              </div>

              <div className="border-t border-slate-700/80 pt-3">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  3-Year Graduation Corpus
                </span>
                <p className="text-3xl font-black text-emerald-400 mt-0.5">
                  {formatINR(Math.round(threeYearAccumulation))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Engineered For You
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Everything You Need to Master Your Money
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Built with zero compromises. Production-grade financial architecture tailored for
              real-world student life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-fintech space-y-3 hover:shadow-fintech-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Expense Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log canteen lunches, hostel dues, course materials, and daily commutes. Filter by
                category, payment method, or custom search tags instantly.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-fintech space-y-3 hover:shadow-fintech-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dynamic Budgets</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Set monthly category spending caps. Get intelligent threshold alerts when you
                approach 80% limit before you overspend.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-fintech space-y-3 hover:shadow-fintech-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PiggyBank className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Savings Goals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Save for a new laptop, semester trips, or certification exams with visual milestone
                rings and deposit tracking.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-fintech space-y-3 hover:shadow-fintech-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Investment Portfolio</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track your mutual fund SIPs, fixed deposits, gold, and equity holdings in one
                unified asset allocation dashboard.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-fintech space-y-3 hover:shadow-fintech-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Insurance & Renewals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never miss a health or gadget insurance renewal. Automated 30-day countdown alerts
                keep you protected.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-fintech space-y-3 hover:shadow-fintech-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Umbrella className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Emergency Fund Runway</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically calculate your exact months of financial survival runway based on
                real historical spending velocity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of smart scholars making educated financial decisions from college to
            career.
          </p>
          <div className="flex justify-center pt-2">
            <Link to="/register">
              <Button
                variant="brand"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="font-bold shadow-xl shadow-emerald-600/30"
              >
                Create Your Account Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
