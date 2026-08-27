import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                Savvy Scholar
              </span>
              <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                Smart Financial Intelligence
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Link to="/login">
              <Button variant="ghost" size="md">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="brand"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-md shadow-emerald-600/20"
              >
                Get Started Free
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Public Page Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Savvy Scholar. Understand your money. Build your future.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-800 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-800 transition-colors">Terms of Service</span>
            <span className="hover:text-slate-800 transition-colors">Student Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
