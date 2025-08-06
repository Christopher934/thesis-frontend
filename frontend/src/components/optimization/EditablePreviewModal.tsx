'use client';

import React from 'react';
import { Eye, X, CheckCircle, Calendar, Clock, MapPin, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';

interface EditablePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    editableData: any[];
    originalData: any;
    onEditItem: (itemId: number, field: string, value: any) => void;
    onDeleteItem: (itemId: number) => void;
    onRestoreItem: (itemId: number) => void;
    onConfirm: () => void;
    isConfirming?: boolean;
    users?: any[];
    scheduleType?: 'weekly' | 'monthly'; // Added to determine schedule type
}

const EditablePreviewModal: React.FC<EditablePreviewModalProps> = ({
    isOpen,
    onClose,
    editableData,
    originalData,
    onEditItem,
    onDeleteItem,
    onRestoreItem,
    onConfirm,
    isConfirming = false,
    users = [],
    scheduleType = 'weekly'
}) => {
    if (!isOpen) return null;

    // Debug log to check data flow
    console.log('EditablePreviewModal Debug:', {
        isOpen,
        editableDataLength: editableData?.length,
        originalData,
        scheduleType,
        usersLength: users?.length
    });

    const locations = ['ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 'LABORATORIUM', 'FARMASI', 'RADIOLOGI'];
    const shiftTypes = ['PAGI', 'SIANG', 'MALAM', 'ON_CALL', 'JAGA'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Eye className="w-6 h-6 text-blue-600" />
                                Preview & Edit Jadwal {scheduleType === 'weekly' ? 'Mingguan' : 'Bulanan'}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Review, edit, atau hapus jadwal {scheduleType === 'weekly' ? 'mingguan' : 'bulanan'} sebelum dibuat. Total: {editableData?.length || 0} jadwal
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Statistics Summary */}
                    {originalData?.statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {editableData?.length || 0}
                                </div>
                                <div className="text-sm text-blue-800">Total Jadwal</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {editableData?.filter(item => item.isEdited).length || 0}
                                </div>
                                <div className="text-sm text-green-800">Telah Diedit</div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">
                                    {(originalData?.preview?.length || 0) - (editableData?.length || 0)}
                                </div>
                                <div className="text-sm text-orange-800">Dihapus</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {Math.round(originalData.statistics?.fulfillmentRate || 0)}%
                                </div>
                                <div className="text-sm text-purple-800">Fulfillment Rate</div>
                            </div>
                        </div>
                    )}

                    {/* Debug Information */}
                    {(!editableData || editableData.length === 0) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Tidak ada data untuk ditampilkan
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>Kemungkinan penyebab:</p>
                                        <ul className="list-disc list-inside mt-1">
                                            <li>Konfigurasi jadwal belum sesuai</li>
                                            <li>Tidak ada pegawai yang tersedia untuk periode yang dipilih</li>
                                            <li>Error dalam komunikasi dengan server</li>
                                            <li>Data jadwal gagal dimuat dari backend</li>
                                        </ul>
                                        <p className="mt-2">
                                            <strong>Debug Info:</strong> editableData length = {editableData?.length || 0}, 
                                            originalData = {originalData ? 'exists' : 'null'}, 
                                            scheduleType = {scheduleType}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Editable Table */}
                    {editableData && editableData.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Pegawai</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Lokasi</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Shift</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Score</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {editableData.map((item, index) => (
                                            <tr key={item.id} className={`hover:bg-gray-50 ${item.isEdited ? 'bg-yellow-50' : ''}`}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {/* 🔥 FIX: Use multiple fallback strategies for employee name */}
                                                    {item.employeeName || 
                                                     users.find(u => u.id === (item.userId || item.employeeId))?.namaDepan + ' ' + users.find(u => u.id === (item.userId || item.employeeId))?.namaBelakang ||
                                                     users.find(u => u.id === (item.userId || item.employeeId))?.namaDepan ||
                                                     `User ${item.userId || item.employeeId || 'undefined'}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <input
                                                        type="date"
                                                        value={item.date}
                                                        onChange={(e) => onEditItem(item.id, 'date', e.target.value)}
                                                        className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <select
                                                        value={item.location}
                                                        onChange={(e) => onEditItem(item.id, 'location', e.target.value)}
                                                        className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        {locations.map(loc => (
                                                            <option key={loc} value={loc}>{loc}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <select
                                                        value={item.shiftType}
                                                        onChange={(e) => onEditItem(item.id, 'shiftType', e.target.value)}
                                                        className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        {shiftTypes.map(shift => (
                                                            <option key={shift} value={shift}>{shift}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`font-medium ${
                                                        item.score >= 80 ? 'text-green-600' :
                                                        item.score >= 60 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                        {item.score}/100
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {item.isEdited ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <Edit className="w-3 h-3 mr-1" />
                                                            Diedit
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Original
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        {item.isEdited && (
                                                            <button
                                                                onClick={() => onRestoreItem(item.id)}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                                title="Kembalikan ke original"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => onDeleteItem(item.id)}
                                                            className="text-red-600 hover:text-red-800 transition-colors"
                                                            title="Hapus dari jadwal"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada data jadwal untuk ditampilkan.</p>
                            <p className="text-sm mt-2">Silakan periksa konfigurasi atau coba lagi.</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{editableData?.length || 0}</span> jadwal akan dibuat
                            {editableData && editableData.filter(item => item.isEdited).length > 0 && (
                                <span className="ml-2 text-yellow-600">
                                    ({editableData.filter(item => item.isEdited).length} diedit)
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={(editableData?.length || 0) === 0 || isConfirming}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isConfirming ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        Membuat Jadwal...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Konfirmasi & Buat Jadwal ({editableData?.length || 0})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditablePreviewModal;
