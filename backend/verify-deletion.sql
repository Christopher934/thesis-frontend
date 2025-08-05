-- Verifikasi hasil penghapusan
SELECT 'Shifts remaining:' as info, COUNT(*) as count FROM shifts
UNION ALL
SELECT 'Absensis remaining:' as info, COUNT(*) as count FROM absensis;
