import React, { useState } from 'react';
import { X, Mail, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-[#DCE6E6] shadow-xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE6E6] bg-[#F5F8F8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E1F0EF] text-[#087E83] flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#155456]">Reset Password</h3>
              <p className="text-xs text-[#687879]">Recover your Internly account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#687879] hover:text-[#202729] p-1.5 rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E7F3EF] text-[#278567] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#155456]">Password Reset Simulated</h4>
              <p className="text-xs text-[#687879] max-w-sm mx-auto leading-relaxed">
                In this frontend demo, authentication is simulated locally. When connected to the Express + MongoDB backend, a secure time-limited token will be dispatched to <strong className="text-[#202729]">{email}</strong>.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-5 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Back to Sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#687879] leading-relaxed">
                Enter your registered academic or personal email address, and we'll walk through the account recovery flow.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#155456] uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687879]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DCE6E6] rounded-xl text-sm text-[#202729] placeholder-[#687879]/50 focus:outline-none focus:ring-2 focus:ring-[#087E83] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#202729] bg-white border border-[#DCE6E6] rounded-xl hover:bg-[#F5F8F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl text-white bg-[#087E83] hover:bg-[#155456] shadow-xs transition-colors"
                >
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
