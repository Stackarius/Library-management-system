import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLibrary();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-[#245747] shrink-0 stroke-[1.75]" />;
        let borderColor = 'border-[#245747]/20 bg-white text-[#202721]';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 stroke-[1.75]" />;
          borderColor = 'border-rose-200 bg-white text-[#202721]';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 stroke-[1.75]" />;
          borderColor = 'border-amber-200 bg-white text-[#202721]';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-[#245747] shrink-0 stroke-[1.75]" />;
          borderColor = 'border-[#E5E4DE] bg-white text-[#202721]';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-md border shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderColor}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold leading-tight text-[#202721]">
                {toast.title}
              </h4>
              <p className="text-[11px] text-[#5A6258] mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
