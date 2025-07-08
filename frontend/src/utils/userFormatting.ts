/**
 * Utility functions for formatting user display with employeeId
 * RSUD Anugerah Hospital Management System
 */

import { User, UserDisplayFormat } from '@/types';

/**
 * Format user information for consistent display across the application
 * @param user - User object with employeeId
 * @returns Formatted display strings
 */
export const formatUserDisplay = (user: User): UserDisplayFormat => {
  const fullName = `${user.namaDepan} ${user.namaBelakang}`.trim();
  
  return {
    full: `${user.employeeId} - ${fullName} (${user.role})`,
    nameOnly: fullName,
    withId: `${user.employeeId} - ${fullName}`,
    roleOnly: user.role
  };
};

/**
 * Format user for dropdown/select options
 * @param user - User object
 * @returns Formatted string for dropdown display
 */
export const formatUserForDropdown = (user: User): string => {
  return formatUserDisplay(user).full;
};

/**
 * Format user for table display
 * @param user - User object
 * @returns Formatted string for table display
 */
export const formatUserForTable = (user: User): string => {
  return formatUserDisplay(user).withId;
};

/**
 * Extract employee ID from various sources for backward compatibility
 * @param user - User object
 * @param shift - Optional shift object for legacy idpegawai
 * @returns Employee ID string
 */
export const getEmployeeId = (user: User, shift?: any): string => {
  // Prefer the new employeeId field
  if (user.employeeId) {
    return user.employeeId;
  }
  
  // Fallback to legacy fields for backward compatibility
  if (shift?.idpegawai) {
    return shift.idpegawai;
  }
  
  if (user.username) {
    return user.username;
  }
  
  // Last resort: construct from ID
  return `USR${String(user.id).padStart(3, '0')}`;
};

/**
 * Validate employee ID format
 * @param employeeId - Employee ID string
 * @returns True if format is valid
 */
export const isValidEmployeeId = (employeeId: string): boolean => {
  // RSUD Anugerah format: 3 letters + 3 numbers (e.g., ADM001, PER004)
  const pattern = /^[A-Z]{3}\d{3}$/;
  return pattern.test(employeeId);
};

/**
 * Get role prefix for employee ID generation
 * @param role - User role
 * @returns Three-letter prefix
 */
export const getRolePrefix = (role: string): string => {
  const rolePrefixes: { [key: string]: string } = {
    'ADMIN': 'ADM',
    'SUPERVISOR': 'SUP',
    'PERAWAT': 'PER',
    'DOKTER': 'DOK',
    'FARMASI': 'FAR',
    'LABORATORIUM': 'LAB',
    'RADIOLOGI': 'RAD',
    'GIZI': 'GIZ',
    'SECURITY': 'SEC',
    'CLEANING': 'CLN',
    'DRIVER': 'DRV'
  };
  
  return rolePrefixes[role.toUpperCase()] || 'USR';
};

/**
 * Generate employee ID for new users
 * @param role - User role
 * @param sequence - Sequence number
 * @returns Generated employee ID
 */
export const generateEmployeeId = (role: string, sequence: number): string => {
  const prefix = getRolePrefix(role);
  const paddedSequence = String(sequence).padStart(3, '0');
  return `${prefix}${paddedSequence}`;
};
