// src/app/(dashboard)/list/pegawai/pegawaiSchema.ts
import { z } from 'zod';

/**
 * Zod schema must mirror CreateUserDto exactly:
 *  • same field names
 *  • same “required vs optional” rules
 *  • same string‐regex checks for phone, gender, date
 *  • same enum values for role
 */

export const pegawaiSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username minimal 3 karakter' })
    .max(20, { message: 'Username maksimal 20 karakter' }),

  email: z.string().email({ message: 'Email tidak valid' }),
  
  password: z
    .string()
    .min(8, { message: 'Password membutuhkan minimal 8 karakter' }),

  namaDepan: z.string().min(1, { message: 'Nama depan dibutuhkan!' }),
  namaBelakang: z.string().min(1, { message: 'Nama belakang dibutuhkan!' }),

  alamat: z.string().optional(),                       // optional string

  // “IsPhoneNumber('ID')” roughly means a valid Indonesian phone format.
  // We can approximate that with a regex (e.g. starts with 08 and is 9–15 digits)
  // or simply require nonempty string and leave deeper format checks to backend.
  noHp: z
    .string()
    .min(10, { message: 'Nomor HP dibutuhkan dan minimal 10 digit' })
    .regex(/^08\d{7,13}$/, { message: 'Nomor HP tidak valid (contoh: 081234567890)' }),

  jenisKelamin: z.enum(['L', 'P'], { required_error: 'Jenis kelamin wajib diisi' }),

  tanggalLahir: z
    .string()
    .min(1, { message: 'Tanggal lahir wajib diisi' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal lahir harus format YYYY-MM-DD' }),

  role: z.enum(['ADMIN', 'DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR']),

  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// Export the inferred TypeScript type for convenience:
export type PegawaiInputs = z.infer<typeof pegawaiSchema>;
