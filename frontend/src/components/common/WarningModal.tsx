'use client'

import React from 'react';
import { X, AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

export interface WarningItem {
  type: 'violation' | 'warning' | 'info' | 'success';
  message: string;
  category?: string;
}

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  warnings: WarningItem[];
  canProceed?: boolean;
  onProceed?: () => void;
  proceedText?: string;
  showProceedButton?: boolean;
}

const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  title,
  warnings,
  canProceed = false,
  onProceed,
  proceedText = 'Lanjutkan Tetap',
  showProceedButton = false
}) => {
  if (!isOpen) return null;

  const getIcon = (type: WarningItem['type']) => {
    switch (type) {
      case 'violation':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: WarningItem['type']) => {
    switch (type) {
      case 'violation':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: WarningItem['type']) => {
    switch (type) {
      case 'violation':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Ditemukan {warnings.length} peringatan yang perlu diperhatikan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getBackgroundColor(warning.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(warning.type)}
                  <div className="flex-1">
                    {warning.category && (
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        {warning.category}
                      </div>
                    )}
                    <p className={`text-sm ${getTextColor(warning.type)}`}>
                      {warning.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Ringkasan:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-gray-600">
                  Pelanggaran: {warnings.filter(w => w.type === 'violation').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-600">
                  Peringatan: {warnings.filter(w => w.type === 'warning').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">
                  Informasi: {warnings.filter(w => w.type === 'info').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">
                  Berhasil: {warnings.filter(w => w.type === 'success').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
          {showProceedButton && canProceed && onProceed && (
            <button
              onClick={onProceed}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              {proceedText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
