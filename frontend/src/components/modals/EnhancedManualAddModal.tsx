'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  onShiftCreated?: () => void;
}

interface UserEligibility {
  canTakeShift: boolean;
  reason: string;
  currentShifts: number;
  maxShifts: number;
  needsOverworkRequest: boolean;
}

const EnhancedManualAddModal: React.FC<ManualAddModalProps> = ({ 
  isOpen, 
  onClose, 
  users = [],
  onShiftCreated 
}) => {
  const [formData, setFormData] = useState({
    userId: '',
    tanggal: '',
    shiftType: 'PAGI',
    lokasi: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEligibility, setUserEligibility] = useState<UserEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check user eligibility when userId changes
  useEffect(() => {
    if (formData.userId) {
      checkUserEligibility(formData.userId);
    } else {
      setUserEligibility(null);
    }
  }, [formData.userId]);

  const checkUserEligibility = async (userId: string) => {
    setEligibilityLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/overwork/user/${userId}/eligibility`);
      const result = await response.json();
      
      if (result.success) {
        setUserEligibility(result.data);
      } else {
        setError('Failed to check user eligibility');
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError('Error checking user eligibility');
    } finally {
      setEligibilityLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEligibility?.canTakeShift) {
      setError('User tidak dapat mengambil shift baru. Periksa eligibility.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/jadwal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idpegawai: parseInt(formData.userId),
          tanggal: formData.tanggal,
          tipeshift: formData.shiftType,
          lokasishift: formData.lokasi,
        }),
      });

      if (response.ok) {
        // Success
        onShiftCreated?.();
        onClose();
        setFormData({
          userId: '',
          tanggal: '',
          shiftType: 'PAGI',
          lokasi: '',
        });
        setUserEligibility(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create shift');
      }
    } catch (err) {
      console.error('Error creating shift:', err);
      setError('Error creating shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedUser = users.find(u => u.id.toString() === formData.userId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10001]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Tambah Shift Manual</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Pegawai
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            >
              <option value="">-- Pilih Pegawai --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.namaDepan} {user.namaBelakang} - {user.employeeId}
                </option>
              ))}
            </select>
          </div>

          {/* User Eligibility Status */}
          {formData.userId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Status Eligibility Pegawai
              </h4>
              
              {eligibilityLoading ? (
                <div className="flex items-center text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Checking eligibility...
                </div>
              ) : userEligibility ? (
                <div className="space-y-2">
                  <div className={`flex items-center ${
                    userEligibility.canTakeShift ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {userEligibility.canTakeShift ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-2" />
                    )}
                    {userEligibility.reason}
                  </div>
                  
                  <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Current Shifts:</span> {userEligibility.currentShifts}
                    </div>
                    <div>
                      <span className="font-medium">Max Shifts:</span> {userEligibility.maxShifts}
                    </div>
                  </div>
                  
                  {userEligibility.needsOverworkRequest && (
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mt-3">
                      <div className="flex">
                        <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5" />
                        <div className="ml-3">
                          <p className="text-sm text-orange-700">
                            <strong>Memerlukan Overwork Request:</strong> Pegawai sudah mencapai batas maksimal. 
                            Diperlukan persetujuan admin untuk menambah shift.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Pilih pegawai untuk melihat status eligibility
                </div>
              )}
            </div>
          )}

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Shift Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Shift
            </label>
            <select
              value={formData.shiftType}
              onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            >
              <option value="PAGI">Pagi (06:00 - 14:00)</option>
              <option value="SIANG">Siang (14:00 - 22:00)</option>
              <option value="MALAM">Malam (22:00 - 06:00)</option>
            </select>
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <input
              type="text"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              placeholder="Contoh: UGD, ICU, Ruang Bedah..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || 
                !userEligibility?.canTakeShift || 
                eligibilityLoading ||
                !formData.userId ||
                !formData.tanggal ||
                !formData.lokasi
              }
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Shift
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedManualAddModal;
