import React from 'react';
import { BellRing, CheckCircle2, X } from 'lucide-react';
import { ToastState } from '../hooks/useToast';

interface StudioToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export const StudioToast: React.FC<StudioToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-lg shadow-xl border animate-in slide-in-from-bottom-5 duration-300 flex items-start justify-between ${
        toast.isAlert
          ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A]'
          : 'bg-[#1A1815] text-[#FAF8F5] border-[#FAF8F5]/10'
      }`}
    >
      <div className="flex items-start space-x-3">
        {toast.isAlert ? (
          <BellRing className="w-5 h-5 text-[#B5654A] shrink-0 mt-0.5 animate-bounce" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-[#B5654A] shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-sm font-medium text-[#FAF8F5]">{toast.title}</p>
          <p className="text-xs text-[#FAF8F5]/70 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] p-1 -mr-1 cursor-pointer"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
