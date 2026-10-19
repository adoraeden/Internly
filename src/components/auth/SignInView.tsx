import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { authService, DEMO_DEFAULT_USER } from '../../services/authService';
import { AuthUser } from '../../types';

interface SignInViewProps {
  onSuccess: (user: AuthUser) => void;
  onNavigateToSignUp: () => void;
  onOpenForgotPassword: () => void;
}

export const SignInView: React.FC<SignInViewProps> = ({
  onSuccess,
  onNavigateToSignUp,
  onOpenForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { user } = await authService.signIn({
        email: email.trim(),
        password,
        rememberMe,
      });
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setEmail(DEMO_DEFAULT_USER.email);
    setPassword('DemoIntern2027!');
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      const { user } = await authService.signIn({
        email: DEMO_DEFAULT_USER.email,
        password: 'DemoIntern2027!',
        rememberMe: true,
      });
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8F8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background visual accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#E1F0EF]/60 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#E1F0EF]/40 blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 p-2 rounded-2xl bg-[#087E83]/10">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-serif-display text-[#155456] tracking-tight">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-[#687879]">
            Your next opportunity starts here.
          </p>
        </div>

        {/* Demo Fast Track Pill */}
        <div className="mt-6 bg-[#E1F0EF] border border-[#087E83]/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#087E83] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#155456] truncate">
                  Explore with Demo Candidate
                </p>
                <p className="text-[11px] text-[#687879] truncate">
                  Pre-populated with 12 applications & prep data
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-[#087E83] hover:bg-[#155456] text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Instant demo</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="mt-5 bg-white py-8 px-6 sm:px-10 border border-[#DCE6E6] rounded-2xl shadow-sm">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-[#FBECEC] text-[#C64D4D] text-xs font-medium rounded-xl border border-[#C64D4D]/20 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-[#155456] uppercase tracking-wider mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687879]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DCE6E6] rounded-xl text-sm text-[#202729] placeholder-[#687879]/50 focus:outline-none focus:ring-2 focus:ring-[#087E83] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-[#155456] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-xs font-semibold text-[#087E83] hover:text-[#155456] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687879]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#DCE6E6] rounded-xl text-sm text-[#202729] placeholder-[#687879]/50 focus:outline-none focus:ring-2 focus:ring-[#087E83] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#687879] hover:text-[#202729]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#087E83] border-[#DCE6E6] rounded focus:ring-[#087E83] cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2.5 block text-xs font-medium text-[#202729] cursor-pointer select-none"
              >
                Remember this session on this browser
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#087E83] hover:bg-[#155456] active:bg-[#06595D] shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation to Registration */}
          <div className="mt-6 pt-5 border-t border-[#DCE6E6] text-center">
            <p className="text-xs text-[#687879]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="font-bold text-[#087E83] hover:text-[#155456] transition-colors inline-flex items-center gap-1"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        {/* Security & Architecture Disclosures */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#687879] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#278567]" />
            <span>Internly Frontend Prototype · Modular MERN-ready Service Layer</span>
          </p>
        </div>
      </div>
    </div>
  );
};
