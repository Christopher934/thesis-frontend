// Utility functions for text formatting consistency
export const textFormatter = {
  // Capitalize first letter of each word (Title Case)
  capitalizeWords: (str: string): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Convert to UPPERCASE
  toUpperCase: (str: string): string => {
    if (!str) return '';
    return str.toUpperCase();
  },

  // Format RSUD location names to proper title case
  formatLokasiShift: (lokasi: string): string => {
    if (!lokasi) return '-';
    
    // Mapping for specific RSUD department names
    const lokasiMapping: { [key: string]: string } = {
      'GEDUNG_ADMINISTRASI': 'Gedung Administrasi',
      'RAWAT_JALAN': 'Rawat Jalan',
      'RAWAT_INAP': 'Rawat Inap',
      'GAWAT_DARURAT': 'Gawat Darurat',
      'LABORATORIUM': 'Laboratorium',
      'FARMASI': 'Farmasi',
      'RADIOLOGI': 'Radiologi',
      'GIZI': 'Gizi',
      'KEAMANAN': 'Keamanan',
      'LAUNDRY': 'Laundry',
      'CLEANING_SERVICE': 'Cleaning Service',
      'SUPIR': 'Supir',
      'ICU': 'ICU',
      'NICU': 'NICU',
    };
    
    return lokasiMapping[lokasi] || lokasi
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  // Format shift types to UPPERCASE
  formatTipeShift: (tipe: string): string => {
    if (!tipe) return '';
    return tipe.toUpperCase();
  },

  // Format status to UPPERCASE
  formatStatus: (status: string): string => {
    if (!status) return '';
    return status.toUpperCase();
  },

  // Format user names to proper case
  formatUserName: (firstName: string, lastName?: string): string => {
    const formattedFirst = firstName ? textFormatter.capitalizeWords(firstName) : '';
    const formattedLast = lastName ? textFormatter.capitalizeWords(lastName) : '';
    return [formattedFirst, formattedLast].filter(Boolean).join(' ');
  },

  // Format roles to proper case  
  formatRole: (role: string): string => {
    if (!role) return '';
    return textFormatter.capitalizeWords(role);
  }
};

export default textFormatter;
