import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Image as ImageIcon,
} from 'lucide-react';
import { PhotoStorageService } from '../../services/photoStorageService';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl?: string | null;
  userName: string;
  onPhotoSaved: (file: File) => void | Promise<void>;
  onPhotoRemoved: () => void | Promise<void>;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  currentPhotoUrl,
  userName,
  onPhotoSaved,
  onPhotoRemoved,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview when modal opens or current photo changes
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(currentPhotoUrl || null);
      setErrorMsg(null);
    }
  }, [isOpen, currentPhotoUrl]);

  // Release the temporary preview URL when a different one replaces it
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileSelection = (file: File) => {
    setErrorMsg(null);

    const validation = PhotoStorageService.validatePhoto(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid photo file.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      onClose();
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await onPhotoSaved(selectedFile);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await onPhotoRemoved();
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to remove photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const initials = userName
    ? userName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
    : '?';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-[#DCE6E6] shadow-xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE6E6] bg-[#F5F8F8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E1F0EF] text-[#087E83] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#155456]">Customize Profile Photo</h3>
              <p className="text-xs text-[#687879]">Personalize your candidate identity across Internly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#687879] hover:text-[#202729] p-1.5 rounded-lg hover:bg-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-[#FBECEC] text-[#C64D4D] text-xs font-medium rounded-xl border border-[#C64D4D]/20 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#087E83] flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white uppercase tracking-tight">
                    {initials}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#087E83] hover:bg-[#155456] text-white shadow-md transition-all border-2 border-white"
                title="Select photo from device"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#687879] mt-3">
              {previewUrl
                ? selectedFile
                  ? 'Previewing selected image'
                  : 'Current photo'
                : 'No photo selected · Displaying initials'}
            </p>
          </div>

          {/* Drag & Drop Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#087E83] bg-[#E1F0EF]/40'
                : 'border-[#DCE6E6] hover:border-[#087E83] hover:bg-[#F5F8F8]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-[#E1F0EF] text-[#087E83] flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#155456]">
                Click to browse or drag & drop photo
              </span>
              <span className="text-[11px] text-[#687879]">
                Supports JPEG, PNG, or WebP up to 2 MB
              </span>
            </div>
          </div>

          {/* Storage note */}
          <div className="bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl p-3 text-[11px] text-[#687879] space-y-1">
            <div className="flex items-center gap-1.5 text-[#155456] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#278567]" />
              <span>Storage & Privacy:</span>
            </div>
            <p>
              Your photo is resized in your browser, then saved to your account so it follows you when
              you sign in on another device. Only you can change it.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F5F8F8] border-t border-[#DCE6E6] flex items-center justify-between gap-3">
          {currentPhotoUrl || previewUrl ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#C64D4D] hover:bg-[#FBECEC] rounded-xl transition-colors disabled:opacity-60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-[#202729] bg-white border border-[#DCE6E6] rounded-xl hover:bg-[#F5F8F8] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing || !selectedFile}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition-colors ${
                !selectedFile || isProcessing
                  ? 'bg-[#BCCFCF] cursor-not-allowed'
                  : 'bg-[#087E83] hover:bg-[#155456]'
              }`}
            >
              {isProcessing && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isProcessing ? 'Saving...' : 'Save Photo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};