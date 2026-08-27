import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-200">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-5xl font-black text-slate-900 tracking-tight">404</span>
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has moved. Let's get you back to your
            finances.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="brand" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
