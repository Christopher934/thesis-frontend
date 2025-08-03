'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Activity, 
  CheckCircle, 
  Clock,
  Calendar,
  User,
  FileText,
  AlertCircle
} from 'lucide-react';
import RequestManagement from '../../../components/RequestManagement';
import ShiftValidation, { ShiftValidationExample } from '../../../components/ShiftValidation';
import AuditTrail from '../../../components/AuditTrail';

export default function AdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<'validation' | 'requests' | 'audit' | 'overview'>('overview');

  const features = [
    {
      id: 'validation',
      title: 'Validasi Jadwal Real-Time',
      description: 'Sistem validasi otomatis untuk mencegah konflik jadwal dan overwork',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      status: 'active',
      benefits: [
        'Deteksi konflik jadwal secara real-time',
        'Pencegahan overwork dan burnout pegawai',
        'Validasi otomatis saat pembuatan jadwal',
        'Saran perbaikan untuk konflik yang ditemukan'
      ]
    },
    {
      id: 'requests',
      title: 'Request Management System',
      description: 'Kelola permintaan lembur, cuti, dan tukar shift dengan sistem approval',
      icon: <FileText className="w-8 h-8 text-green-600" />,
      status: 'active',
      benefits: [
        'Permintaan lembur dengan approval workflow',
        'Sistem cuti terintegrasi dengan kalender',
        'Tukar shift antar pegawai',
        'Notifikasi real-time untuk approval'
      ]
    },
    {
      id: 'audit',
      title: 'Audit Trail & Logging',
      description: 'Mencatat semua perubahan jadwal untuk transparansi dan akuntabilitas',
      icon: <Activity className="w-8 h-8 text-purple-600" />,
      status: 'active',
      benefits: [
        'Log semua perubahan jadwal',
        'Tracking siapa mengubah apa dan kapan',
        'Riwayat approval dan rejection',
        'Export laporan audit'
      ]
    }
  ];

  const stats = {
    totalValidations: 1247,
    conflictsDetected: 23,
    conflictsPrevented: 95.2,
    totalRequests: 156,
    pendingApprovals: 12,
    approvalRate: 89.1,
    auditEntries: 2341,
    systemUptime: 99.8
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🚀 Advanced Shift Management Features
              </h1>
              <p className="text-gray-600 mt-1">
                Fitur-fitur canggih untuk manajemen jadwal shift yang lebih efisien dan transparan
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Validasi Jadwal</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalValidations.toLocaleString()}</p>
                  <p className="text-xs text-green-600">↑ {stats.conflictsPrevented}% sukses</p>
                </div>
                <Shield className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                  <p className="text-xs text-blue-600">{stats.pendingApprovals} pending</p>
                </div>
                <FileText className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Audit Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.auditEntries.toLocaleString()}</p>
                  <p className="text-xs text-purple-600">100% tracked</p>
                </div>
                <Activity className="w-10 h-10 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.systemUptime}%</p>
                  <p className="text-xs text-green-600">Excellent</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: Settings },
                { id: 'validation', label: 'Validasi Real-Time', icon: Shield },
                { id: 'requests', label: 'Request Management', icon: FileText },
                { id: 'audit', label: 'Audit Trail', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    ✨ Fitur Advanced yang Tersedia
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                      <div key={feature.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          {feature.icon}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {feature.title}
                            </h3>
                            {feature.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                          {feature.description}
                        </p>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Benefits:</h4>
                          <ul className="space-y-1">
                            {feature.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <button
                          onClick={() => setActiveTab(feature.id as any)}
                          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Coba Fitur
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Implementation Status */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Status Implementasi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Frontend Components</h4>
                      <p className="text-sm text-gray-600">100% Complete</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-8 h-8 text-yellow-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Backend Services</h4>
                      <p className="text-sm text-gray-600">75% Complete</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Database Schema</h4>
                      <p className="text-sm text-gray-600">90% Complete</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded-full w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-100 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🚧 Next Steps:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Finalisasi database migration untuk model AuditLog, OvertimeRequest, LeaveRequest</li>
                      <li>• Implementasi API endpoints untuk request management</li>
                      <li>• Testing integrasi dengan sistem notifikasi</li>
                      <li>• Setup real-time validation dengan WebSocket</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'validation' && (
              <div>
                <ShiftValidationExample />
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <RequestManagement />
              </div>
            )}

            {activeTab === 'audit' && (
              <div>
                <AuditTrail maxEntries={50} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
