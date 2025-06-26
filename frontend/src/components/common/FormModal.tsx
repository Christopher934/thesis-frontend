'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import PegawaiForm from '@/app/dashboard/list/pegawai/CreatePegawaiForm';
import JadwalForm from '@/components/forms/JadwalForm';
import TukarShiftForm from '@/components/forms/TukarShiftForm';
import { joinUrl } from '@/lib/urlUtils';

type CommonFormProps = {
  type: 'create' | 'update';
  data?: any;
  onClose: () => void;
  onCreate: (newData: any) => void;
  onUpdate?: (updatedData: any) => void;
};

// Mapping "table" ke komponen form-nya
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

  // Helper function to get the appropriate icon based on type
  const getIcon = () => {
    switch (type) {
      case 'create':
        return <Plus size={16} className="text-gray-600" />;
      case 'update':
        return <Edit size={16} className="text-white" />;
      case 'delete':
        return <Trash2 size={16} className="text-white" />;
      default:
        return <Plus size={16} className="text-gray-600" />;
    }
  };

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

      // Use the real API
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      let endpoint = '';
      if (table === 'pegawai') {
        endpoint = '/users/' + id; // gunakan endpoint UserController
      } else if (table === 'jadwal') {
        endpoint = '/shifts/' + id; // gunakan endpoint ShiftController
      } else {
        endpoint = '/' + table + 's/' + id;
      }
      const url = joinUrl(apiUrl, endpoint);

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`API request failed with status ${res.status}: ${errorData}`);
      }
      // In either case, we notify the parent component
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
      
      // Prepare data for form, ensure we use originalDate for editing if available
      const formData = type === 'update' && data?.originalDate 
        ? {...data, tanggal: data.originalDate} 
        : data;
      
      return (
        <SelectedForm
          type={type}
          data={formData}
          onClose={handleClose}
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
          {getIcon()}
        </button>
      )}

      {/* Render modal jika open=true */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className={`bg-white rounded-md relative w-full ${
            table === 'tukarshift' 
              ? 'max-w-5xl max-h-[95vh] overflow-y-auto p-2 sm:p-4' 
              : 'max-w-lg p-4'
          }`}>
            <RenderForm />

            {/* Tombol "Close" di pojok kanan atas modal */}
            <div
              className="absolute top-2 right-2 sm:top-4 sm:right-4 cursor-pointer z-10 bg-white rounded-full p-1 shadow-md"
              onClick={handleClose}
            >
              <X size={14} className="text-gray-600" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}