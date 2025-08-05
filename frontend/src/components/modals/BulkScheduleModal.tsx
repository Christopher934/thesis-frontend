'use client';

import React from 'react';
import { Calendar, X } from 'lucide-react';

interface BulkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkScheduleModal: React.FC<BulkScheduleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10002]">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Bulk Schedule</h2>
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
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Bulk Scheduling
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Buat jadwal untuk beberapa shift sekaligus dalam periode tertentu.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form akan ditambahkan di sini */}
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Form bulk scheduling akan ditampilkan di sini</p>
            <p className="text-sm text-gray-400">
              Fitur untuk membuat banyak jadwal shift sekaligus
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={() => {
                // TODO: Implement bulk scheduling logic
                onClose();
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Buat Jadwal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkScheduleModal;
