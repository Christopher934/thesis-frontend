// Constants for critical care units
export const CRITICAL_UNITS = ["ICU", "NICU", "IGD", "EMERGENCY_ROOM", "EMERGENCY"] as const;

// Constants for specialist roles
export const SPECIALIST_PREFIXES = ["DOKTER_SPESIALIS", "SPESIALIS"] as const;

/**
 * Checks if a given location is a critical/special unit
 * @param location - The location/unit name to check
 * @returns boolean indicating if the location is a critical unit
 */
export const isCriticalUnit = (location: string): boolean => {
    const upperLocation = (location || "").toUpperCase();
    return CRITICAL_UNITS.some(unit => upperLocation.includes(unit));
};

/**
 * Extracts specialization from a specialist role
 * @param role - The role string to analyze
 * @returns The specialization string or null if not a specialist role
 */
export const getSpecialization = (role: string): string | null => {
    if (!role || typeof role !== 'string') return null;
    const upperRole = role.toUpperCase();
    
    if (SPECIALIST_PREFIXES.some(prefix => upperRole.startsWith(prefix))) {
        const parts = role.split('_');
        return parts.length > 2 ? parts.slice(2).join('_') : null;
    }
    return null;
};
