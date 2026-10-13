import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl border border-[#E5E4DE] max-w-md w-full overflow-hidden animate-in zoom-in-95">
        <div className="p-5 flex items-start gap-4">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20'
            }`}
          >
            <AlertTriangle className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base font-semibold text-[#202721] leading-snug">
              {title}
            </h3>
            <p className="text-xs text-[#5A6258] mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-700 p-1 rounded"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        <div className="px-5 py-3 bg-[#F7F6F2] border-t border-[#E5E4DE] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-[#5A6258] hover:text-[#202721] rounded-md transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs font-medium text-white rounded-md shadow-2xs transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-rose-700 hover:bg-rose-800'
                : 'bg-[#245747] hover:bg-[#1B4236]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
