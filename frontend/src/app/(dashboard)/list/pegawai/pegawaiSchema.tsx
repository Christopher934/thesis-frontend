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
    .min(1, { message: 'Username dibutuhkan' })        // nonempty
    .min(3, { message: 'Username membutuhkan minimal 3 karakter' })
    .max(20, { message: 'Username maksimal 20 karakter' }),

  email: z.string().email({ message: 'Email tidak valid' }),
  
  password: z
    .string()
    .min(1, { message: 'Password dibutuhkan' })        // nonempty
    .min(8, { message: 'Password membutuhkan minimal 8 karakter' }),

  namaDepan: z.string().min(1, { message: 'Nama depan dibutuhkan!' }),
  namaBelakang: z.string().min(1, { message: 'Nama belakang dibutuhkan!' }),

  alamat: z.string().optional(),                       // optional string

  // “IsPhoneNumber('ID')” roughly means a valid Indonesian phone format.
  // We can approximate that with a regex (e.g. starts with 08 and is 9–15 digits)
  // or simply require nonempty string and leave deeper format checks to backend.
  noHp: z
    .string()
    .min(1, { message: 'Nomor HP dibutuhkan!' })
    .regex(/^08\d{7,13}$/, {
      message: 'Nomor HP tidak valid (contoh: 081234567890)',
    }),

  jenisKelamin: z.enum(['L', 'P'], {
    required_error: 'Pilih jenis kelamin: L atau P',
    invalid_type_error: 'Jenis kelamin harus “L” atau “P”',
  }),

  tanggalLahir: z
    .string()
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Tanggal lahir harus format YYYY-MM-DD',
    }),

  role: z.enum(['ADMIN', 'DOKTER', 'PERAWAT', 'STAF'], {
    required_error: 'Pilih role: ADMIN | DOKTER | PERAWAT | STAF',
    invalid_type_error: 'Role tidak valid',
  }),

  status: z.enum(['ACTIVE', 'INACTIVE'], {
    required_error: 'Pilih status: ACTIVE atau INACTIVE',
    invalid_type_error: 'Status tidak valid',
  }),
});

// Export the inferred TypeScript type for convenience:
export type PegawaiInputs = z.infer<typeof pegawaiSchema>;
