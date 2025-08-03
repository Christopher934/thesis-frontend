'use client';

import React from 'react';
import { RefreshCw, X } from 'lucide-react';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10003]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold">Swap Request Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Kelola Permintaan Tukar Shift
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>Kelola dan setujui permintaan tukar shift dari pegawai.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form akan ditambahkan di sini */}
          <div className="text-center py-8">
            <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Kelola swap request akan ditampilkan di sini</p>
            <p className="text-sm text-gray-400">
              Fitur untuk mengelola permintaan tukar shift pegawai
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapRequestModal;
