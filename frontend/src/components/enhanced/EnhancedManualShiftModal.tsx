'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, Users, MapPin, Calendar } from 'lucide-react';
import EnhancedJadwalForm from '../forms/EnhancedJadwalForm';

interface EnhancedManualShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (jadwal: any) => void;
  onError: (error: { title: string; message: string; details?: any }) => void;
}

const EnhancedManualShiftModal: React.FC<EnhancedManualShiftModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  if (!isOpen) return null;

  const handleSuccess = (jadwal: any) => {
    onSuccess(jadwal);
    onClose();
  };

  const handleError = (error: any) => {
    const errorMessage = error.message || error.toString();
    
    // Parse structured error messages
    if (errorMessage.includes('🚫 WORKLOAD LIMIT EXCEEDED')) {
      const lines = errorMessage.split('\n');
      const employee = lines.find(line => line.startsWith('Employee:'))?.replace('Employee: ', '') || 'Unknown';
      const status = lines.find(line => line.startsWith('Status:'))?.replace('Status: ', '') || 'Unknown';
      const weeklyHours = lines.find(line => line.startsWith('Weekly Hours:'))?.replace('Weekly Hours: ', '') || 'Unknown';
      const monthlyHours = lines.find(line => line.startsWith('Monthly Hours:'))?.replace('Monthly Hours: ', '') || 'Unknown';
      
      onError({
        title: 'Batas Beban Kerja Terlampaui',
        message: `Pegawai ${employee} telah mencapai batas maksimum beban kerja dan memerlukan persetujuan overwork.`,
        details: {
          timestamp: new Date().toLocaleString('id-ID'),
          employee,
          status,
          weeklyHours,
          monthlyHours,
          recommendations: [
            'Pegawai harus mengajukan Overwork Request',
            'Request harus disetujui supervisor terlebih dahulu',
            'Gunakan pegawai lain yang masih tersedia',
            'Reschedule ke minggu/bulan berikutnya',
            'Kurangi shift existing untuk pegawai ini'
          ]
        }
      });
    } else if (errorMessage.includes('⚠️ EMPLOYEE UNAVAILABLE')) {
      const lines = errorMessage.split('\n');
      const employee = lines.find(line => line.startsWith('Employee:'))?.replace('Employee: ', '') || 'Unknown';
      
      onError({
        title: 'Pegawai Tidak Tersedia',
        message: `Pegawai ${employee} saat ini tidak dapat diberi shift tambahan.`,
        details: {
          timestamp: new Date().toLocaleString('id-ID'),
          employee,
          recommendations: [
            'Hubungi supervisor untuk klarifikasi status pegawai',
            'Periksa apakah pegawai sedang cuti atau istirahat medis',
            'Gunakan pegawai alternatif yang tersedia',
            'Tinjau pembatasan administratif yang berlaku'
          ]
        }
      });
    } else if (errorMessage.includes('🚫 SHIFT CREATION FAILED')) {
      const lines = errorMessage.split('\n').filter(line => line.trim());
      const primaryIssue = lines.find(line => line.includes('Primary Issue:'))?.replace('❌ Primary Issue: ', '') || 'Unknown conflict';
      
      const conflicts = [];
      const workloadIssues = [];
      const capacityIssues = [];
      
      let currentSection = '';
      for (const line of lines) {
        if (line.includes('SCHEDULING CONFLICTS:')) {
          currentSection = 'conflicts';
        } else if (line.includes('WORKLOAD ISSUES:')) {
          currentSection = 'workload';
        } else if (line.includes('CAPACITY ISSUES:')) {
          currentSection = 'capacity';
        } else if (line.match(/^\d+\./)) {
          switch (currentSection) {
            case 'conflicts':
              conflicts.push(line);
              break;
            case 'workload':
              workloadIssues.push(line);
              break;
            case 'capacity':
              capacityIssues.push(line);
              break;
          }
        }
      }
      
      onError({
        title: 'Gagal Membuat Shift - Konflik Terdeteksi',
        message: primaryIssue,
        details: {
          timestamp: new Date().toLocaleString('id-ID'),
          conflicts: conflicts.length > 0 ? conflicts : undefined,
          workloadIssues: workloadIssues.length > 0 ? workloadIssues : undefined,
          capacityIssues: capacityIssues.length > 0 ? capacityIssues : undefined,
          recommendations: [
            'Pilih tanggal/waktu yang berbeda',
            'Gunakan pegawai alternatif',
            'Periksa jadwal existing untuk konflik',
            'Koordinasi dengan supervisor tim',
            'Pertimbangkan pembagian shift yang lebih merata'
          ]
        }
      });
    } else {
      // Generic error handling
      onError({
        title: 'Gagal Membuat Shift Manual',
        message: errorMessage,
        details: {
          timestamp: new Date().toLocaleString('id-ID'),
          recommendations: [
            'Periksa koneksi internet',
            'Pastikan semua field diisi dengan benar',
            'Coba lagi dalam beberapa saat',
            'Hubungi administrator jika masalah berlanjut'
          ]
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Tambah Shift Manual</h2>
              <p className="text-green-100 text-sm">Buat jadwal shift secara manual dengan validasi lengkap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Warning Banner */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800 mb-2">Peringatan Penting</h3>
                <div className="text-sm text-amber-700 space-y-1">
                  <p>• Pegawai yang telah mencapai batas beban kerja tidak akan muncul dalam daftar</p>
                  <p>• Sistem akan memvalidasi konflik jadwal dan kapasitas lokasi</p>
                  <p>• Pegawai yang DISABLED memerlukan persetujuan overwork request</p>
                  <p>• Pastikan semua informasi sudah benar sebelum menyimpan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form */}
          <EnhancedJadwalForm
            type="create"
            onClose={onClose}
            onCreate={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedManualShiftModal;
