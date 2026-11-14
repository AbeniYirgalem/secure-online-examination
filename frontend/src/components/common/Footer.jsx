import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, FileText } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">SOES</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Secure Online Examination System (SOES) provides university-grade integrity enforcement, timed assessments, and role-based academic administration.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              <span>Anti-tamper session monitoring enabled</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <Link to="/" className="hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-600 transition">
                  About SOES
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 transition">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Governance */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Governance
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Academic Integrity Code</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Audit & Compliance Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} Secure Online Examination System (SOES). All rights reserved.
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
              Release v1.0.0-step4
            </span>
            <span>University Examination Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
