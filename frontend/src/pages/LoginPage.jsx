import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, Info, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardContent, CardFooter } from '../components/ui/Card';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Institutional email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required to authenticate.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-md shadow-blue-500/20 mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to SOES Portal
          </h1>
          <p className="text-xs text-slate-500">
            Enter your university credentials to access the examination platform
          </p>
        </div>

        {/* Security Notice Banner */}
        <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-800 text-xs">
          <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
          <p className="leading-relaxed">
            Authorized access only. Every authentication event is recorded in tamper-resistant audit logs.
          </p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="leading-relaxed font-medium">{apiError}</p>
          </div>
        )}

        {/* Login Card */}
        <Card className="border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4 pt-6">
              {/* Email Input */}
              <Input
                id="email"
                name="email"
                type="email"
                label="Institutional Email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              {/* Password Input */}
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
              />

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span>Remember this device</span>
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>

              <div className="text-center text-xs text-slate-500 pt-1">
                New student?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                  Create student account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-blue-600 transition">
            &larr; Back to Platform Home
          </Link>
        </div>
      </div>
    </div>
  );
}
