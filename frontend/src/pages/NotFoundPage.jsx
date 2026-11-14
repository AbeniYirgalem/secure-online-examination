import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        The requested resource does not exist or has been relocated within the SOES system.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
