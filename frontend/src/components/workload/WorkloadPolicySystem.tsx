'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, AlertTriangle, Settings, Clock, User } from 'lucide-react';

interface WorkloadPolicy {
    id: number;
    name: string;
    description: string;
    rules: {
        maxShiftsPerMonth: number;
        maxHoursPerMonth: number;
        maxConsecutiveDays: number;
        maxNightShiftsPerWeek: number;
        minRestHoursBetweenShifts: number;
        allowOvertime: boolean;
        requiresApproval: boolean;
    };
    appliesTo: string[];
    isActive: boolean;
    createdBy: string;
    lastModified: string;
}

interface EmployeeLimit {
    employeeId: string;
    name: string;
    role: string;
    currentShifts: number;
    currentHours: number;
    consecutiveDays: number;
    status: 'AVAILABLE' | 'NEAR_LIMIT' | 'AT_LIMIT' | 'BLOCKED' | 'REQUIRES_APPROVAL';
    blockedReasons: string[];
    canRequestOvertime: boolean;
    pendingOvertimeRequests: number;
}

interface WorkloadPolicySystemProps {
    onPolicyUpdate?: (policy: WorkloadPolicy) => void;
    showEmployeeStatus?: boolean;
}

const WorkloadPolicySystem: React.FC<WorkloadPolicySystemProps> = ({
    onPolicyUpdate,
    showEmployeeStatus = true
}) => {
    const [policies, setPolicies] = useState<WorkloadPolicy[]>([]);
    const [employeeLimits, setEmployeeLimits] = useState<EmployeeLimit[]>([]);
    const [selectedPolicy, setSelectedPolicy] = useState<WorkloadPolicy | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Mock data - In production, this would come from API
    useEffect(() => {
        const mockPolicies: WorkloadPolicy[] = [
            {
                id: 1,
                name: 'Kebijakan Dokter',
                description: 'Aturan khusus untuk dokter dengan batas shift yang ketat',
                rules: {
                    maxShiftsPerMonth: 20,
                    maxHoursPerMonth: 160,
                    maxConsecutiveDays: 5,
                    maxNightShiftsPerWeek: 2,
                    minRestHoursBetweenShifts: 12,
                    allowOvertime: true,
                    requiresApproval: true
                },
                appliesTo: ['DOKTER'],
                isActive: true,
                createdBy: 'Admin System',
                lastModified: '2025-07-28'
            },
            {
                id: 2,
                name: 'Kebijakan Perawat',
                description: 'Aturan untuk perawat dengan fleksibilitas tinggi',
                rules: {
                    maxShiftsPerMonth: 22,
                    maxHoursPerMonth: 176,
                    maxConsecutiveDays: 4,
                    maxNightShiftsPerWeek: 3,
                    minRestHoursBetweenShifts: 8,
                    allowOvertime: true,
                    requiresApproval: false
                },
                appliesTo: ['PERAWAT'],
                isActive: true,
                createdBy: 'Admin System',
                lastModified: '2025-07-28'
            },
            {
                id: 3,
                name: 'Kebijakan Staff',
                description: 'Aturan umum untuk staff administratif',
                rules: {
                    maxShiftsPerMonth: 25,
                    maxHoursPerMonth: 200,
                    maxConsecutiveDays: 6,
                    maxNightShiftsPerWeek: 1,
                    minRestHoursBetweenShifts: 8,
                    allowOvertime: true,
                    requiresApproval: false
                },
                appliesTo: ['STAF'],
                isActive: true,
                createdBy: 'Admin System',
                lastModified: '2025-07-28'
            }
        ];

        const mockEmployeeLimits: EmployeeLimit[] = [
            {
                employeeId: 'DOK001',
                name: 'Dr. Ahmad Susanto',
                role: 'DOKTER',
                currentShifts: 18,
                currentHours: 144,
                consecutiveDays: 3,
                status: 'NEAR_LIMIT',
                blockedReasons: [],
                canRequestOvertime: true,
                pendingOvertimeRequests: 1
            },
            {
                employeeId: 'PER001',
                name: 'Ns. Sarah Wijaya',
                role: 'PERAWAT',
                currentShifts: 22,
                currentHours: 176,
                consecutiveDays: 4,
                status: 'AT_LIMIT',
                blockedReasons: ['Mencapai batas maksimal shift bulanan', 'Mencapai batas hari berturut-turut'],
                canRequestOvertime: true,
                pendingOvertimeRequests: 0
            },
            {
                employeeId: 'PER002',
                name: 'Ns. Budi Hartono',
                role: 'PERAWAT',
                currentShifts: 25,
                currentHours: 200,
                consecutiveDays: 5,
                status: 'BLOCKED',
                blockedReasons: ['Melebihi batas maksimal shift', 'Melebihi batas jam kerja', 'Terlalu banyak hari berturut-turut'],
                canRequestOvertime: false,
                pendingOvertimeRequests: 2
            },
            {
                employeeId: 'STF001',
                name: 'Ahmad Wijaya',
                role: 'STAF',
                currentShifts: 15,
                currentHours: 120,
                consecutiveDays: 2,
                status: 'AVAILABLE',
                blockedReasons: [],
                canRequestOvertime: true,
                pendingOvertimeRequests: 0
            }
        ];

        setPolicies(mockPolicies);
        setEmployeeLimits(mockEmployeeLimits);
        setLoading(false);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'text-green-600 bg-green-100 border-green-200';
            case 'NEAR_LIMIT': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'AT_LIMIT': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'BLOCKED': return 'text-red-600 bg-red-100 border-red-200';
            case 'REQUIRES_APPROVAL': return 'text-purple-600 bg-purple-100 border-purple-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return <Unlock className="w-4 h-4" />;
            case 'NEAR_LIMIT': return <AlertTriangle className="w-4 h-4" />;
            case 'AT_LIMIT': return <AlertTriangle className="w-4 h-4" />;
            case 'BLOCKED': return <Lock className="w-4 h-4" />;
            case 'REQUIRES_APPROVAL': return <Shield className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'Tersedia';
            case 'NEAR_LIMIT': return 'Mendekati Batas';
            case 'AT_LIMIT': return 'Mencapai Batas';
            case 'BLOCKED': return 'Diblokir';
            case 'REQUIRES_APPROVAL': return 'Perlu Persetujuan';
            default: return 'Unknown';
        }
    };

    const handleTogglePolicy = (policyId: number) => {
        setPolicies(prev => prev.map(policy => 
            policy.id === policyId 
                ? { ...policy, isActive: !policy.isActive }
                : policy
        ));
    };

    const handleEditPolicy = (policy: WorkloadPolicy) => {
        setSelectedPolicy(policy);
        setIsEditing(true);
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        );
    }

    const statusCounts = {
        available: employeeLimits.filter(emp => emp.status === 'AVAILABLE').length,
        nearLimit: employeeLimits.filter(emp => emp.status === 'NEAR_LIMIT').length,
        atLimit: employeeLimits.filter(emp => emp.status === 'AT_LIMIT').length,
        blocked: employeeLimits.filter(emp => emp.status === 'BLOCKED').length
    };

    return (
        <div className="space-y-6">
            {/* Policy Management */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Shield className="w-6 h-6 mr-3 text-blue-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Kebijakan Beban Kerja</h2>
                                <p className="text-sm text-gray-600">Atur batas maksimal shift dan jam kerja per role</p>
                            </div>
                        </div>
                        
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Tambah Kebijakan</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid gap-4">
                        {policies.map((policy) => (
                            <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${policy.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{policy.name}</h3>
                                            <p className="text-sm text-gray-600">{policy.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            policy.isActive 
                                                ? 'bg-green-100 text-green-600' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {policy.isActive ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        <button
                                            onClick={() => handleTogglePolicy(policy.id)}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            {policy.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button
                                            onClick={() => handleEditPolicy(policy)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Max Shift/Bulan</div>
                                        <div className="text-lg font-bold text-gray-800">{policy.rules.maxShiftsPerMonth}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Max Jam/Bulan</div>
                                        <div className="text-lg font-bold text-gray-800">{policy.rules.maxHoursPerMonth}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Max Hari Berturut-turut</div>
                                        <div className="text-lg font-bold text-gray-800">{policy.rules.maxConsecutiveDays}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Berlaku Untuk</div>
                                        <div className="text-sm font-medium text-gray-800">{policy.appliesTo.join(', ')}</div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                    <span>Dibuat oleh: {policy.createdBy}</span>
                                    <span>Terakhir diubah: {policy.lastModified}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Employee Status Overview */}
            {showEmployeeStatus && (
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <User className="w-6 h-6 mr-3 text-purple-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Status Beban Kerja Pegawai</h2>
                                <p className="text-sm text-gray-600">Monitor status setiap pegawai berdasarkan kebijakan yang berlaku</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Summary */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{statusCounts.available}</div>
                                        <div className="text-sm text-green-700">Tersedia</div>
                                    </div>
                                    <Unlock className="w-8 h-8 text-green-600" />
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-yellow-600">{statusCounts.nearLimit}</div>
                                        <div className="text-sm text-yellow-700">Mendekati Batas</div>
                                    </div>
                                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-orange-600">{statusCounts.atLimit}</div>
                                        <div className="text-sm text-orange-700">Mencapai Batas</div>
                                    </div>
                                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                                </div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-red-600">{statusCounts.blocked}</div>
                                        <div className="text-sm text-red-700">Diblokir</div>
                                    </div>
                                    <Lock className="w-8 h-8 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employee Details */}
                    <div className="p-6">
                        <div className="space-y-4">
                            {employeeLimits.map((employee) => (
                                <div key={employee.employeeId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-full border ${getStatusColor(employee.status)}`}>
                                                {getStatusIcon(employee.status)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                                                <p className="text-sm text-gray-600">{employee.employeeId} • {employee.role}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                                                {getStatusLabel(employee.status)}
                                            </div>
                                            {employee.pendingOvertimeRequests > 0 && (
                                                <div className="text-xs text-purple-600 mt-1">
                                                    {employee.pendingOvertimeRequests} overtime request pending
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Current Usage */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <h4 className="font-medium text-gray-700 mb-2">Penggunaan Saat Ini</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Shift:</span>
                                                    <span className="font-medium">{employee.currentShifts}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Jam:</span>
                                                    <span className="font-medium">{employee.currentHours}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Berturut-turut:</span>
                                                    <span className="font-medium">{employee.consecutiveDays} hari</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Limits */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <h4 className="font-medium text-gray-700 mb-2">Batas Maksimal</h4>
                                            <div className="space-y-2">
                                                {(() => {
                                                    const policy = policies.find(p => p.appliesTo.includes(employee.role) && p.isActive);
                                                    if (!policy) return <div className="text-sm text-gray-500">No policy found</div>;
                                                    
                                                    return (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Shift:</span>
                                                                <span className="font-medium">{policy.rules.maxShiftsPerMonth}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Jam:</span>
                                                                <span className="font-medium">{policy.rules.maxHoursPerMonth}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Berturut-turut:</span>
                                                                <span className="font-medium">{policy.rules.maxConsecutiveDays} hari</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <h4 className="font-medium text-gray-700 mb-2">Tindakan</h4>
                                            <div className="space-y-2">
                                                <button
                                                    disabled={employee.status === 'BLOCKED'}
                                                    className={`w-full px-3 py-2 text-sm rounded-md ${
                                                        employee.status === 'BLOCKED'
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                >
                                                    Assign Shift
                                                </button>
                                                <button
                                                    disabled={!employee.canRequestOvertime}
                                                    className={`w-full px-3 py-2 text-sm rounded-md ${
                                                        !employee.canRequestOvertime
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                                    }`}
                                                >
                                                    Request Overtime
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Blocked Reasons */}
                                    {employee.blockedReasons.length > 0 && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center text-red-800 mb-2">
                                                <Lock className="w-4 h-4 mr-2" />
                                                <span className="font-medium">Alasan Diblokir:</span>
                                            </div>
                                            <ul className="text-sm text-red-700 space-y-1">
                                                {employee.blockedReasons.map((reason, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <span className="text-red-600 mt-0.5">•</span>
                                                        <span>{reason}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkloadPolicySystem;
