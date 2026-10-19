import React from 'react';
import { X, LogOut } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onSignOut }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#DCE6E6] p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-[#FBECEC] text-[#C64D4D] shrink-0">
            <LogOut className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#155456]">Sign out of Internly?</h3>
            <p className="text-xs text-[#687879] mt-1.5 leading-relaxed">
              Your applications, profile and interview prep are saved to your account. Sign back
              in anytime to pick up where you left off.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-[#687879] hover:text-[#202729] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#DCE6E6]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#202729] hover:bg-[#F5F8F8] rounded-lg transition-colors"
          >
            Stay signed in
          </button>
          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C64D4D] hover:bg-[#A83838] rounded-lg transition-colors shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};