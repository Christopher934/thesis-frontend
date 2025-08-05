export interface LaporanFilters {
  startDate?: string;
  endDate?: string;
  userId?: number;
  status?: string;
  lokasiShift?: string;
  tipeShift?: string;
}

export interface LaporanAbsensi {
  id: number;
  nama: string;
  employeeId: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string;
  jamMulaiShift: string;
  jamSelesaiShift: string;
  status: string;
  lokasiShift: string;
  tipeShift: string;
  catatan?: string;
}

export interface LaporanShift {
  id: number;
  nama: string;
  employeeId: string;
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  tipeshift: string;
  statusAbsensi: string;
  jamMasuk: string;
  jamKeluar: string;
}

export interface StatistikLaporan {
  absensi: {
    total: number;
    hadir: number;
    terlambat: number;
    tidakHadir: number;
    persentaseHadir: string;
    persentaseTerlambat: string;
    persentaseTidakHadir: string;
  };
  shift: {
    total: number;
  };
  user: {
    total: number;
  };
  lokasi: Array<{
    nama: string;
    jumlah: number;
  }>;
  tipeShift: Array<{
    nama: string;
    jumlah: number;
  }>;
}

export interface RingkasanLaporan {
  periode: {
    start: string;
    end: string;
  };
  ringkasanHarian: Array<{
    status: string;
    jumlah: number;
  }>;
  pegawaiTerbaik: Array<{
    nama: string;
    employeeId: string;
    jumlahHadir: number;
  }>;
  aktivitasTerbaru: Array<{
    nama: string;
    tanggal: string;
    lokasi: string;
    status: string;
    waktu: string;
  }>;
}

export interface ExportResponse {
  message: string;
  type: string;
  filters: LaporanFilters;
  downloadUrl: string;
}
