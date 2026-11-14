import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSuccessMessage, setValidationSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (validationSuccessMessage) {
      setValidationSuccessMessage('');
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setValidationSuccessMessage('');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Pure UI simulation: Demonstrates form validation & state feedback without backend auth
    setTimeout(() => {
      setIsSubmitting(false);
      setValidationSuccessMessage(
        'Client-side validation passed. (Authentication backend integration will be connected in Step 5).'
      );
    }, 600);
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
            Authorized access only. Every sign-in attempt is recorded in tamper-resistant audit logs.
          </p>
        </div>

        {/* Validation Feedback Banner */}
        {validationSuccessMessage && (
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="leading-relaxed">{validationSuccessMessage}</p>
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

              {/* Remember Me & Help Links */}
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

                <span className="text-slate-400 hover:text-blue-600 cursor-pointer transition">
                  Forgot password?
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full"
              >
                Sign In
              </Button>

              <div className="text-center text-[11px] text-slate-400">
                <span>By signing in, you agree to the </span>
                <span className="underline cursor-pointer hover:text-slate-600">Institutional Honor Code</span>
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
