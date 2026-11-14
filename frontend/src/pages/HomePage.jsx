import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Clock,
  UserCheck,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Server,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { checkBackendHealth } from '../services/healthService';

export default function HomePage() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Live Backend Health State
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    connected: false,
    message: 'Connecting to backend API...',
    timestamp: null,
  });

  const verifyBackendConnection = async () => {
    setHealthStatus((prev) => ({ ...prev, loading: true }));
    const result = await checkBackendHealth();

    if (result.success) {
      setHealthStatus({
        loading: false,
        connected: true,
        message: result.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      setHealthStatus({
        loading: false,
        connected: false,
        message: result.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  useEffect(() => {
    verifyBackendConnection();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <Badge variant="primary" dot size="md">
                Institutional Academic Examination Platform
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Secure Online Examination System{' '}
              <span className="text-blue-600 block mt-1">(SOES)</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A high-integrity university examination platform designed for uncompromised assessment administration, strict session supervision, role isolation, and synchronized timing.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Access Examination Portal
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full">
                  Platform Architecture
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="default" size="sm" className="mb-3">
              Core Capabilities
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Built Specifically for Academic Integrity
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every component is architected to protect assessment validity and maintain institutional governance standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="hover:border-blue-200">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Anti-Tamper Session Guard</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Active monitoring of examination focus, browser lockdown indicators, and token-restricted assessment access to prevent multi-session abuse.
                </p>
                <div className="pt-2 flex items-center text-xs font-medium text-blue-600">
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  <span>Continuous integrity enforcement</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:border-blue-200">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Synchronized Time Engine</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Authoritative server-clock synchronization prevents client-side clock manipulation and enforces strict automated exam closure.
                </p>
                <div className="pt-2 flex items-center text-xs font-medium text-blue-600">
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  <span>Sub-second server time validation</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:border-blue-200">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Three-Tier Role Isolation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Independent architectural domains for Administrators, Instructors, and Students with strict principle of least privilege enforcement.
                </p>
                <div className="pt-2 flex items-center text-xs font-medium text-blue-600">
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  <span>RBAC boundary protections</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Architecture Overview */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Administrators</h4>
                  <span className="text-[11px] font-medium text-slate-500">System Governance</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manages university users, configures academic departments, inspects tamper-proof audit trails, and governs security parameters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Instructors</h4>
                  <span className="text-[11px] font-medium text-slate-500">Exam Authoring</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Builds randomized question banks, schedules examination windows, configures grading weights, and analyzes student results.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Students</h4>
                  <span className="text-[11px] font-medium text-slate-500">Assessment Taking</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accesses authorized examinations, participates in secure test-taking sessions with auto-saving, and reviews performance reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Backend Integration Status Banner */}
      <section className="py-8 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900">API Gateway Endpoint</span>
                <p className="text-[11px] text-slate-500 font-mono">{apiBaseUrl}</p>
              </div>
            </div>

            {/* Live Health Status Indicator */}
            <div className="flex items-center space-x-3">
              {healthStatus.loading ? (
                <div className="flex items-center space-x-2 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                  <LoadingSpinner size="sm" className="text-blue-600" />
                  <span>Connecting to API...</span>
                </div>
              ) : healthStatus.connected ? (
                <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Backend: {healthStatus.message}</span>
                  {healthStatus.timestamp && (
                    <span className="text-emerald-500 text-[10px]">({healthStatus.timestamp})</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{healthStatus.message}</span>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={verifyBackendConnection}
                isLoading={healthStatus.loading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                title="Verify backend health check"
              >
                Recheck
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
