'use client';

import React from 'react';
import { X, Clock, MapPin, User, Calendar, Users } from 'lucide-react';

interface Shift {
  id: number;
  idpegawai?: string;
  nama: string;
  tanggal: string;
  lokasishift: string;
  jammulai: string;
  jamselesai: string;
  tipeshift: string;
  userId?: number;
  user?: any;
  originalDate?: string;
}

interface DayShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  shifts: Shift[];
  onShiftClick?: (shift: Shift) => void;
}

const DayShiftModal: React.FC<DayShiftModalProps> = ({
  isOpen,
  onClose,
  date,
  shifts,
  onShiftClick
}) => {
  if (!isOpen || !date) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType?.toLowerCase()) {
      case 'pagi':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'siang':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'malam':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'emergency':
      case 'darurat':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sortedShifts = shifts.sort((a, b) => {
    const timeA = a.jammulai.replace(':', '');
    const timeB = b.jammulai.replace(':', '');
    return timeA.localeCompare(timeB);
  });

  const groupedByLocation = sortedShifts.reduce((acc, shift) => {
    if (!acc[shift.lokasishift]) {
      acc[shift.lokasishift] = [];
    }
    acc[shift.lokasishift].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Jadwal Shift
              </h2>
              <p className="text-sm text-gray-600">
                {formatDate(date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {shifts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak Ada Jadwal
              </h3>
              <p className="text-gray-600">
                Tidak ada jadwal shift untuk tanggal ini.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Shift</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">{shifts.length}</div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Pegawai</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {new Set(shifts.map(s => s.nama)).size}
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Lokasi</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    {Object.keys(groupedByLocation).length}
                  </div>
                </div>
              </div>

              {/* Shifts by Location */}
              <div className="space-y-4">
                {Object.entries(groupedByLocation).map(([location, locationShifts]) => (
                  <div key={location} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">{location}</h3>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                          {locationShifts.length} shift
                        </span>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {locationShifts.map((shift, index) => (
                        <div
                          key={index}
                          onClick={() => onShiftClick?.(shift)}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              
                              <div>
                                <div className="font-medium text-gray-900">{shift.nama}</div>
                                <div className="text-sm text-gray-500">
                                  {shift.idpegawai ? `ID: ${shift.idpegawai}` : 'ID tidak tersedia'}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{shift.jammulai} - {shift.jamselesai}</span>
                              </div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getShiftTypeColor(shift.tipeshift)}`}>
                              {shift.tipeshift}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayShiftModal;
