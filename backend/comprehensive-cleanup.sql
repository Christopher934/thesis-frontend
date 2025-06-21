-- Clean up all test attendance and shift data
DELETE FROM absensis WHERE "userId" = 1;
DELETE FROM shifts WHERE "idpegawai" LIKE 'TEST_%' OR "idpegawai" LIKE 'ABSENSI_%';
