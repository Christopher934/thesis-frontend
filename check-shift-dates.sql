-- Check shift data for date issues
SELECT 
    id,
    tanggal,
    userId,
    lokasishift,
    tipeshift,
    CASE 
        WHEN tanggal IS NULL THEN 'NULL_DATE'
        WHEN tanggal::text = '' THEN 'EMPTY_DATE'
        WHEN tanggal < '1900-01-01' THEN 'TOO_OLD'
        WHEN tanggal > '2100-01-01' THEN 'TOO_NEW'
        ELSE 'VALID'
    END as date_status
FROM shifts 
ORDER BY tanggal DESC
LIMIT 20;

-- Count shifts by date status
SELECT 
    CASE 
        WHEN tanggal IS NULL THEN 'NULL_DATE'
        WHEN tanggal::text = '' THEN 'EMPTY_DATE'
        WHEN tanggal < '1900-01-01' THEN 'TOO_OLD'
        WHEN tanggal > '2100-01-01' THEN 'TOO_NEW'
        ELSE 'VALID'
    END as date_status,
    COUNT(*) as count
FROM shifts 
GROUP BY date_status
ORDER BY count DESC;

-- Check for users with invalid shift assignments
SELECT 
    u.id,
    u.namaDepan,
    u.namaBelakang,
    COUNT(s.id) as total_shifts,
    COUNT(CASE WHEN s.tanggal >= DATE_TRUNC('month', CURRENT_DATE) 
                   AND s.tanggal < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
              THEN 1 END) as this_month_shifts
FROM users u
LEFT JOIN shifts s ON u.id = s.userId
WHERE u.status = 'ACTIVE'
GROUP BY u.id, u.namaDepan, u.namaBelakang
ORDER BY total_shifts DESC
LIMIT 10;
