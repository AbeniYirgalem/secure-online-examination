import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">SOES</span>
            <span>— Secure Online Examination System</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">v1.0.0-step3</span>
            <span>&copy; {currentYear} All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
