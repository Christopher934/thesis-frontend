'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  User,
  MapPin,
  AlertTriangle,
  Info,
  Lightbulb
} from 'lucide-react';

interface ShiftConflict {
  type: 'OVERLAP' | 'TOO_CLOSE' | 'DOUBLE_BOOKING' | 'WORKLOAD_EXCEEDED';
  message: string;
  conflictingShifts: any[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ValidationResult {
  isValid: boolean;
  conflicts: ShiftConflict[];
  warnings: string[];
  suggestions: string[];
}

interface ShiftValidationProps {
  shiftData: {
    userId: number;
    tanggal: Date;
    shiftType: string;
    lokasi: string;
    userName?: string;
  };
  onValidationChange?: (result: ValidationResult) => void;
  autoValidate?: boolean;
}

export default function ShiftValidation({ 
  shiftData, 
  onValidationChange, 
  autoValidate = true 
}: ShiftValidationProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    conflicts: [],
    warnings: [],
    suggestions: []
  });
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (autoValidate && shiftData.userId && shiftData.tanggal && shiftData.shiftType) {
      validateShift();
    }
  }, [shiftData, autoValidate]);

  const validateShift = async () => {
    setIsValidating(true);
    
    try {
      // Simulate API call for validation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await performValidation(shiftData);
      setValidationResult(result);
      
      if (onValidationChange) {
        onValidationChange(result);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        conflicts: [{
          type: 'DOUBLE_BOOKING',
          message: 'Gagal melakukan validasi jadwal',
          conflictingShifts: [],
          severity: 'HIGH'
        }],
        warnings: [],
        suggestions: ['Coba lagi atau hubungi administrator']
      });
    } finally {
      setIsValidating(false);
    }
  };

  const performValidation = async (data: any): Promise<ValidationResult> => {
    const conflicts: ShiftConflict[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Mock validation logic
    const shiftDate = new Date(data.tanggal);
    const today = new Date();
    const dayOfWeek = shiftDate.getDay();

    // Check if shift is too close to current time
    const hoursDiff = (shiftDate.getTime() - today.getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 24 && hoursDiff > 0) {
      warnings.push('Jadwal shift sangat dekat dengan waktu sekarang (kurang dari 24 jam)');
      suggestions.push('Pastikan pegawai mendapat notifikasi segera');
    }

    // Check weekend shifts
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      warnings.push('Jadwal shift di akhir pekan');
      suggestions.push('Pertimbangkan memberikan kompensasi tambahan');
    }

    // Mock conflict detection
    if (data.shiftType === 'MALAM' && dayOfWeek === 0) {
      conflicts.push({
        type: 'TOO_CLOSE',
        message: 'Shift malam di hari Minggu dapat menyebabkan kelelahan berlebih',
        conflictingShifts: [],
        severity: 'MEDIUM'
      });
      suggestions.push('Pertimbangkan mengganti dengan shift siang atau memberikan hari istirahat setelahnya');
    }

    // Mock workload check
    if (Math.random() > 0.7) {
      conflicts.push({
        type: 'WORKLOAD_EXCEEDED',
        message: 'Pegawai sudah memiliki 5 shift minggu ini (mendekati batas maksimal)',
        conflictingShifts: [],
        severity: 'MEDIUM'
      });
      suggestions.push('Pertimbangkan mendistribusikan beban kerja ke pegawai lain');
    }

    // Mock double booking check
    if (data.shiftType === 'PAGI' && Math.random() > 0.8) {
      conflicts.push({
        type: 'DOUBLE_BOOKING',
        message: 'Pegawai sudah memiliki shift pada tanggal yang sama',
        conflictingShifts: [{
          id: 1,
          tanggal: data.tanggal,
          shiftType: 'SIANG',
          lokasi: 'Ruang IGD'
        }],
        severity: 'HIGH'
      });
      suggestions.push('Pilih tanggal lain atau tugaskan ke pegawai yang berbeda');
    }

    return {
      isValid: conflicts.filter(c => c.severity === 'HIGH').length === 0,
      conflicts,
      warnings,
      suggestions
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'LOW': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return <XCircle className="w-5 h-5" />;
      case 'MEDIUM': return <AlertTriangle className="w-5 h-5" />;
      case 'LOW': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERLAP': return <Clock className="w-4 h-4" />;
      case 'TOO_CLOSE': return <Calendar className="w-4 h-4" />;
      case 'DOUBLE_BOOKING': return <User className="w-4 h-4" />;
      case 'WORKLOAD_EXCEEDED': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isValidating) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-800 font-medium">Memvalidasi jadwal...</span>
        </div>
      </div>
    );
  }

  if (validationResult.conflicts.length === 0 && validationResult.warnings.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">✅ Jadwal valid, tidak ada konflik</span>
        </div>
      </div>
    );
  }

  const highSeverityConflicts = validationResult.conflicts.filter(c => c.severity === 'HIGH');
  const mediumSeverityConflicts = validationResult.conflicts.filter(c => c.severity === 'MEDIUM');
  const lowSeverityConflicts = validationResult.conflicts.filter(c => c.severity === 'LOW');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={`border rounded-lg p-4 ${
        validationResult.isValid 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {validationResult.isValid ? (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <span className={`font-medium ${
                validationResult.isValid ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {validationResult.isValid 
                  ? '⚠️ Jadwal dapat dibuat dengan peringatan'
                  : '❌ Jadwal tidak dapat dibuat'
                }
              </span>
              <p className={`text-sm ${
                validationResult.isValid ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {highSeverityConflicts.length} konflik kritis, {mediumSeverityConflicts.length} peringatan sedang, {validationResult.warnings.length} peringatan
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            {showDetails ? 'Sembunyikan' : 'Lihat'} Detail
          </button>
        </div>
      </div>

      {/* Detailed Results */}
      {showDetails && (
        <div className="space-y-4">
          {/* High Severity Conflicts */}
          {highSeverityConflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Konflik Kritis ({highSeverityConflicts.length})
              </h4>
              <div className="space-y-3">
                {highSeverityConflicts.map((conflict, index) => (
                  <div key={index} className="bg-white border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      {getConflictTypeIcon(conflict.type)}
                      <div className="flex-1">
                        <p className="font-medium text-red-900">{conflict.message}</p>
                        {conflict.conflictingShifts.length > 0 && (
                          <div className="mt-2 text-sm text-red-700">
                            <p className="font-medium">Shift yang bertentangan:</p>
                            {conflict.conflictingShifts.map((shift, idx) => (
                              <p key={idx} className="ml-4">
                                • {shift.shiftType} di {shift.lokasi} ({new Date(shift.tanggal).toLocaleDateString('id-ID')})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medium Severity Conflicts */}
          {mediumSeverityConflicts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Peringatan Sedang ({mediumSeverityConflicts.length})
              </h4>
              <div className="space-y-3">
                {mediumSeverityConflicts.map((conflict, index) => (
                  <div key={index} className="bg-white border border-orange-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      {getConflictTypeIcon(conflict.type)}
                      <div className="flex-1">
                        <p className="font-medium text-orange-900">{conflict.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Peringatan ({validationResult.warnings.length})
              </h4>
              <ul className="space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Saran Perbaikan ({validationResult.suggestions.length})
              </h4>
              <ul className="space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-blue-700 flex items-start gap-2">
                    <span className="text-blue-600">💡</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={validateShift}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          🔄 Validasi Ulang
        </button>
        {!validationResult.isValid && (
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
            📝 Edit Jadwal
          </button>
        )}
      </div>
    </div>
  );
}

// Usage example component
export function ShiftValidationExample() {
  const [shiftData, setShiftData] = useState({
    userId: 1,
    tanggal: new Date(),
    shiftType: 'PAGI',
    lokasi: 'Ruang ICU',
    userName: 'John Doe'
  });

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🔍 Real-time Shift Validation</h2>
      
      {/* Form to test validation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Test Validation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pegawai
            </label>
            <input
              type="text"
              value={shiftData.userName}
              onChange={(e) => setShiftData({...shiftData, userName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Shift
            </label>
            <input
              type="date"
              value={shiftData.tanggal.toISOString().split('T')[0]}
              onChange={(e) => setShiftData({...shiftData, tanggal: new Date(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Shift
            </label>
            <select
              value={shiftData.shiftType}
              onChange={(e) => setShiftData({...shiftData, shiftType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PAGI">Pagi (06:00-14:00)</option>
              <option value="SIANG">Siang (14:00-22:00)</option>
              <option value="MALAM">Malam (22:00-06:00)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi
            </label>
            <select
              value={shiftData.lokasi}
              onChange={(e) => setShiftData({...shiftData, lokasi: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Ruang ICU">Ruang ICU</option>
              <option value="Ruang IGD">Ruang IGD</option>
              <option value="Ruang Rawat Inap">Ruang Rawat Inap</option>
              <option value="Ruang Operasi">Ruang Operasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Validation Component */}
      <ShiftValidation 
        shiftData={shiftData}
        onValidationChange={setValidationResult}
        autoValidate={true}
      />

      {/* Results Display */}
      {validationResult && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Hasil Validasi:</h4>
          <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(validationResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
