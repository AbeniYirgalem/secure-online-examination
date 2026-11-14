import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Menu, X, Lock } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">SOES</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 border-l border-slate-200 pl-2">
                Secure Online Examination System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Platform Active
            </span>
            <span className="text-slate-400">|</span>
            <div className="flex items-center text-slate-500 text-xs">
              <Lock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>TLS / AES Enforced</span>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3">
          <div className="text-xs font-medium text-slate-500 pb-1">Secure Online Examination System</div>
          <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Platform Active & Ready</span>
          </div>
        </div>
      )}
    </header>
  );
}
