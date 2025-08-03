'use client';

import React, { useState, useMemo } from 'react';
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  Eye,
  MoreHorizontal,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ShiftData {
  id: number;
  nama: string;
  idpegawai: string;
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  tipeshift?: string;
  status?: string;
  priority?: string;
}

interface EnhancedShiftTableProps {
  data: ShiftData[];
  onEdit?: (shift: ShiftData) => void;
  onDelete?: (shiftId: number) => void;
  onView?: (shift: ShiftData) => void;
  loading?: boolean;
}

const EnhancedShiftTable: React.FC<EnhancedShiftTableProps> = ({
  data,
  onEdit,
  onDelete,
  onView,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterShiftType, setFilterShiftType] = useState('');
  const [sortField, setSortField] = useState<keyof ShiftData>('tanggal');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique values for filters
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(data.map(item => item.lokasishift))];
    return uniqueLocations.sort();
  }, [data]);

  const shiftTypes = useMemo(() => {
    const uniqueTypes = [...new Set(data.map(item => item.tipeshift).filter(Boolean))];
    return uniqueTypes.sort();
  }, [data]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = !searchTerm || 
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.idpegawai.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tanggal.includes(searchTerm);
      
      const matchesLocation = !filterLocation || item.lokasishift === filterLocation;
      const matchesShiftType = !filterShiftType || item.tipeshift === filterShiftType;
      
      return matchesSearch && matchesLocation && matchesShiftType;
    });

    // Sort data
    filtered.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      // Handle date sorting
      if (sortField === 'tanggal') {
        valueA = new Date(a.tanggal).getTime();
        valueB = new Date(b.tanggal).getTime();
      }

      // Handle time sorting
      if (sortField === 'jammulai' || sortField === 'jamselesai') {
        valueA = (valueA as string) || '';
        valueB = (valueB as string) || '';
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, filterLocation, filterShiftType, sortField, sortDirection]);

  const handleSort = (field: keyof ShiftData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    return time.substring(0, 5); // Format HH:MM
  };

  const formatLocation = (location: string) => {
    return location.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType?.toUpperCase()) {
      case 'PAGI':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SIANG':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MALAM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'CONFIRMED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama pegawai, ID, atau tanggal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Lokasi</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {formatLocation(location)}
                </option>
              ))}
            </select>

            <select
              value={filterShiftType}
              onChange={(e) => setFilterShiftType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Shift</option>
              {shiftTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan {filteredData.length} dari {data.length} shift
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('nama')}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Pegawai
                  {sortField === 'nama' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('tanggal')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tanggal
                  {sortField === 'tanggal' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('jammulai')}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Waktu
                  {sortField === 'jammulai' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('lokasishift')}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Lokasi
                  {sortField === 'lokasishift' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shift
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search className="w-8 h-8 mb-2 text-gray-300" />
                    <p className="text-sm">
                      {searchTerm || filterLocation || filterShiftType 
                        ? 'Tidak ada data yang sesuai dengan filter'
                        : 'Belum ada data shift'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr 
                  key={item.id}
                  className={`
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                    hover:bg-blue-50 transition-colors duration-150 ease-in-out
                    border-l-4 border-transparent hover:border-blue-400
                  `}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.nama}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          ID: {item.idpegawai}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatTime(item.jammulai)} - {formatTime(item.jamselesai)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {formatLocation(item.lokasishift)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.tipeshift && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getShiftTypeColor(item.tipeshift)}`}>
                        {item.tipeshift}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded transition-colors"
                          title="Edit shift"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                          title="Hapus shift"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with summary */}
      {filteredData.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{filteredData.length}</span> shift ditemukan
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>Pagi</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                <span>Siang</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Malam</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedShiftTable;
