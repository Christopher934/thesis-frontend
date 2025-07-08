'use client';

import { useState } from 'react';

interface UseAuthErrorsReturn {
  error: string;
  setError: (message: string) => void;
  clearError: () => void;
  getErrorDetails: (status: number) => string;
}

export function useAuthErrors(): UseAuthErrorsReturn {
  const [error, setError] = useState<string>('');

  const clearError = () => setError('');

  const getErrorDetails = (status: number): string => {
    switch (status) {
      case 400:
        return 'Data yang dimasukkan tidak valid. Silakan cek kembali email dan password Anda.';
      case 401:
        return 'Email atau password salah. Silakan coba lagi.';
      case 403:
        return 'Akses ditolak. Anda tidak memiliki izin untuk masuk.';
      case 404:
        return 'Akun tidak ditemukan. Periksa email atau hubungi administrator.';
      case 429:
        return 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
      default:
        return 'Terjadi kesalahan saat masuk. Silakan coba lagi.';
    }
  };

  return {
    error,
    setError,
    clearError,
    getErrorDetails,
  };
}
