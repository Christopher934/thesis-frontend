'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, User, Calendar, Mail, Phone } from 'lucide-react';

interface OvertimeRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    requestDate: string;
    overtimeDate: string;
    shiftType: string;
    originalShift: string;
    requestedHours: number;
    reason: string;
    urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED';
    currentApprovalLevel: number;
    requiredApprovalLevels: number;
    approvalHistory: ApprovalStep[];
    comments: string;
    attachments?: string[];
}

interface ApprovalStep {
    level: number;
    approverName: string;
    approverRole: string;
    action: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp?: string;
    comments?: string;
    approvedHours?: number;
}

interface OvertimeRequestSystemProps {
    userRole?: 'ADMIN' | 'SUPERVISOR' | 'MANAGER' | 'HR';
    onRequestUpdate?: (request: OvertimeRequest) => void;
}

const OvertimeRequestSystem: React.FC<OvertimeRequestSystemProps> = ({
    userRole = 'ADMIN',
    onRequestUpdate
}) => {
    const [requests, setRequests] = useState<OvertimeRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
    const [showNewRequestForm, setShowNewRequestForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
    const [loading, setLoading] = useState(true);

    // Mock data - In production, this would come from API
    useEffect(() => {
        const mockRequests: OvertimeRequest[] = [
            {
                id: 'OT001',
                employeeId: 'DOK001',
                employeeName: 'Dr. Ahmad Susanto',
                employeeRole: 'DOKTER',
                requestDate: '2025-07-28',
                overtimeDate: '2025-07-30',
                shiftType: 'MALAM',
                originalShift: 'PAGI (07:00-15:00)',
                requestedHours: 8,
                reason: 'Kekurangan dokter jaga malam karena Dr. Budi sedang cuti sakit. Dibutuhkan untuk menutup shift malam agar pelayanan tetap optimal.',
                urgencyLevel: 'HIGH',
                status: 'PENDING',
                currentApprovalLevel: 1,
                requiredApprovalLevels: 2,
                approvalHistory: [
                    {
                        level: 1,
                        approverName: 'Dr. Sarah Wijaya',
                        approverRole: 'SUPERVISOR',
                        action: 'PENDING'
                    },
                    {
                        level: 2,
                        approverName: 'Dr. Andi Prasetyo',
                        approverRole: 'MANAGER',
                        action: 'PENDING'
                    }
                ],
                comments: 'Mohon dipertimbangkan karena situasi darurat'
            },
            {
                id: 'OT002',
                employeeId: 'PER001',
                employeeName: 'Ns. Sarah Wijaya',
                employeeRole: 'PERAWAT',
                requestDate: '2025-07-27',
                overtimeDate: '2025-07-29',
                shiftType: 'SIANG',
                originalShift: 'PAGI (07:00-15:00)',
                requestedHours: 4,
                reason: 'Membantu menangani pasien yang meningkat di ruang ICU. Diperlukan tenaga tambahan untuk memastikan kualitas pelayanan.',
                urgencyLevel: 'MEDIUM',
                status: 'APPROVED',
                currentApprovalLevel: 2,
                requiredApprovalLevels: 2,
                approvalHistory: [
                    {
                        level: 1,
                        approverName: 'Ns. Maya Sari',
                        approverRole: 'SUPERVISOR',
                        action: 'APPROVED',
                        timestamp: '2025-07-27 14:30',
                        comments: 'Disetujui, ICU memang membutuhkan tambahan tenaga',
                        approvedHours: 4
                    },
                    {
                        level: 2,
                        approverName: 'Dr. Andi Prasetyo',
                        approverRole: 'MANAGER',
                        action: 'APPROVED',
                        timestamp: '2025-07-27 16:15',
                        comments: 'Approved dengan catatan maksimal 4 jam',
                        approvedHours: 4
                    }
                ],
                comments: 'Terima kasih atas persetujuannya'
            },
            {
                id: 'OT003',
                employeeId: 'PER002',
                employeeName: 'Ns. Budi Hartono',
                employeeRole: 'PERAWAT',
                requestDate: '2025-07-26',
                overtimeDate: '2025-07-28',
                shiftType: 'MALAM',
                originalShift: 'TIDAK ADA',
                requestedHours: 12,
                reason: 'Permintaan overtime untuk shift malam tambahan. Kebutuhan mendesak karena ada perawat yang mendadak tidak bisa masuk.',
                urgencyLevel: 'CRITICAL',
                status: 'REJECTED',
                currentApprovalLevel: 1,
                requiredApprovalLevels: 2,
                approvalHistory: [
                    {
                        level: 1,
                        approverName: 'Ns. Maya Sari',
                        approverRole: 'SUPERVISOR',
                        action: 'REJECTED',
                        timestamp: '2025-07-26 10:45',
                        comments: 'Ditolak karena sudah melebihi batas jam kerja bulanan. Mohon cari alternatif lain.'
                    }
                ],
                comments: 'Mendesak, mohon dipertimbangkan kembali'
            }
        ];

        setRequests(mockRequests);
        setLoading(false);
    }, []);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'LOW': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'HIGH': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'CRITICAL': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'APPROVED': return 'text-green-600 bg-green-100 border-green-200';
            case 'REJECTED': return 'text-red-600 bg-red-100 border-red-200';
            case 'PARTIALLY_APPROVED': return 'text-purple-600 bg-purple-100 border-purple-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
            case 'REJECTED': return <XCircle className="w-4 h-4" />;
            case 'PARTIALLY_APPROVED': return <AlertCircle className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const handleApproval = (requestId: string, action: 'APPROVED' | 'REJECTED', comments?: string, approvedHours?: number) => {
        setRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                const updatedApprovalHistory = req.approvalHistory.map(step => {
                    if (step.level === req.currentApprovalLevel && step.action === 'PENDING') {
                        return {
                            ...step,
                            action,
                            timestamp: new Date().toLocaleString(),
                            comments,
                            approvedHours
                        };
                    }
                    return step;
                });

                let newStatus = req.status;
                let newCurrentLevel = req.currentApprovalLevel;

                if (action === 'REJECTED') {
                    newStatus = 'REJECTED';
                } else if (action === 'APPROVED') {
                    if (req.currentApprovalLevel < req.requiredApprovalLevels) {
                        newCurrentLevel = req.currentApprovalLevel + 1;
                        newStatus = 'PENDING';
                    } else {
                        newStatus = approvedHours && approvedHours < req.requestedHours ? 'PARTIALLY_APPROVED' : 'APPROVED';
                    }
                }

                return {
                    ...req,
                    status: newStatus,
                    currentApprovalLevel: newCurrentLevel,
                    approvalHistory: updatedApprovalHistory
                };
            }
            return req;
        }));
    };

    const filteredRequests = requests.filter(req => {
        const statusMatch = filterStatus === 'ALL' || req.status === filterStatus;
        const urgencyMatch = filterUrgency === 'ALL' || req.urgencyLevel === filterUrgency;
        return statusMatch && urgencyMatch;
    });

    const requestCounts = {
        total: requests.length,
        pending: requests.filter(req => req.status === 'PENDING').length,
        approved: requests.filter(req => req.status === 'APPROVED').length,
        rejected: requests.filter(req => req.status === 'REJECTED').length
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Clock className="w-6 h-6 mr-3 text-purple-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Overwork Request & Approval</h2>
                                <p className="text-sm text-gray-600">Kelola permintaan overtime dan proses persetujuan</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowNewRequestForm(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Buat Request Baru</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">{requestCounts.total}</div>
                                    <div className="text-sm text-gray-600">Total Request</div>
                                </div>
                                <FileText className="w-8 h-8 text-gray-600" />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{requestCounts.pending}</div>
                                    <div className="text-sm text-blue-700">Menunggu Approval</div>
                                </div>
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{requestCounts.approved}</div>
                                    <div className="text-sm text-green-700">Disetujui</div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-red-600">{requestCounts.rejected}</div>
                                    <div className="text-sm text-red-700">Ditolak</div>
                                </div>
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="PARTIALLY_APPROVED">Partially Approved</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                            <select
                                value={filterUrgency}
                                onChange={(e) => setFilterUrgency(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="ALL">Semua Urgency</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                    </div>

                    {/* Request List */}
                    <div className="space-y-4">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-2 rounded-full border ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-800">Request #{request.id}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgencyLevel)}`}>
                                                    {request.urgencyLevel}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div><strong>Pegawai:</strong> {request.employeeName} ({request.employeeRole})</div>
                                                <div><strong>Tanggal Overtime:</strong> {request.overtimeDate}</div>
                                                <div><strong>Jam Diminta:</strong> {request.requestedHours} jam ({request.shiftType})</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 mb-2">
                                            Level {request.currentApprovalLevel} dari {request.requiredApprovalLevels}
                                        </div>
                                        <button
                                            onClick={() => setSelectedRequest(request)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Detail
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                    <h4 className="font-medium text-gray-700 mb-1">Alasan:</h4>
                                    <p className="text-sm text-gray-600">{request.reason}</p>
                                </div>

                                {/* Approval Progress */}
                                <div className="flex items-center space-x-4">
                                    {request.approvalHistory.map((step, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                                step.action === 'APPROVED' ? 'bg-green-100 border-green-500 text-green-600' :
                                                step.action === 'REJECTED' ? 'bg-red-100 border-red-500 text-red-600' :
                                                step.action === 'PENDING' && step.level === request.currentApprovalLevel ? 'bg-blue-100 border-blue-500 text-blue-600' :
                                                'bg-gray-100 border-gray-300 text-gray-400'
                                            }`}>
                                                <span className="text-xs font-bold">{step.level}</span>
                                            </div>
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-700">{step.approverName}</div>
                                                <div className="text-gray-500">{step.approverRole}</div>
                                            </div>
                                            {index < request.approvalHistory.length - 1 && (
                                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons for Pending Requests */}
                                {request.status === 'PENDING' && (
                                    <div className="mt-4 flex items-center space-x-2">
                                        <button
                                            onClick={() => handleApproval(request.id, 'APPROVED', 'Disetujui', request.requestedHours)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleApproval(request.id, 'REJECTED', 'Ditolak karena tidak sesuai kebijakan')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApproval(request.id, 'APPROVED', 'Disetujui sebagian', Math.floor(request.requestedHours / 2))}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                                        >
                                            Partial Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">Detail Request #{selectedRequest.id}</h3>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Employee Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-3">Informasi Pegawai</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Nama:</span>
                                        <div className="font-medium">{selectedRequest.employeeName}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">ID:</span>
                                        <div className="font-medium">{selectedRequest.employeeId}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Role:</span>
                                        <div className="font-medium">{selectedRequest.employeeRole}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Tanggal Request:</span>
                                        <div className="font-medium">{selectedRequest.requestDate}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-3">Detail Overtime</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Tanggal Overtime:</span>
                                        <div className="font-medium">{selectedRequest.overtimeDate}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Shift Diminta:</span>
                                        <div className="font-medium">{selectedRequest.shiftType}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Shift Asli:</span>
                                        <div className="font-medium">{selectedRequest.originalShift}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Jam Diminta:</span>
                                        <div className="font-medium">{selectedRequest.requestedHours} jam</div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Alasan Permintaan</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700">{selectedRequest.reason}</p>
                                </div>
                            </div>

                            {/* Approval Timeline */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Timeline Approval</h4>
                                <div className="space-y-3">
                                    {selectedRequest.approvalHistory.map((step, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                                step.action === 'APPROVED' ? 'bg-green-100 border-green-500 text-green-600' :
                                                step.action === 'REJECTED' ? 'bg-red-100 border-red-500 text-red-600' :
                                                step.action === 'PENDING' && step.level === selectedRequest.currentApprovalLevel ? 'bg-blue-100 border-blue-500 text-blue-600' :
                                                'bg-gray-100 border-gray-300 text-gray-400'
                                            }`}>
                                                <span className="text-xs font-bold">{step.level}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-700">{step.approverName}</div>
                                                        <div className="text-sm text-gray-500">{step.approverRole}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.action)}`}>
                                                            {step.action}
                                                        </div>
                                                        {step.timestamp && (
                                                            <div className="text-xs text-gray-500 mt-1">{step.timestamp}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {step.comments && (
                                                    <div className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                                                        {step.comments}
                                                    </div>
                                                )}
                                                {step.approvedHours && (
                                                    <div className="mt-1 text-sm text-green-600">
                                                        Disetujui: {step.approvedHours} jam
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OvertimeRequestSystem;
