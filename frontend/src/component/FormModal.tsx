'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PegawaiForm from '@/app/(dashboard)/list/pegawai/CreatePegawaiForm';
import JadwalForm from '@/component/forms/JadwalForm';
import TukarShiftForm from '@/component/forms/TukarShiftForm';

type CommonFormProps = {
  type: 'create' | 'update';
  data?: any;
  onClose: () => void;
  onCreate: (newData: any) => void;
  onUpdate?: (updatedData: any) => void;
};

// Mapping “table” ke komponen form-nya
const forms: {
  [key in 'pegawai' | 'jadwal' | 'tukarshift']: React.ComponentType<CommonFormProps>;
} = {
  pegawai: PegawaiForm,
  jadwal: JadwalForm,
  tukarshift: TukarShiftForm,
};

type FormModalProps = {
  table: 'pegawai' | 'jadwal' | 'tukarshift';
  type: 'create' | 'update' | 'delete';
  data?: any;
  id?: string;
  nameLabel?: string;                   // Nama entitas untuk dialog delete
  onCreated: (newData: any) => void;
  onUpdated: (updatedData: any) => void;
  onDeleted: (deletedId: string) => void;
  renderTrigger?: boolean;              // render tombol trigger (ikon) atau tidak
  initialOpen?: boolean;                // buka modal otomatis saat mount
  onAfterClose?: () => void;            // callback untuk memberitahu parent agar unmount
};

export default function FormModal({
  table,
  type,
  data,
  id,
  nameLabel,
  onCreated,
  onUpdated,
  onDeleted,
  renderTrigger = true,
  initialOpen = false,
  onAfterClose,
}: FormModalProps) {
  // Ukuran dan warna background ikon sesuai tipe
  const size = type === 'create' ? 'w-8 h-8' : 'w-7 h-7';
  const bgColor =
    type === 'create'
      ? 'bg-gray-100'
      : type === 'update'
      ? 'bg-yellow-500'
      : 'bg-red-500';

  // State internal untuk membuka/menutup modal
  const [open, setOpen] = useState(false);

  // Jika parent meminta initialOpen=true, buka modal otomatis sekali ketika mount
  useEffect(() => {
    if (initialOpen) {
      setOpen(true);
    }
  }, [initialOpen]);

  // Fungsi untuk menutup modal: 
  // 1) tutup internal (`setOpen(false)`), 
  // 2) beri tahu parent via `onAfterClose()`
  const handleClose = () => {
    setOpen(false);
    if (onAfterClose) {
      onAfterClose();
    }
  };

  // Handler untuk delete
  const handleDelete = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Anda belum login.');

      const res = await fetch(`http://localhost:3004/${table}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Ambil pesan error kalau tersedia
        let msg = `Status ${res.status}`;
        try {
          const body = await res.json();
          msg = body.message || msg;
        } catch {
          // abaikan jika bukan JSON
        }
        throw new Error(`Gagal hapus data: ${msg}`);
      }

      onDeleted(id);
      handleClose(); // tutup modal dan beri tahu parent
    } catch (err: any) {
      console.error(err);
      // (Anda bisa tampilkan toast / state error di sini)
    }
  };

  // Render isi modal: konfirmasi delete atau form create/update
  const RenderForm = () => {
    if (type === 'delete' && id) {
      return (
        <form className="flex flex-col items-center p-4 gap-4">
          <span className="text-center font-medium">
            Data{' '}
            <span className="font-semibold uppercase">
              {nameLabel || `ID: ${id}`}
            </span>{' '}
            akan hilang secara permanen. Yakin ingin menghapus?
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 transition"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
            >
              Batal
            </button>
          </div>
        </form>
      );
    }

    if (type === 'create' || type === 'update') {
      const SelectedForm = forms[table];
      return (
        <SelectedForm
          type={type}
          data={data}
          onClose={handleClose}  // beri tahu form agar menutup modal
          onCreate={onCreated}
          onUpdate={onUpdated}
        />
      );
    }

    return <p className="p-4 text-center">Form tidak dikenali.</p>;
  };

  return (
    <>
      {/* Hanya render tombol ikon (trigger) jika renderTrigger=true */}
      {renderTrigger && (
        <button
          onClick={() => setOpen(true)}
          className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-90 transition`}
        >
          <Image src={`/${type}.png`} alt={type} width={16} height={16} />
        </button>
      )}

      {/* Render modal jika open=true */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-4 rounded-md relative w-full max-w-lg">
            <RenderForm />

            {/* Tombol “Close” di pojok kanan atas modal */}
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={handleClose}
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
