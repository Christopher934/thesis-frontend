'use client';

import React from 'react';
import { Brain, X } from 'lucide-react';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Auto Schedule AI</h2>
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
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Brain className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  AI Auto Schedule - Hybrid Algorithm
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Sistem akan membuat jadwal optimal menggunakan algoritma AI hibrid yang mempertimbangkan beban kerja, preferensi, dan ketersediaan pegawai.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form akan ditambahkan di sini */}
          <div className="text-center py-8">
            <p className="text-gray-600">Form konfigurasi Auto Schedule akan ditambahkan di sini.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center"
          >
            <Brain className="w-4 h-4 mr-2" />
            Buat Jadwal AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoScheduleModal;
