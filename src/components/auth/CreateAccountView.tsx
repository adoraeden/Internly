import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { authService } from '../../services/authService';
import { AuthUser } from '../../types';

interface CreateAccountViewProps {
  onSuccess: (user: AuthUser) => void;
  onNavigateToSignIn: () => void;
}

export const CreateAccountView: React.FC<CreateAccountViewProps> = ({
  onSuccess,
  onNavigateToSignIn,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live password feedback
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d!@#$%^&*()_+={}[\]:;"'<>,.?/\\-]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!hasMinLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match. Please recheck your entry.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Please accept the terms to create your account.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { user } = await authService.createAccount({
        name: fullName.trim(),
        email: email.trim(),
        password,
        termsAccepted,
      });
      onSuccess(user);
    } catch (err) {
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : 'Account registration could not be completed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8F8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background visual accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#E1F0EF]/60 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-[#E1F0EF]/40 blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 p-2 rounded-2xl bg-[#087E83]/10">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-serif-display text-[#155456] tracking-tight">
            Build your next move.
          </h1>
          <p className="mt-2 text-sm text-[#687879]">
            Create your personal career and internship workspace.
          </p>
        </div>

        {/* Main Registration Card */}
        <div className="mt-7 bg-white py-8 px-6 sm:px-10 border border-[#DCE6E6] rounded-2xl shadow-sm">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-[#FBECEC] text-[#C64D4D] text-xs font-medium rounded-xl border border-[#C64D4D]/20 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-[#155456] uppercase tracking-wider mb-1.5"
              >
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687879]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={60}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DCE6E6] rounded-xl text-sm text-[#202729] placeholder-[#687879]/50 focus:outline-none focus:ring-2 focus:ring-[#087E83] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-bold text-[#155456] uppercase tracking-wider mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687879]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
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

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-bold text-[#155456] uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687879]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  maxLength={72}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold text-[#155456] uppercase tracking-wider mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687879]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  maxLength={72}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#DCE6E6] rounded-xl text-sm text-[#202729] placeholder-[#687879]/50 focus:outline-none focus:ring-2 focus:ring-[#087E83] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#687879] hover:text-[#202729]"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password tips */}
            <div className="bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl p-3 space-y-1.5 text-xs text-[#687879]">
              <span className="font-bold text-[#155456] block text-[11px] uppercase tracking-wider">
                Password tips:
              </span>
              <div className="grid grid-cols-1 gap-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  {hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-[#278567] shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#687879] shrink-0" />
                  )}
                  <span className={hasMinLength ? 'text-[#278567] font-semibold' : ''}>
                    At least 8 characters (required)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNumberOrSymbol ? (
                    <Check className="w-3.5 h-3.5 text-[#278567] shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#687879] shrink-0" />
                  )}
                  <span className={hasNumberOrSymbol ? 'text-[#278567] font-semibold' : ''}>
                    Include a number or symbol (recommended)
                  </span>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-1.5">
                    {passwordsMatch ? (
                      <Check className="w-3.5 h-3.5 text-[#278567] shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#C64D4D] shrink-0" />
                    )}
                    <span
                      className={
                        passwordsMatch
                          ? 'text-[#278567] font-semibold'
                          : 'text-[#C64D4D] font-semibold'
                      }
                    >
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms acceptance */}
            <div className="flex items-start pt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#087E83] border-[#DCE6E6] rounded focus:ring-[#087E83] cursor-pointer shrink-0"
              />
              <label
                htmlFor="terms"
                className="ml-2.5 block text-xs text-[#202729] leading-snug cursor-pointer select-none"
              >
                I agree to Internly's terms of use and understand that my applications, profile and
                interview notes are stored securely in my account.
              </label>
            </div>

            {/* Create Account Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#087E83] hover:bg-[#155456] active:bg-[#06595D] shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link back to Sign In */}
          <div className="mt-6 pt-5 border-t border-[#DCE6E6] text-center">
            <p className="text-xs text-[#687879]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignIn}
                className="font-bold text-[#087E83] hover:text-[#155456] transition-colors inline-flex items-center gap-1"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#687879] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#278567]" />
            <span>Your password is stored as a one-way hash and never in plain text.</span>
          </p>
        </div>
      </div>
    </div>
  );
};