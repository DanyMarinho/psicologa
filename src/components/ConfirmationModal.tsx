import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  details?: { label: string; value: string }[];
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  details,
  confirmText = 'Confirmar Operação',
  cancelText = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isDestructive ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900 leading-snug">{title}</h3>
              <p className="text-xs text-stone-500">Confirmação obrigatória do Google Workspace</p>
            </div>
          </div>

          <p className="text-sm text-stone-600 mb-4 leading-relaxed">{description}</p>

          {details && details.length > 0 && (
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 mb-5 space-y-2 text-xs">
              {details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-stone-500 font-medium">{item.label}:</span>
                  <span className="text-stone-800 font-semibold text-right">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              onClick={onCancel}
              type="button"
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              type="button"
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              <Check className="w-4 h-4" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
