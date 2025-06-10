import { isCriticalUnit, getSpecialization, CRITICAL_UNITS, SPECIALIST_PREFIXES } from './unitUtils';

describe('unitUtils', () => {
  describe('isCriticalUnit', () => {
    it('returns true for all critical units (case-insensitive)', () => {
      for (const unit of CRITICAL_UNITS) {
        expect(isCriticalUnit(unit)).toBe(true);
        expect(isCriticalUnit(unit.toLowerCase())).toBe(true);
        expect(isCriticalUnit(unit.toUpperCase())).toBe(true);
        expect(isCriticalUnit(`Ruang ${unit}`)).toBe(true);
      }
    });
    it('returns false for non-critical units', () => {
      expect(isCriticalUnit('Poliklinik')).toBe(false);
      expect(isCriticalUnit('Ward')).toBe(false);
      expect(isCriticalUnit('')).toBe(false);
      expect(isCriticalUnit(undefined as any)).toBe(false);
    });
  });

  describe('getSpecialization', () => {
    it('returns specialization for specialist roles', () => {
      expect(getSpecialization('DOKTER_SPESIALIS_ANAK')).toBe('ANAK');
      expect(getSpecialization('SPESIALIS_BEDAH')).toBe('BEDAH');
      expect(getSpecialization('DOKTER_SPESIALIS_KANDUNGAN')).toBe('KANDUNGAN');
    });
    it('returns null for non-specialist roles', () => {
      expect(getSpecialization('DOKTER')).toBe(null);
      expect(getSpecialization('PERAWAT')).toBe(null);
      expect(getSpecialization('')).toBe(null);
      expect(getSpecialization(undefined as any)).toBe(null);
    });
  });
});
