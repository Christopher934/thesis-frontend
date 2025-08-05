'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualAddModal: React.FC<ManualAddModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10001]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Tambah Shift Manual</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Plus className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Tambah Shift Manual
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Buat shift baru secara manual dengan memilih pegawai, tanggal, waktu, dan lokasi.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form akan ditambahkan di sini */}
          <div className="text-center py-8">
            <p className="text-gray-600">Form tambah shift manual akan ditambahkan di sini.</p>
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
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Simpan Shift
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualAddModal;
