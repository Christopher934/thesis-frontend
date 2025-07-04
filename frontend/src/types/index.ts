/**
 * Shared TypeScript interfaces for RSUD Anugerah Hospital Management System
 * Updated to include employeeId field for proper employee identification
 */

// User interface with employeeId support
export interface User {
  id: number;
  employeeId: string; // Human-readable employee ID (e.g., "ADM001", "PER004")
  username: string;
  namaDepan: string;
  namaBelakang: string;
  role: string;
  email?: string;
  unit?: string;
}

// Shift interface with user information including employeeId
export interface Shift {
  id: number;
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  tipeshift?: string;
  userId: number;
  user?: {
    id: number;
    employeeId: string;
    namaDepan: string;
    namaBelakang: string;
    username: string;
    role: string;
  };
  nama?: string; // Full name for display
  idpegawai?: string; // Backward compatibility
  status?: string;
}

// Shift swap request interface
export interface TukarShift {
  id: number;
  fromUser: User;
  toUser: User;
  shift: Shift;
  status: string;
  alasan: string;
  tanggalSwap: string;
  createdAt: string;
  updatedAt?: string;
  requiresUnitHead?: boolean;
}

// Notification interface
export interface Notification {
  id: number;
  userId: number;
  user?: User;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface FormProps {
  type: 'create' | 'update';
  data?: any;
  onClose: () => void;
  onCreate: (newData: any) => void;
  onUpdate?: (updatedData: any) => void;
}

// Filter types
export interface FilterState {
  unit?: string;
  bulan?: string;
  jenisShift?: string;
  status?: string;
  role?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
}

// Stats interface for dashboard
export interface ShiftStats {
  totalStaffActive: number;
  todayShifts: number;
  permintaanTukar: number;
  staffCuti: number;
}

// Helper type for user display formatting
export type UserDisplayFormat = {
  full: string; // "PER004 - Siti Nurhaliza (PERAWAT)"
  nameOnly: string; // "Siti Nurhaliza"
  withId: string; // "PER004 - Siti Nurhaliza"
  roleOnly: string; // "PERAWAT"
};

// Utility function type for formatting user display
export type FormatUserDisplay = (user: User) => UserDisplayFormat;
