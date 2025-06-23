import React, { useState, useEffect } from 'react';

interface EventFormData {
  namaEvent: string;
  jenisKegiatan: string;
  deskripsi?: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  waktuMulai: string;
  waktuSelesai?: string;
  lokasi: string;
  kapasitas?: number;
  lokasiDetail?: string;
  penanggungJawab: string;
  kontak?: string;
  departemen?: string;
  prioritas: string;
  targetPeserta: string[];
  anggaran?: number;
  status: string;
  catatan?: string;
}

const defaultForm: EventFormData = {
  namaEvent: '',
  jenisKegiatan: '',
  deskripsi: '',
  tanggalMulai: '',
  tanggalSelesai: '',
  waktuMulai: '',
  waktuSelesai: '',
  lokasi: '',
  kapasitas: undefined,
  lokasiDetail: '',
  penanggungJawab: '',
  kontak: '',
  departemen: '',
  prioritas: 'sedang',
  targetPeserta: [],
  anggaran: undefined,
  status: 'draft',
  catatan: '',
};

interface EventFormProps {
  onSuccess?: () => void;
  eventId?: number; // If present, form is in edit mode
  initialData?: Partial<EventFormData>; // For editing existing event
}

const EventForm: React.FC<EventFormProps> = ({ onSuccess, eventId, initialData }) => {
  const [form, setForm] = useState<EventFormData>({ ...defaultForm, ...initialData });
  // Tambahkan efek agar form selalu sync dengan initialData saat modal edit dibuka ulang
  useEffect(() => {
    setForm({ ...defaultForm, ...initialData });
  }, [initialData]);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => {
        let arr = prev.targetPeserta;
        if (checked) {
          arr = [...arr, value];
        } else {
          arr = arr.filter((v) => v !== value);
        }
        return { ...prev, targetPeserta: arr };
      });
    } else if (type === 'number') {
      setForm((prev) => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, prioritas: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setApiError(null);
    setIsSubmitting(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) apiUrl = 'http://localhost:3001';
      let payload;
      if (eventId && initialData) {
        // Saat update, gunakan data lama jika field kosong (kecuali namaEvent)
        payload = buildEventPayload({
          ...initialData,
          ...form,
          // namaEvent selalu pakai form
          namaEvent: form.namaEvent,
          // Untuk field string, jika kosong pakai initialData
          jenisKegiatan: form.jenisKegiatan || initialData.jenisKegiatan || '',
          tanggalMulai: form.tanggalMulai || initialData.tanggalMulai || '',
          tanggalSelesai: form.tanggalSelesai || initialData.tanggalSelesai || '',
          waktuMulai: form.waktuMulai || initialData.waktuMulai || '',
          waktuSelesai: form.waktuSelesai || initialData.waktuSelesai || '',
          lokasi: form.lokasi || initialData.lokasi || '',
          penanggungJawab: form.penanggungJawab || initialData.penanggungJawab || '',
          status: form.status || initialData.status || 'draft',
        });
      } else {
        payload = buildEventPayload(form);
      }
      const token = localStorage.getItem('token');
      let res;
      if (eventId) {
        // Update (PUT)
        res = await fetch(`${apiUrl}/events/${eventId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Create (POST)
        res = await fetch(`${apiUrl}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        let msg = 'Gagal menyimpan event.';
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) msg = errJson.message;
        } catch {}
        throw new Error(msg);
      }
      setSuccess(true);
      setForm({ ...defaultForm });
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(false), 3001);
    } catch (err: any) {
      setApiError(err?.message || 'Gagal menyimpan event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ ...defaultForm });
    setSuccess(false);
  };

  // Add this function for update (PUT) requests
  const buildEventPayload = (form: EventFormData) => ({
    nama: form.namaEvent,
    jenisKegiatan: form.jenisKegiatan,
    deskripsi: form.deskripsi || '',
    tanggalMulai: form.tanggalMulai ? new Date(form.tanggalMulai + 'T' + (form.waktuMulai || '00:00') + ':00').toISOString() : null,
    tanggalSelesai: form.tanggalSelesai ? new Date(form.tanggalSelesai + 'T' + (form.waktuSelesai || '00:00') + ':00').toISOString() : null,
    waktuMulai: form.waktuMulai || '',
    waktuSelesai: form.waktuSelesai || null,
    lokasi: form.lokasi,
    kapasitas: form.kapasitas === undefined ? null : form.kapasitas,
    lokasiDetail: form.lokasiDetail || null,
    penanggungJawab: form.penanggungJawab,
    kontak: form.kontak || null,
    departemen: form.departemen || null,
    prioritas: form.prioritas,
    targetPeserta: form.targetPeserta,
    anggaran: form.anggaran === undefined ? null : form.anggaran,
    status: form.status,
    catatan: form.catatan || null,
  });

  // Set min date for today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-2 overflow-y-auto" style={{maxHeight: '90vh'}}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl mb-6 p-6 flex flex-col gap-2 text-white relative overflow-hidden">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1 drop-shadow-lg">Tambah Event / Kegiatan Baru</h1>
        <p className="text-blue-100">Kelola dan jadwalkan event atau kegiatan rumah sakit</p>
        <div className="absolute right-0 top-0 opacity-10 text-[6rem] md:text-[8rem] font-black select-none pointer-events-none">📅</div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 md:p-6 rounded-t-2xl text-white flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <h2 className="text-lg md:text-xl font-semibold">Form Event / Kegiatan</h2>
        </div>
        <form className="p-4 md:p-6 space-y-4" onSubmit={handleSubmit} onReset={handleReset}>
          {success && (
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded-xl mb-4 animate-fade-in">
              <strong>Berhasil!</strong> Event/kegiatan telah berhasil ditambahkan ke sistem.
            </div>
          )}
          {apiError && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded-xl mb-4 animate-fade-in">
              <strong>Error:</strong> {apiError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Nama Event/Kegiatan <span className="text-red-500">*</span></label>
              <input type="text" name="namaEvent" value={form.namaEvent} onChange={handleChange} required className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Contoh: Rapat Evaluasi Bulanan" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Jenis Kegiatan <span className="text-red-500">*</span></label>
              <select name="jenisKegiatan" value={form.jenisKegiatan} onChange={handleChange} required className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <option value="">Pilih jenis kegiatan</option>
                <option value="rapat">Rapat</option>
                <option value="pelatihan">Pelatihan</option>
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="evaluasi">Evaluasi</option>
                <option value="sosialisasi">Sosialisasi</option>
                <option value="pemeriksaan">Pemeriksaan Kesehatan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input type="date" name="tanggalMulai" value={form.tanggalMulai} onChange={handleChange} min={today} required className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Tanggal Selesai</label>
              <input type="date" name="tanggalSelesai" value={form.tanggalSelesai || ''} onChange={handleChange} min={form.tanggalMulai || today} className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Waktu Mulai <span className="text-red-500">*</span></label>
              <input type="time" name="waktuMulai" value={form.waktuMulai} onChange={handleChange} required className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Waktu Selesai</label>
              <input type="time" name="waktuSelesai" value={form.waktuSelesai} onChange={handleChange} className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Lokasi <span className="text-red-500">*</span></label>
              <select name="lokasi" value={form.lokasi} onChange={handleChange} required className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <option value="">Pilih lokasi</option>
                <option value="ruang-rapat-utama">Ruang Rapat Utama</option>
                <option value="aula-rsud">Aula RSUD</option>
                <option value="ruang-meeting-1">Ruang Meeting 1</option>
                <option value="ruang-meeting-2">Ruang Meeting 2</option>
                <option value="ruang-pelatihan">Ruang Pelatihan</option>
                <option value="auditorium">Auditorium</option>
                <option value="ruang-direktur">Ruang Direktur</option>
                <option value="online">Online/Virtual</option>
                <option value="eksternal">Lokasi Eksternal</option>
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Kapasitas Peserta</label>
              <input type="number" name="kapasitas" value={form.kapasitas || ''} onChange={handleChange} min={1} className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Jumlah maksimal peserta" />
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="font-semibold text-gray-700">Detail Lokasi/Alamat</label>
              <input type="text" name="lokasiDetail" value={form.lokasiDetail || ''} onChange={handleChange} className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Alamat lengkap jika lokasi eksternal atau detail ruangan" />
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="font-semibold text-gray-700">Penanggung Jawab <span className="text-red-500">*</span></label>
              <input type="text" name="penanggungJawab" value={form.penanggungJawab} onChange={handleChange} required className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Nama penanggung jawab kegiatan" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Kontak Penanggung Jawab</label>
              <input type="text" name="kontak" value={form.kontak} onChange={handleChange} className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="No. telepon atau email" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Departemen/Unit</label>
              <select name="departemen" value={form.departemen} onChange={handleChange} className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <option value="">Pilih departemen</option>
                <option value="medis">Pelayanan Medis</option>
                <option value="keperawatan">Keperawatan</option>
                <option value="administrasi">Administrasi</option>
                <option value="keuangan">Keuangan</option>
                <option value="sdm">SDM</option>
                <option value="farmasi">Farmasi</option>
                <option value="laboratorium">Laboratorium</option>
                <option value="radiologi">Radiologi</option>
                <option value="gizi">Gizi</option>
                <option value="kebersihan">Kebersihan</option>
                <option value="keamanan">Keamanan</option>
                <option value="it">IT</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="font-semibold text-gray-700">Tingkat Prioritas</label>
              <div className="flex gap-2 flex-wrap">
                {['rendah', 'sedang', 'tinggi', 'urgent'].map((prio) => (
                  <label key={prio} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-150 ${form.prioritas === prio ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-200 bg-gray-50'}`}>
                    <input type="radio" name="prioritas" value={prio} checked={form.prioritas === prio} onChange={handleRadio} className="border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                    {prio.charAt(0).toUpperCase() + prio.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="font-semibold text-gray-700">Target Peserta</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'dokter', label: 'Dokter' },
                  { value: 'perawat', label: 'Perawat' },
                  { value: 'admin', label: 'Staff Administrasi' },
                  { value: 'manajemen', label: 'Manajemen' },
                  { value: 'semua', label: 'Semua Staff' },
                ].map((item) => (
                  <label key={item.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-150 ${form.targetPeserta.includes(item.value) ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-200 bg-gray-50'}`}>
                    <input type="checkbox" name="targetPeserta" value={item.value} checked={form.targetPeserta.includes(item.value)} onChange={handleChange} className="border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Anggaran (Rp)</label>
              <input type="number" name="anggaran" value={form.anggaran || ''} onChange={handleChange} min={0} className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="0" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-gray-700">Status <span className="text-red-500">*</span></label>
              <select name="status" value={form.status} onChange={handleChange} required className="input border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <option value="draft">Draft</option>
                <option value="direncanakan">Direncanakan</option>
                <option value="disetujui">Disetujui</option>
                <option value="berlangsung">Berlangsung</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <label className="font-semibold text-gray-700">
              Deskripsi Kegiatan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              required
              className="input min-h-[80px] border-2 border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              placeholder="Jelaskan detail kegiatan, tujuan, dan agenda yang akan dilaksanakan..."
            />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <label className="font-semibold text-gray-700">Catatan Tambahan</label>
            <textarea name="catatan" value={form.catatan} onChange={handleChange} className="input min-h-[60px] border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Catatan khusus, persiapan yang diperlukan, atau informasi penting lainnya..." />
          </div>
          <div className="flex gap-4 justify-end mt-8 pt-6 border-t">
            <button type="reset" className="btn btn-secondary bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">Reset</button>
            <button type="submit" className="btn btn-primary bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition shadow-lg" disabled={isSubmitting}>{isSubmitting ? (eventId ? 'Menyimpan Perubahan...' : 'Menyimpan...') : (eventId ? 'Simpan Perubahan' : 'Simpan Event')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;

// Add some basic Tailwind CSS for .input if not already present in your global styles:
// .input { @apply border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50; }