'use client'

import { useState } from 'react';
import { WarningItem } from '@/components/common/WarningModal';

interface ShiftValidationRequest {
  employeeId: number;
  date: string;
  shiftType: string;
  location: string;
  startTime: string;
  endTime: string;
  duration?: number;
  requiredRole?: string;
}

interface ValidationResponse {
  isValid: boolean;
  score: number;
  violations: string[];
  warnings: string[];
  canProceedWithWarnings: boolean;
}

export const useShiftValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);

  const validateShift = async (request: ShiftValidationRequest): Promise<{
    isValid: boolean;
    warnings: WarningItem[];
    canProceed: boolean;
  }> => {
    setIsValidating(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      // Get API URL
      let apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) apiUrl = 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/shift-restrictions/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: request.employeeId,
          date: new Date(request.date).toISOString(),
          shiftType: request.shiftType,
          location: request.location,
          startTime: request.startTime,
          endTime: request.endTime,
          duration: request.duration || 8,
          requiredRole: request.requiredRole
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Validasi gagal: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Validation result:', result);
      
      const data = result.data || result;
      setValidationResult(data);

      // Convert violations and warnings to WarningItem format
      const warnings: WarningItem[] = [];

      // Add violations (high priority)
      if (data.violations && data.violations.length > 0) {
        data.violations.forEach((violation: string) => {
          warnings.push({
            type: 'violation',
            message: violation,
            category: getWarningCategory(violation)
          });
        });
      }

      // Add warnings (medium priority)
      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach((warning: string) => {
          warnings.push({
            type: 'warning',
            message: warning,
            category: getWarningCategory(warning)
          });
        });
      }

      // Add success message if valid
      if (data.isValid && warnings.length === 0) {
        warnings.push({
          type: 'success',
          message: `✅ Shift dapat dibuat dengan score ${data.score}/100`,
          category: 'VALIDASI'
        });
      }

      // Add info about score
      if (data.score !== undefined) {
        let scoreType: WarningItem['type'] = 'info';
        let scoreMessage = '';
        
        if (data.score >= 80) {
          scoreType = 'success';
          scoreMessage = `Score validasi sangat baik: ${data.score}/100`;
        } else if (data.score >= 60) {
          scoreType = 'info';
          scoreMessage = `Score validasi baik: ${data.score}/100`;
        } else if (data.score >= 40) {
          scoreType = 'warning';
          scoreMessage = `Score validasi cukup: ${data.score}/100`;
        } else {
          scoreType = 'violation';
          scoreMessage = `Score validasi rendah: ${data.score}/100`;
        }

        warnings.push({
          type: scoreType,
          message: scoreMessage,
          category: 'SCORE'
        });
      }

      return {
        isValid: data.isValid || false,
        warnings,
        canProceed: data.canProceedWithWarnings || data.isValid || (data.score && data.score > 30)
      };

    } catch (error: any) {
      console.error('Validation error:', error);
      
      const warnings: WarningItem[] = [{
        type: 'violation',
        message: error.message || 'Terjadi kesalahan saat validasi shift',
        category: 'ERROR'
      }];

      return {
        isValid: false,
        warnings,
        canProceed: false
      };
    } finally {
      setIsValidating(false);
    }
  };

  const getWarningCategory = (message: string): string => {
    if (message.includes('WORKLOAD') || message.includes('beban kerja')) return 'BEBAN KERJA';
    if (message.includes('AVAILABILITY') || message.includes('ketersediaan')) return 'KETERSEDIAAN';
    if (message.includes('ROLE') || message.includes('peran')) return 'PERAN';
    if (message.includes('LEAVE') || message.includes('cuti')) return 'CUTI';
    if (message.includes('PREFERENCE') || message.includes('preferensi')) return 'PREFERENSI';
    if (message.includes('TIME') || message.includes('waktu')) return 'WAKTU';
    if (message.includes('LOCATION') || message.includes('lokasi')) return 'LOKASI';
    if (message.includes('HEALTH') || message.includes('kesehatan')) return 'KESEHATAN';
    if (message.includes('LEGAL') || message.includes('legal')) return 'LEGAL';
    if (message.includes('PERFORMANCE') || message.includes('performa')) return 'PERFORMA';
    return 'UMUM';
  };

  return {
    validateShift,
    isValidating,
    validationResult
  };
};
