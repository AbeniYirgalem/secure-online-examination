import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  LogOut,
  Mail,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import PageHeading from '../components/ui/PageHeading';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const roleBadgeVariant = {
    ADMIN: 'danger',
    INSTRUCTOR: 'primary',
    STUDENT: 'success',
  }[user?.role] || 'default';

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeading
        title={`Welcome, ${user?.name || 'User'}`}
        description="Your secure session is active and verified by SOES Access Control."
        badge={
          <Badge variant={roleBadgeVariant} dot size="sm">
            {user?.role} Portal
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4 text-slate-500" />}
          >
            Sign Out
          </Button>
        }
      />

      {/* User Identity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Session Identity & Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-200">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
                  <Badge variant={roleBadgeVariant} size="sm">
                    {user?.role}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-slate-500 space-x-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Account Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active & Verified
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Auth Mechanism</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  JWT / HttpOnly Cookie
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">RBAC Realm</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {user?.role === 'STUDENT'
                    ? 'Student Assessment'
                    : user?.role === 'INSTRUCTOR'
                    ? 'Exam Authoring'
                    : 'System Administration'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start space-x-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold block">Token Validated</span>
                <span>Cryptographic signature verified by backend authority.</span>
              </div>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px] pt-2">
              Next Phase: Examination scheduling, question bank loading, and automated proctoring modules will attach to this authenticated context.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
