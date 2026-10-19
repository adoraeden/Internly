import React from 'react';
import { AlertCircle, X, Trash2 } from 'lucide-react';
import { Application } from '../../types';

interface DeleteConfirmModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  application,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE6E6] p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-[#FBECEC] text-[#C64D4D] shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#155456]">
              Delete Application?
            </h3>
            <p className="text-xs text-[#687879] mt-1.5 leading-relaxed">
              Are you sure you want to remove the record for{' '}
              <strong className="text-[#202729]">{application.company}</strong> (
              {application.jobTitle || application.role})? This will remove it from your pipeline tracking and conversion analytics.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#687879] hover:text-[#202729] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#DCE6E6]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#687879] hover:text-[#202729] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C64D4D] hover:bg-[#A83D3D] rounded-lg shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Deletion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
