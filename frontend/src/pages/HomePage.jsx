import React from 'react';
import { ShieldCheck, UserCheck, BookOpen, GraduationCap, Server, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Enterprise Assessment Security</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Secure Online Examination System{' '}
          <span className="text-blue-600 block mt-1">(SOES)</span>
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed">
          A tamper-resistant, role-governed platform designed for administering academic and professional examinations with uncompromising integrity, strict timing enforcement, and secure evaluation.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Administrator Role */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">System Governance</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Centralized administration for user lifecycle management, role delegation, access policies, and tamper-evident audit logging.
          </p>
        </div>

        {/* Instructor Role */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Examination Authoring</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Comprehensive question bank management, dynamic assessment creation, scheduling constraints, and granular evaluation matrices.
          </p>
        </div>

        {/* Student Role */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Secure Assessment Engine</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Distraction-free testing interface with synchronized client-server timing, focus monitoring, and instant automated grading.
          </p>
        </div>
      </div>

      {/* Backend Integration Status Card */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">API Gateway Configuration</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{apiBaseUrl}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Client Architecture Initialized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
