'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  User, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  XCircle,
  Filter,
  Search,
  Download,
  Eye,
  FileText,
  Activity
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  userId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'REQUEST';
  entityType: 'SHIFT' | 'OVERTIME' | 'LEAVE' | 'SWAP' | 'USER';
  entityId: string;
  oldData?: any;
  newData?: any;
  reason?: string;
  timestamp: string;
  user: {
    namaDepan: string;
    namaBelakang: string;
    username: string;
  };
}

interface AuditTrailProps {
  entityType?: string;
  entityId?: string;
  userId?: number;
  maxEntries?: number;
}

export default function AuditTrail({ 
  entityType, 
  entityId, 
  userId, 
  maxEntries = 50 
}: AuditTrailProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<{
    action: string;
    entityType: string;
    dateRange: string;
    user: string;
  }>({
    action: 'ALL',
    entityType: 'ALL',
    dateRange: '7',
    user: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for demonstration
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      userId: 1,
      action: 'CREATE',
      entityType: 'SHIFT',
      entityId: 'shift-001',
      newData: {
        tanggal: '2025-02-01',
        shiftType: 'PAGI',
        lokasi: 'Ruang ICU',
        userId: 5
      },
      reason: 'Membuat jadwal shift baru',
      timestamp: '2025-01-28T10:30:00Z',
      user: {
        namaDepan: 'Dr. Admin',
        namaBelakang: 'Manager',
        username: 'admin.manager'
      }
    },
    {
      id: '2',
      userId: 2,
      action: 'UPDATE',
      entityType: 'SHIFT',
      entityId: 'shift-001',
      oldData: {
        tanggal: '2025-02-01',
        shiftType: 'PAGI',
        lokasi: 'Ruang ICU',
        userId: 5
      },
      newData: {
        tanggal: '2025-02-01',
        shiftType: 'SIANG',
        lokasi: 'Ruang ICU',
        userId: 5
      },
      reason: 'Mengubah shift dari pagi ke siang karena permintaan pegawai',
      timestamp: '2025-01-28T14:15:00Z',
      user: {
        namaDepan: 'Supervisor',
        namaBelakang: 'Nurse',
        username: 'supervisor.nurse'
      }
    },
    {
      id: '3',
      userId: 3,
      action: 'APPROVE',
      entityType: 'OVERTIME',
      entityId: 'overtime-001',
      newData: {
        hoursRequested: 4,
        hoursApproved: 4,
        reason: 'Emergency case'
      },
      reason: 'Menyetujui permintaan lembur karena kondisi darurat',
      timestamp: '2025-01-28T16:45:00Z',
      user: {
        namaDepan: 'Head',
        namaBelakang: 'Doctor',
        username: 'head.doctor'
      }
    },
    {
      id: '4',
      userId: 1,
      action: 'DELETE',
      entityType: 'SHIFT',
      entityId: 'shift-002',
      oldData: {
        tanggal: '2025-02-02',
        shiftType: 'MALAM',
        lokasi: 'Ruang IGD',
        userId: 7
      },
      reason: 'Menghapus shift karena pegawai sakit',
      timestamp: '2025-01-28T18:20:00Z',
      user: {
        namaDepan: 'Dr. Admin',
        namaBelakang: 'Manager',
        username: 'admin.manager'
      }
    },
    {
      id: '5',
      userId: 4,
      action: 'REQUEST',
      entityType: 'LEAVE',
      entityId: 'leave-001',
      newData: {
        leaveType: 'ANNUAL_LEAVE',
        startDate: '2025-02-10',
        endDate: '2025-02-12',
        totalDays: 3
      },
      reason: 'Mengajukan cuti tahunan',
      timestamp: '2025-01-28T09:00:00Z',
      user: {
        namaDepan: 'John',
        namaBelakang: 'Doe',
        username: 'john.doe'
      }
    }
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [entityType, entityId, userId, filter]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock data based on props and filters
      let filteredLogs = mockAuditLogs;
      
      if (entityType) {
        filteredLogs = filteredLogs.filter(log => log.entityType === entityType);
      }
      
      if (entityId) {
        filteredLogs = filteredLogs.filter(log => log.entityId === entityId);
      }
      
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }
      
      if (filter.action !== 'ALL') {
        filteredLogs = filteredLogs.filter(log => log.action === filter.action);
      }
      
      if (filter.entityType !== 'ALL') {
        filteredLogs = filteredLogs.filter(log => log.entityType === filter.entityType);
      }
      
      if (searchQuery) {
        filteredLogs = filteredLogs.filter(log => 
          `${log.user.namaDepan} ${log.user.namaBelakang}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setAuditLogs(filteredLogs.slice(0, maxEntries));
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'APPROVE': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECT': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'REQUEST': return <FileText className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      case 'APPROVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECT': return 'bg-red-100 text-red-800 border-red-200';
      case 'REQUEST': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'SHIFT': return <Calendar className="w-4 h-4" />;
      case 'OVERTIME': return <Clock className="w-4 h-4" />;
      case 'LEAVE': return <Calendar className="w-4 h-4" />;
      case 'SWAP': return <History className="w-4 h-4" />;
      case 'USER': return <User className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionDescription = (log: AuditLogEntry) => {
    const actions = {
      CREATE: 'membuat',
      UPDATE: 'mengubah',
      DELETE: 'menghapus',
      APPROVE: 'menyetujui',
      REJECT: 'menolak',
      REQUEST: 'mengajukan'
    };

    const entities = {
      SHIFT: 'jadwal shift',
      OVERTIME: 'permintaan lembur',
      LEAVE: 'permintaan cuti',
      SWAP: 'tukar shift',
      USER: 'data pengguna'
    };

    return `${actions[log.action as keyof typeof actions]} ${entities[log.entityType as keyof typeof entities]}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">📋 Log Perubahan Jadwal</h3>
              <p className="text-sm text-gray-600">
                Riwayat semua perubahan dan aktivitas sistem
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {auditLogs.length} dari {maxEntries} entri
            </span>
            <button
              onClick={loadAuditLogs}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, aksi, atau alasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filter.action}
              onChange={(e) => setFilter({...filter, action: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Semua Aksi</option>
              <option value="CREATE">Buat</option>
              <option value="UPDATE">Ubah</option>
              <option value="DELETE">Hapus</option>
              <option value="APPROVE">Setujui</option>
              <option value="REJECT">Tolak</option>
              <option value="REQUEST">Ajukan</option>
            </select>

            <select
              value={filter.entityType}
              onChange={(e) => setFilter({...filter, entityType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="SHIFT">Jadwal Shift</option>
              <option value="OVERTIME">Lembur</option>
              <option value="LEAVE">Cuti</option>
              <option value="SWAP">Tukar Shift</option>
              <option value="USER">Pengguna</option>
            </select>

            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat log audit...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada log audit ditemukan</p>
            <p className="text-gray-400 text-sm">Aktivitas sistem akan muncul di sini</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                          {getEntityIcon(log.entityType)}
                          {log.entityType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedEntry(log);
                            setShowDetails(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-900 mb-1">
                      <span className="font-medium">{log.user.namaDepan} {log.user.namaBelakang}</span>
                      {' '}
                      <span className="text-gray-600">{getActionDescription(log)}</span>
                      {' '}
                      <span className="font-mono text-sm text-gray-500">#{log.entityId}</span>
                    </p>

                    {log.reason && (
                      <p className="text-sm text-gray-600 italic">
                        "{log.reason}"
                      </p>
                    )}

                    {/* Data preview */}
                    {(log.oldData || log.newData) && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        {log.action === 'UPDATE' && log.oldData && log.newData && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-medium text-red-700 mb-1">Data Lama:</p>
                              <pre className="text-red-600 bg-red-50 p-2 rounded border">
                                {JSON.stringify(log.oldData, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="font-medium text-green-700 mb-1">Data Baru:</p>
                              <pre className="text-green-600 bg-green-50 p-2 rounded border">
                                {JSON.stringify(log.newData, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                        {log.action !== 'UPDATE' && log.newData && (
                          <div className="text-xs">
                            <p className="font-medium text-gray-700 mb-1">Data:</p>
                            <pre className="text-gray-600 bg-white p-2 rounded border">
                              {JSON.stringify(log.newData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetails && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Detail Log Audit</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Log</label>
                    <p className="font-mono text-sm">{selectedEntry.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm">{new Date(selectedEntry.timestamp).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="text-sm">{selectedEntry.user.namaDepan} {selectedEntry.user.namaBelakang} ({selectedEntry.user.username})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aksi</label>
                    <p className="text-sm">{selectedEntry.action} {selectedEntry.entityType}</p>
                  </div>
                </div>
                
                {selectedEntry.reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg border">{selectedEntry.reason}</p>
                  </div>
                )}

                {selectedEntry.oldData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Lama</label>
                    <pre className="text-xs bg-red-50 border border-red-200 p-3 rounded-lg overflow-auto">
                      {JSON.stringify(selectedEntry.oldData, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedEntry.newData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Baru</label>
                    <pre className="text-xs bg-green-50 border border-green-200 p-3 rounded-lg overflow-auto">
                      {JSON.stringify(selectedEntry.newData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
